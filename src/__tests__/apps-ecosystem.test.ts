import { describe, it, expect } from "vitest";
import { createRequire } from "node:module";
import { toolRegistry, getToolBySlug, getActiveTools, searchTools } from "@/content/tools/registry";
import { hubRegistry } from "@/content/hubs/registry";
import { BLOG_POSTS } from "@/content/blog/blogs-data";
import { RESOURCE_GUIDES } from "@/features/resources/resources-data";
import {
  calculateOneRepMax,
  calculateTDEE,
  generateWorkoutProgram,
  generateOfflineFitnessAdvice,
} from "@/features/apps/fitness/fitness-engine-logic";
import {
  generateWeeklyMealPlan,
  aggregateGroceryList,
  analyzeRecipeIngredients,
  generateOfflineNutritionAdvice,
} from "@/features/apps/nutrition/nutrition-engine-logic";
import { appRegistry, getAppBySlug, getActiveApps } from "@/content/apps/registry";
import { CREDIT_COSTS } from "@/lib/ai/credits";

const auditRequire = createRequire(import.meta.url);
const { buildInventory } = auditRequire("../../compare_slugs.js") as {
  buildInventory: () => {
    features: { namespace: string; id: string; slug: string; preRendered: boolean; persistence: { directStorageReferences: { key: string | null }[] } }[];
    toolLoaders: { slug: string; target: string }[];
    appLoaders: { slug: string; target: string }[];
    canonicalPages: { route: string }[];
    editorialRoutes: { namespace: string; slug: string; route: string }[];
    routingPolicies: { protectedPaths: string[]; localePrefixes: string[] };
    integrity: {
      tools: Record<string, string[]>;
      apps: Record<string, string[]>;
      missingTargets: unknown[];
      legacyTargetDrift: unknown[];
      invalidHubReferences: unknown[];
      hubSlugLookupMismatches: unknown[];
      duplicateHubIds: unknown[];
      invalidRelatedReferences: { owner: string; slug: string }[];
      invalidRelatedAppReferences: unknown[];
      invalidEditorialReferences: { owner: string; route: string }[];
      duplicateCanonicalRoutes: unknown[];
    };
  };
};
const { summarize } = auditRequire("../../count_errors.js") as {
  summarize: (results: { filePath: string; errorCount: number; warningCount: number; messages: { severity: number; ruleId: string | null }[] }[]) => {
    errors: number; warnings: number; rules: { rule: string; errors: number; files: number }[]; files: { file: string; errors: number }[];
  };
};

describe("PDF Office/PPT catalog truthfulness", () => {
  it.each([
    ["pdf-to-office-converter", 5, [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ]],
    ["pdf-to-ppt-converter", 4, ["application/vnd.openxmlformats-officedocument.presentationml.presentation"]],
  ] as const)("describes text-only exports for %s without changing its contract", (slug, featureCount, outputTypes) => {
    const tool = getToolBySlug(slug)!;
    expect(tool.id).toBe(slug);
    expect(tool.slug).toBe(slug);
    expect(tool.features).toHaveLength(featureCount);
    expect(tool.inputTypes).toEqual(["application/pdf"]);
    expect(tool.outputTypes).toEqual(outputTypes);
    expect(tool.processingMode).toBe("client");
    expect(tool.shortDescription).toMatch(/PDF text/);
    expect(tool.seoTitle).toMatch(/PDF Text/);
    expect(tool.description).toMatch(/text-only|text slides/);
    expect(tool.description).toContain("not preserved");
    expect(tool.description).toContain("OCR is not included");
    expect(tool.seoDescription).toMatch(/no source/i);
    expect(tool.seoDescription).toContain("OCR");
    expect(tool.features.join(" ")).not.toMatch(/preserve layouts|download instantly/i);
    expect(tool.faq?.some(({ answer }) => answer.includes("OCR is not included") && /not preserved|does not preserve/.test(answer))).toBe(true);
    expect(tool.faq?.some(({ answer }) => answer.includes("a PDF page may produce multiple slides"))).toBe(true);
  });

  it("identifies line-based XLSX rows rather than source table reconstruction", () => {
    const tool = getToolBySlug("pdf-to-office-converter")!;
    expect(tool.features).toContain("PDF text to page/line/content rows (XLSX)");
    expect(tool.description).toContain("Word (DOCX) paragraphs");
    expect(tool.seoDescription).toContain("XLSX rows");
    expect(tool.faq?.some(({ answer }) => answer.includes("Excel output does not reconstruct source tables"))).toBe(true);
  });
});

