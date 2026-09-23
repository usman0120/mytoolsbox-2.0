import { describe, it, expect } from "vitest";
import { executePipeline } from "@/lib/workflow/engine";
import {
  summarizeText,
  generateStudyNotes,
  generateQuiz,
  generatePresentation,
  generateVectorDiagram,
  generateTechnicalDocumentation,
  analyzeError,
  generateProjectArchitect,
  generateProjectPlan,
  generateRegexBuilder,
  solveMathProblem,
  extractTextFromDocument,
  createToolExecutor,
  hasExecutor,
} from "@/lib/workflow/tool-executor";
import { workflowRegistry } from "@/lib/workflow/registry";
import type { WorkflowDefinition } from "@/types/workflow";

describe("Workflow Engine & Algorithmic Tool Executors", () => {
  describe("1. Pure Algorithmic Tool Executors", () => {
    it("summarizeText extracts key sentences with TF-IDF scoring and generates bullet points", () => {
      const sampleText = `
        Artificial Intelligence has revolutionized computing across industries.
        Machine learning models allow software to identify patterns and make predictions without explicit programming.
        Deep neural networks excel at perceptual tasks like computer vision and natural language processing.
        Reinforcement learning teaches autonomous agents optimal decision policies through reward signals.
        Ethical AI frameworks and explainability are essential to ensure fairness, security, and trust.
      `.repeat(3);

      const summary = summarizeText(sampleText);
      expect(summary).toBeTruthy();
      expect(summary).toContain("•");
      expect(summary).toContain("Executive Summary");
      expect(summary.length).toBeLessThan(sampleText.length);
    });

    it("generateStudyNotes produces structured study notes with executive summary and review questions", () => {
      const topic = `
        Microservices architecture decomposes monolithic applications into independent distributed services.
        Each microservice encapsulates a distinct business domain and communicates via REST or gRPC APIs.
        Service meshes manage traffic routing, load balancing, mutual TLS encryption, and telemetry.
        Event-driven architectures decouple services through message queues like Apache Kafka or RabbitMQ.
      `;

      const notes = generateStudyNotes(topic);
      expect(notes).toContain("Comprehensive Study Notes");
      expect(notes).toContain("Executive Summary");
      expect(notes).toContain("Key Concepts & Deep-Dive");
      expect(notes).toContain("Structured Outline");
      expect(notes).toContain("Active Recall & Self-Test Questions");
    });

    it("generateQuiz produces valid multiple-choice questions with answer keys", () => {
      const studyContent = `
        The Krebs cycle occurs inside the mitochondrial matrix of eukaryotic cells.
        It oxidizes acetyl-CoA into carbon dioxide, generating ATP, NADH, and FADH2.
        Glycolysis breaks down glucose into two pyruvate molecules in the cytoplasm.
        The electron transport chain generates the majority of ATP through oxidative phosphorylation.
      `;

      const quiz = generateQuiz(studyContent);
      expect(Array.isArray(quiz.questions)).toBe(true);
      expect(quiz.questions.length).toBeGreaterThanOrEqual(1);

      quiz.questions.forEach((q) => {
        expect(typeof q.question).toBe("string");
        expect(Array.isArray(q.options)).toBe(true);
        expect(q.options.length).toBe(4);
        expect(typeof q.correctIndex).toBe("number");
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(4);
        expect(typeof q.explanation).toBe("string");
      });
      expect(quiz.formattedText).toContain("Knowledge Check & Quiz");
    });

    it("generatePresentation structures content into slide deck with speaker notes", () => {
      const proposal = `
        Next-Generation Realtime Collaboration Engine.
        Modern remote teams require zero-latency document editing and instant presence indicators.
        Conflict-free replicated data types (CRDTs) guarantee convergence across offline and online peers.
        WebRTC data channels provide peer-to-peer data replication with minimal server overhead.
        Expected business impact includes 40% reduction in sync latency and 99.99% availability.
      `;

      const pres = generatePresentation(proposal);
      expect(Array.isArray(pres.slides)).toBe(true);
      expect(pres.slides.length).toBeGreaterThanOrEqual(3);
      expect(pres.formattedText).toContain("SLIDE 1:");
      expect(pres.formattedText).toContain("[Speaker Notes]:");
    });

    it("generateVectorDiagram renders clean, valid SVG vector diagrams", () => {
      const flow = "User Request -> API Gateway -> Auth Service -> Microservice Cluster";

      const svg = generateVectorDiagram(flow);
      expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
      expect(svg).toContain('viewBox="0 0 840 440"');
      expect(svg).toContain("<rect");
      expect(svg).toContain("</svg>");
    });

    it("generateTechnicalDocumentation creates developer documentation with architecture and endpoints", () => {
      const codeOrApi = `
        POST /api/v1/auth/login
        Headers: Content-Type: application/json
        Body: { email, password }
        Returns: { token, expiresIn, user }
      `;

      const docs = generateTechnicalDocumentation(codeOrApi);
      expect(docs).toContain("Technical Documentation:");
      expect(docs).toContain("## 1. System Overview");
      expect(docs).toContain("## 2. Architecture & Design Principles");
      expect(docs).toContain("## 3. Interface & Contract Specifications");
    });

    it("analyzeError dissects stack traces and offers concrete resolutions", () => {
      const errorTrace = `
        TypeError: Cannot read properties of undefined (reading 'map')
        at UserList (src/components/UserList.tsx:24:18)
        at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:14985:18)
      `;

      const diagnosis = analyzeError(errorTrace);
      expect(diagnosis).toContain("Detected Exception: TypeError");
      expect(diagnosis).toContain("Root Cause Analysis");
      expect(diagnosis).toContain("Step-by-Step Resolution");
      expect(diagnosis).toContain("Recommended Code Patch");
    });

    it("generateProjectArchitect and generateProjectPlan produce specs and roadmaps", () => {
      const spec = generateProjectArchitect("Fitness Coach AI");
      expect(spec).toContain("Full-Stack Engineering Spec: Fitness Coach AI");
      expect(spec).toContain("Recommended Technology Stack");
      expect(spec).toContain("Core System Architecture");

      const plan = generateProjectPlan("Fitness Coach AI");
      expect(plan).toContain("Actionable Project Roadmap: Fitness Coach AI");
      expect(plan).toContain("Phase 1: Discovery & Architecture");
      expect(plan).toContain("Phase 2: Core Engineering & Modules");
    });

    it("generateRegexBuilder produces regex with explanations and test cases", () => {
      const regexGuide = generateRegexBuilder("email address format validation");
      expect(regexGuide).toContain("Generated Regular Expression");
      expect(regexGuide).toContain("@");
      expect(regexGuide).toContain("Token Breakdown");
    });

    it("solveMathProblem handles linear equations with step proofs", () => {
      const solution = solveMathProblem("2x + 8 = 20");
      expect(solution).toContain("Step-by-Step Equation Solution: 2x + 8 = 20");
      expect(solution).toContain("Step-by-Step Derivations");
      expect(solution).toContain("6"); // x = 6
    });

    it("extractTextFromDocument handles plain text and base64 document payloads", () => {
      const raw = "Sample raw document content with formatting.";
      expect(extractTextFromDocument(raw)).toBe(raw);

      const dataUrl = `data:text/plain;base64,${Buffer.from("Base64 decoded content").toString("base64")}`;
      expect(extractTextFromDocument(dataUrl)).toBe("Base64 decoded content");
    });
  });

  describe("2. Pipeline Registry & Executor Availability", () => {
    it("all 12 predefined workflows exist in registry with valid steps and executors", () => {
      expect(workflowRegistry.length).toBeGreaterThanOrEqual(12);

      workflowRegistry.forEach((wf) => {
        expect(wf.id).toBeTruthy();
        expect(wf.name).toBeTruthy();
        expect(wf.steps.length).toBeGreaterThanOrEqual(2);
        wf.steps.forEach((step) => {
          expect(hasExecutor(step.toolSlug)).toBe(true);
        });
      });
    });
  });

  describe("3. End-to-End Pipeline Executions", () => {
    const executor = createToolExecutor();

    it("executes documentToStudyNotes pipeline end-to-end", async () => {
      const wf = workflowRegistry.find((w) => w.id === "document-to-study-notes");
      expect(wf).toBeDefined();

      const input = `
        Quantum computing leverages quantum mechanical principles of superposition and entanglement.
        Unlike classical bits that are strictly 0 or 1, quantum bits (qubits) can exist in linear combinations.
        Quantum entanglement allows interconnected qubits to share state instantaneously.
        Shor's algorithm can factor large integers exponentially faster than classical algorithms.
        Grover's algorithm provides a quadratic speedup for unstructured database search problems.
      `;

      const state = await executePipeline(wf!, input, executor);
      expect(state.overallStatus).toBe("completed");
      expect(state.steps.length).toBe(wf!.steps.length);
      state.steps.forEach((s) => {
        expect(s.status).toBe("completed");
        expect(s.output).toBeDefined();
      });

      const finalOutput = state.steps[state.steps.length - 1].output as { result?: string };
      expect(finalOutput?.result).toBeDefined();
      expect(finalOutput.result?.length).toBeGreaterThan(50);
    });

    it("executes pdfToPresentation pipeline end-to-end", async () => {
      const wf = workflowRegistry.find((w) => w.id === "pdf-to-presentation");
      expect(wf).toBeDefined();

      const input = `
        Cloud Cost Optimization Strategy.
        Modern cloud deployments require continuous monitoring of compute, storage, and networking resources.
        Right-sizing virtual machine instances and leveraging spot instances reduces compute spend by up to 60%.
        Automating shutdown schedules for non-production environments prevents idle resource wastage.
      `;

      const state = await executePipeline(wf!, input, executor);
      expect(state.overallStatus).toBe("completed");
      const finalOutput = state.steps[state.steps.length - 1].output as { result?: string };
      expect(finalOutput?.result).toContain("SLIDE");
    });

    it("executes ideaToDiagram pipeline end-to-end", async () => {
      const wf = workflowRegistry.find((w) => w.id === "idea-to-diagram");
      expect(wf).toBeDefined();

      const input = "Build an AI-powered fitness tracking application with real-time pose estimation";
      const state = await executePipeline(wf!, input, executor);
      expect(state.overallStatus).toBe("completed");
      const finalOutput = state.steps[state.steps.length - 1].output as { result?: string };
      expect(finalOutput?.result).toContain("<svg");
      expect(finalOutput?.result).toContain("</svg>");
    });

    it("executes imageToMathSolution pipeline end-to-end with mathematical step proof", async () => {
      const wf = workflowRegistry.find((w) => w.id === "image-to-math-solution");
      expect(wf).toBeDefined();

      const equationInput = "2x + 8 = 20";
      const state = await executePipeline(wf!, equationInput, executor);
      expect(state.overallStatus).toBe("completed");
      const mathStepOutput = state.steps[1].output as { result?: string };
      expect(mathStepOutput?.result).toContain("Step-by-Step");
      expect(mathStepOutput?.result).toContain("6"); // 2x = 12 => x = 6
    });

    it("executes errorDebuggingPipeline end-to-end", async () => {
      const wf = workflowRegistry.find((w) => w.id === "error-debugging-pipeline");
      expect(wf).toBeDefined();

      const errorTrace = `
        TypeError: Cannot read properties of undefined (reading 'token')
        at AuthMiddleware (src/middleware/auth.ts:18:22)
      `;

      const state = await executePipeline(wf!, errorTrace, executor);
      expect(state.overallStatus).toBe("completed");
      const finalOutput = state.steps[state.steps.length - 1].output as { result?: string };
      expect(finalOutput?.result).toBeDefined();
    });

    it("handles abort signal gracefully during pipeline execution", async () => {
      const controller = new AbortController();
      controller.abort(); // Pre-aborted

      const wf = workflowRegistry[0];
      const state = await executePipeline(wf, "test input", executor, { signal: controller.signal });
      expect(state.overallStatus).toBe("cancelled");
    });

    it("executes custom dynamic user pipeline built on the fly", async () => {
      const customWorkflow: WorkflowDefinition = {
        id: "custom-test-pipeline",
        name: "Cleaner into Case Converter",
        shortDescription: "Custom test",
        description: "Custom test pipeline",
        icon: "Workflow",
        inputType: "text/plain",
        outputType: "text/plain",
        categories: ["custom"],
        keywords: [],
        estimatedTime: "2s",
        steps: [
          {
            id: "s1",
            toolSlug: "text-cleaner",
            label: "Text Cleaner",
            productType: "tool",
            inputTypes: ["text/plain"],
            outputTypes: ["text/plain"],
            requiresAuth: false,
            requiresPro: false,
            config: { removeExtraSpaces: true },
          },
          {
            id: "s2",
            toolSlug: "case-converter",
            label: "Case Converter",
            productType: "tool",
            inputTypes: ["text/plain"],
            outputTypes: ["text/plain"],
            requiresAuth: false,
            requiresPro: false,
            config: { case: "upper" },
          },
        ],
      };

      const state = await executePipeline(customWorkflow, "   hello   world   pipeline   ", executor);
      expect(state.overallStatus).toBe("completed");
      expect(state.steps.length).toBe(2);
      const finalOutput = state.steps[1].output as { result?: string };
      expect(finalOutput.result).toBe("HELLO WORLD PIPELINE");
    });
  });
});