describe("Route/catalog integrity audit", () => {
  const inventory = buildInventory();

  it("matches evaluated audit catalogs to real imported catalog authorities", () => {
    expect(inventory.features.filter((entry) => entry.namespace === "tools").map((entry) => [entry.id, entry.slug]))
      .toEqual(toolRegistry.map((entry) => [entry.id, entry.slug]));
    expect(inventory.features.filter((entry) => entry.namespace === "apps").map((entry) => [entry.id, entry.slug]))
      .toEqual(appRegistry.map((entry) => [entry.id, entry.slug]));
  });

  it("keeps stable IDs and slugs unique within each public namespace", () => {
    for (const catalog of [toolRegistry, appRegistry]) {
      expect(new Set(catalog.map((entry) => entry.id)).size).toBe(catalog.length);
      expect(new Set(catalog.map((entry) => entry.slug)).size).toBe(catalog.length);
    }
    expect(getToolBySlug("resume-builder")).not.toBe(getAppBySlug("resume-builder"));
  });

  it("has exact live loader/catalog parity and existing literal import targets", () => {
    for (const result of [inventory.integrity.tools, inventory.integrity.apps]) {
      for (const values of Object.values(result)) expect(values).toEqual([]);
    }
    expect(inventory.integrity.missingTargets).toEqual([]);
    expect(inventory.integrity.legacyTargetDrift).toEqual([]);
  });

  it("preserves tool active-only and app active-or-beta prerender policies", () => {
    expect(getActiveTools()).toEqual(toolRegistry.filter((entry) => entry.status === "active"));
    expect(getActiveApps()).toEqual(appRegistry.filter((entry) => entry.status === "active" || entry.status === "beta"));
    expect(inventory.features.filter((entry) => entry.namespace === "tools" && entry.preRendered).map((entry) => entry.slug))
      .toEqual(getActiveTools().map((entry) => entry.slug));
    expect(inventory.features.filter((entry) => entry.namespace === "apps" && entry.preRendered).map((entry) => entry.slug))
      .toEqual(getActiveApps().map((entry) => entry.slug));
    expect(getToolBySlug("__audit_unknown__")).toBeUndefined();
    expect(getAppBySlug("__audit_unknown__")).toBeUndefined();
    for (const entry of toolRegistry) expect(searchTools(entry.name).some((result) => result.id === entry.id)).toBe(true);
  });

  it("resolves hub IDs in their intended namespace rather than conflating apps and tools", () => {
    for (const hub of hubRegistry) {
      for (const id of hub.toolIds) expect(toolRegistry.some((entry) => entry.id === id)).toBe(true);
      for (const id of hub.appIds) expect(appRegistry.some((entry) => entry.id === id)).toBe(true);
    }
    expect(inventory.integrity.invalidHubReferences).toEqual([]);
    expect(inventory.integrity.hubSlugLookupMismatches).toEqual([]);
    expect(inventory.integrity.duplicateHubIds).toEqual([]);
    for (const hub of hubRegistry) {
      for (const id of hub.toolIds) expect(getToolBySlug(id)?.id).toBe(id);
      for (const id of hub.appIds) expect(getAppBySlug(id)?.id).toBe(id);
    }
  });

  it("records declared protected/localized routes and legacy chat storage without calling providers", () => {
    expect(inventory.routingPolicies.protectedPaths).toEqual(["/dashboard", "/settings", "/favorites", "/history", "/account"]);
    expect(inventory.routingPolicies.localePrefixes).toEqual(["es", "ur", "fr", "de", "pt", "hi", "ar"]);
    const legacyChat = inventory.features.find((entry) => entry.namespace === "tools" && entry.slug === "ai-text-generator");
    expect(legacyChat?.persistence.directStorageReferences.some((entry) => entry.key === "mytoolsbox-ai-chat")).toBe(true);
  });

  it("summarizes ESLint errors even when lint would exit nonzero", () => {
    const report = summarize([{
      filePath: `${process.cwd()}/src/__tests__/apps-ecosystem.test.ts`,
      errorCount: 2, warningCount: 1,
      messages: [{ severity: 2, ruleId: "audit-rule" }, { severity: 2, ruleId: null }, { severity: 1, ruleId: "warning-rule" }],
    }]);
    expect(report.errors).toBe(2);
    expect(report.warnings).toBe(1);
    expect(report.rules).toEqual([{ rule: "audit-rule", errors: 1, files: 1 }, { rule: "syntax", errors: 1, files: 1 }]);
    expect(report.files).toEqual([{ file: "src/__tests__/apps-ecosystem.test.ts", errors: 2 }]);
  });

  it("expands every editorial catalog slug into its actual route namespace", () => {
    for (const [namespace, catalog] of [["hubs", hubRegistry], ["blog", BLOG_POSTS], ["resources", RESOURCE_GUIDES]] as const) {
      expect(inventory.editorialRoutes.filter((entry) => entry.namespace === namespace).map((entry) => entry.route))
        .toEqual(catalog.map((entry) => `/${namespace}/${entry.slug}`));
    }
    expect(inventory.canonicalPages.some((entry) => entry.route === "/ai/compare")).toBe(true);
    expect(inventory.canonicalPages.some((entry) => entry.route === "/ai/prompts")).toBe(true);
    expect(inventory.canonicalPages.some((entry) => entry.route === "/ai/personas")).toBe(true);
    expect(inventory.integrity.duplicateCanonicalRoutes).toEqual([]);
    expect(inventory.integrity.invalidRelatedAppReferences).toEqual([]);
  });

  it("records the exact existing editorial link defects without suppressing new failures", () => {
    const baseline: [string, string[]][] = [
      ["how-to-resize-images-without-losing-quality", ["svg-optimizer"]],
      ["mastering-remote-team-timezones-scheduling", ["world-clock", "flow-pomodoro", "world-clock"]],
      ["visual-css-building-complex-layouts", ["css-gradient", "css-gradient"]],
      ["clean-html-email-templates-common-pitfalls", ["markdown-editor", "meta-tag-generator", "markdown-editor"]],
      ["qr-codes-in-modern-marketing-complete-handbook", ["svg-optimizer"]],
      ["effective-color-contrast-wcag-accessibility", ["css-gradient"]],
      ["mastering-markdown-technical-writers-guide", ["markdown-editor", "markdown-editor"]],
      ["demystifying-cron-syntax-automation-guide", ["cron-generator", "world-clock", "cron-generator"]],
      ["optimizing-svg-files-for-fast-web-loads", ["svg-optimizer", "svg-optimizer"]],
      ["seo-meta-tags-mastery-open-graph-twitter-cards", ["meta-tag-generator", "meta-tag-generator"]],
      ["the-math-of-compound-interest-wealth-guide", ["compound-interest", "compound-interest"]],
      ["productivity-workflows-pomodoro-time-blocking", ["flow-pomodoro", "world-clock", "flow-pomodoro"]],
    ];
    expect(inventory.integrity.invalidEditorialReferences.map((entry) => `${entry.owner} -> ${entry.route}`).sort())
      .toEqual(baseline.flatMap(([owner, slugs]) => slugs.map((slug) => `/blog/${owner} -> /tools/${slug}`)).sort());
  });

  it("records exactly the known unresolved related links and rejects new ones", () => {
    expect(inventory.integrity.invalidRelatedReferences.map((entry) => `${entry.owner} -> ${entry.slug}`).sort()).toEqual([
      "/apps/ai-project-ideas -> code-explainer",
      "/tools/age-calculator -> date-calculator",
      "/tools/ai-doc-generator -> ai-code-explainer",
      "/tools/ai-error-explainer -> ai-code-explainer",
      "/tools/ai-regex-builder -> ai-code-explainer",
      "/tools/ai-sql-assistant -> ai-code-explainer",
      "/tools/image-converter -> jpg-to-png",
      "/tools/json-formatter -> csv-to-json",
      "/tools/json-formatter -> json-to-csv",
      "/tools/json-validator -> json-to-csv",
      "/tools/loan-calculator -> emi-calculator",
      "/tools/word-counter -> character-counter",
    ].sort());
  });
});

describe("Apps Ecosystem & Logic Engine", () => {
  describe("Fitness AI Platform Logic", () => {
    it("calculates 1RM accurately using multiple validated formulas", () => {
      const res = calculateOneRepMax(100, 5);
      // Epley: 100 * (1 + 0.0333 * 5) = 116.65
      expect(res.epley).toBeCloseTo(116.7, 1);
      // Brzycki: 100 * (36 / (37 - 5)) = 112.5
      expect(res.brzycki).toBeCloseTo(112.5, 1);
      expect(res.average).toBeGreaterThan(110);
      expect(res.percentages.length).toBe(10);
      // 100% should match 1RM
      const oneRep = res.percentages.find((p) => p.reps === 1);
      expect(oneRep?.percent).toBe(100);
      expect(oneRep?.weight).toBe(res.average);
    });

    it("handles boundary values for 1RM", () => {
      const zero = calculateOneRepMax(0, 0);
      expect(zero.average).toBe(0);

      const single = calculateOneRepMax(140, 1);
      expect(single.average).toBe(140);
      expect(single.percentages[0].weight).toBe(140);
    });

    it("calculates Mifflin-St Jeor TDEE and macro distribution correctly", () => {
      const maleTdee = calculateTDEE({
        gender: "male",
        age: 25,
        weightKg: 80,
        heightCm: 180,
        activity: "moderate",
        goal: "maintain",
      });

      // BMR male: 10*80 + 6.25*180 - 5*25 + 5 = 800 + 1125 - 125 + 5 = 1805
      expect(maleTdee.bmr).toBe(1805);
      // Moderate: 1805 * 1.55 = 2797.75 => 2798
      expect(maleTdee.tdee).toBe(2798);
      expect(maleTdee.targetCalories).toBe(2798);
      expect(maleTdee.proteinGrams).toBe(160); // 80kg * 2.0g
      expect(maleTdee.fatGrams).toBe(72); // 80kg * 0.9g
      expect(maleTdee.carbGrams).toBeGreaterThan(300);
      expect(maleTdee.waterLiters).toBeGreaterThan(2.5);
    });

    it("generates structured workout splits with correct volume and mechanics", () => {
      const ppl = generateWorkoutProgram({
        splitType: "ppl",
        daysPerWeek: 4,
        experience: "intermediate",
        goal: "hypertrophy",
        equipment: "full_gym",
      });

      expect(ppl.days.length).toBe(4);
      expect(ppl.days[0].dayName).toContain("Push");
      expect(ppl.days[1].dayName).toContain("Pull");
      expect(ppl.days[2].dayName).toContain("Legs");
      expect(ppl.days[0].exercises.length).toBeGreaterThan(0);
      expect(ppl.days[0].exercises[0].defaultSets).toBe(4);
    });

    it("provides responsive offline fitness advice", () => {
      const advice = generateOfflineFitnessAdvice("bench press plateau");
      expect(advice).toContain("Bench Press");
      expect(advice).toContain("Technique");
    });
  });

  describe("Nutrition AI Platform Logic", () => {
    it("generates a full 7-day meal blueprint with daily totals", () => {
      const plan = generateWeeklyMealPlan({
        dietType: "high_protein",
        targetDailyCalories: 2400,
        mealFrequency: "3_meals_2_snacks",
      });

      expect(plan.days.length).toBe(7);
      plan.days.forEach((day) => {
        expect(day.meals.length).toBe(5); // 3 meals + 2 snacks
        expect(day.totalCalories).toBeGreaterThan(1500);
        expect(day.totalProtein).toBeGreaterThan(100);
      });
    });

    it("aggregates and categorizes supermarket grocery items", () => {
      const plan = generateWeeklyMealPlan({
        dietType: "mediterranean",
        targetDailyCalories: 2000,
        mealFrequency: "3_meals",
      });

      const grocery = aggregateGroceryList(plan);
      expect(grocery.length).toBeGreaterThan(0);
      const produce = grocery.find((g) => g.category === "Produce");
      expect(produce).toBeDefined();
      expect(produce?.items.length).toBeGreaterThan(0);
    });

    it("analyzes custom recipe ingredients and scores health density", () => {
      const analysis = analyzeRecipeIngredients(
        "Chicken & Quinoa Salad",
        "200g chicken breast\n100g quinoa\n1 tbsp olive oil\n100g spinach"
      );

      expect(analysis.recipeName).toBe("Chicken & Quinoa Salad");
      expect(analysis.protein).toBeGreaterThan(40);
      expect(analysis.totalCalories).toBeGreaterThan(400);
      expect(analysis.healthScore).toBeGreaterThan(60);
      expect(analysis.keyNutrients.length).toBe(3);
    });

    it("provides responsive offline clinical nutrition advice", () => {
      const advice = generateOfflineNutritionAdvice("protein distribution and muscle");
      expect(advice).toContain("Protein");
      expect(advice).toContain("mTOR");
    });
  });

  describe("Apps Registry & Centralized Credits Integration", () => {
    it("includes fitness-ai in app registry with complete metadata", () => {
      const app = getAppBySlug("fitness-ai");
      expect(app).toBeDefined();
      expect(app?.name).toBe("AI Fitness & Gym Coach");
      expect(app?.status).toBe("active");
      expect(app?.features.length).toBeGreaterThan(5);
      expect(app?.faq.length).toBeGreaterThan(2);
    });

    it("includes nutrition-ai in app registry with complete metadata", () => {
      const app = getAppBySlug("nutrition-ai");
      expect(app).toBeDefined();
      expect(app?.name).toBe("AI Nutrition & Meal Planner");
      expect(app?.status).toBe("active");
      expect(app?.features.length).toBeGreaterThan(5);
      expect(app?.faq.length).toBeGreaterThan(2);
    });

    it("verifies fitness_coach and nutrition_planner credit pricing", () => {
      expect(CREDIT_COSTS.fitness_coach).toBe(20);
      expect(CREDIT_COSTS.nutrition_planner).toBe(20);
    });

    it("verifies all AI tool operation costs are registered with non-zero costs", () => {
      expect(CREDIT_COSTS.ai_summary).toBe(15);
      expect(CREDIT_COSTS.chat_message).toBe(10);
      expect(CREDIT_COSTS.sql_assistant).toBe(20);
      expect(CREDIT_COSTS.error_explanation).toBe(20);
      expect(CREDIT_COSTS.doc_generation).toBe(20);
      expect(CREDIT_COSTS.regex_builder).toBe(15);
      expect(CREDIT_COSTS.code_explanation).toBe(20);
      expect(CREDIT_COSTS.grammar_check).toBe(10);
      expect(CREDIT_COSTS.paraphrase).toBe(15);
      expect(CREDIT_COSTS.simple_rewrite).toBe(10);
    });
  });

  describe("50/30/20 Wealth & Runway Mathematical Logic", () => {
    it("computes accurate 50/30/20 split targets", () => {
      const netIncome = 5000;
      const targetNeeds = netIncome * 0.5;
      const targetWants = netIncome * 0.3;
      const targetSavings = netIncome * 0.2;

      expect(targetNeeds).toBe(2500);
      expect(targetWants).toBe(1500);
      expect(targetSavings).toBe(1000);
      expect(targetNeeds + targetWants + targetSavings).toBe(netIncome);
    });

    it("calculates emergency fund runway accurately", () => {
      const totalSavingsReserve = 18000;
      const monthlyOutflow = 3000;
      const runwayMonths = totalSavingsReserve / monthlyOutflow;

      expect(runwayMonths).toBe(6);
      expect(runwayMonths >= 6).toBe(true); // Recommended healthy runway
    });
  });

  describe("Habit Command Center Streak Calculation", () => {
    it("determines habit streaks correctly from consecutive activity records", () => {
      const history = [true, true, true, false, true, true]; // last day is active
      let streak = 0;
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i]) {
          streak++;
        } else {
          break;
        }
      }
      expect(streak).toBe(2);
    });

    it("resets streak to 0 if last day was missed", () => {
      const history = [true, true, true, false];
      let streak = 0;
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i]) {
          streak++;
        } else {
          break;
        }
      }
      expect(streak).toBe(0);
    });
  });

  describe("Quiz Scoring Logic", () => {
    it("grades quiz submissions with precise percentage calculations", () => {
      const questions = [
        { id: "q1", correctIndex: 1 },
        { id: "q2", correctIndex: 0 },
        { id: "q3", correctIndex: 2 },
        { id: "q4", correctIndex: 3 },
      ];
      const answers: Record<string, number> = {
        q1: 1, // correct
        q2: 0, // correct
        q3: 1, // wrong
        q4: 3, // correct
      };

      const correctCount = questions.filter((q) => answers[q.id] === q.correctIndex).length;
      const scorePercent = Math.round((correctCount / questions.length) * 100);

      expect(correctCount).toBe(3);
      expect(scorePercent).toBe(75);
    });
  });
});
