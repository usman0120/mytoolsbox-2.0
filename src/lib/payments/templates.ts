// ---------------------------------------------------------------------------
// Template Monetization
// ---------------------------------------------------------------------------
// Free templates + premium template packs for additional revenue.
// Templates are tool-specific presets that save users time.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TemplateCategory =
  | "documents"
  | "images"
  | "video"
  | "calculators"
  | "developer"
  | "academic"
  | "business"
  | "design"
  | "writing";

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  toolSlug: string;          // Which tool this template is for
  isPremium: boolean;
  packId?: string;           // If premium, which pack it belongs to
  preview?: string;          // Thumbnail or description of output
  config: Record<string, unknown>;  // Tool-specific preset configuration
}

export interface TemplatePack {
  id: string;
  name: string;
  description: string;
  priceUSD: number;
  templateCount: number;
  category: TemplateCategory;
  templates: string[];       // Template IDs in this pack
  previewImages?: string[];
}

// ---------------------------------------------------------------------------
// Free Templates
// ---------------------------------------------------------------------------

export const FREE_TEMPLATES: Template[] = [
  // Documents
  {
    id: "doc_basic_resume",
    name: "Basic Resume",
    description: "Clean, professional resume layout",
    category: "documents",
    toolSlug: "resume-builder",
    isPremium: false,
    config: { style: "clean", sections: ["summary", "experience", "education"] },
  },
  {
    id: "doc_meeting_notes",
    name: "Meeting Notes",
    description: "Standard meeting notes template",
    category: "documents",
    toolSlug: "notes-generator",
    isPremium: false,
    config: { format: "meeting", includeActionItems: true },
  },

  // Images
  {
    id: "img_social_square",
    name: "Social Media Square",
    description: "1:1 square post template",
    category: "images",
    toolSlug: "image-editor",
    isPremium: false,
    config: { width: 1080, height: 1080, format: "png" },
  },

  // Calculators
  {
    id: "calc_basic_roi",
    name: "Basic ROI Calculator",
    description: "Simple return on investment preset",
    category: "calculators",
    toolSlug: "roi-calculator",
    isPremium: false,
    config: { period: "annual", includeTax: false },
  },

  // Developer
  {
    id: "dev_readme_basic",
    name: "Basic README",
    description: "Standard GitHub README structure",
    category: "developer",
    toolSlug: "readme-generator",
    isPremium: false,
    config: { sections: ["title", "description", "install", "usage"] },
  },

  // Academic
  {
    id: "acad_apa_citation",
    name: "APA Citation",
    description: "APA 7th edition citation format",
    category: "academic",
    toolSlug: "citation-generator",
    isPremium: false,
    config: { style: "apa", edition: 7 },
  },

  // Business
  {
    id: "biz_basic_invoice",
    name: "Basic Invoice",
    description: "Simple invoice template",
    category: "business",
    toolSlug: "invoice-generator",
    isPremium: false,
    config: { currency: "USD", includeTax: false },
  },

  // Writing
  {
    id: "write_blog_outline",
    name: "Blog Post Outline",
    description: "Standard blog post structure",
    category: "writing",
    toolSlug: "blog-generator",
    isPremium: false,
    config: { sections: ["intro", "body", "conclusion"], tone: "professional" },
  },
];

// ---------------------------------------------------------------------------
// Premium Template Packs
// ---------------------------------------------------------------------------

export const PREMIUM_TEMPLATE_PACKS: TemplatePack[] = [
  {
    id: "pack_business_pro",
    name: "Business Pro Pack",
    description: "Professional business templates: invoices, proposals, reports, business plans",
    priceUSD: 4.99,
    templateCount: 12,
    category: "business",
    templates: [
      "biz_pro_invoice",
      "biz_pro_proposal",
      "biz_pro_report",
      "biz_pro_business_plan",
      "biz_pro_swot",
      "biz_pro_pitch_deck",
      "biz_pro_financial_model",
      "biz_pro_memo",
      "biz_pro_meeting_agenda",
      "biz_pro_project_charter",
      "biz_pro_stakeholder_update",
      "biz_pro_annual_review",
    ],
  },
  {
    id: "pack_designer_pro",
    name: "Designer Pro Pack",
    description: "Professional design templates: social media, presentations, branding",
    priceUSD: 4.99,
    templateCount: 10,
    category: "design",
    templates: [
      "design_social_carousel",
      "design_presentation_deck",
      "design_brand_kit",
      "design_instagram_story",
      "design_youtube_thumbnail",
      "design_linkedin_banner",
      "design_email_header",
      "design_infographic",
      "design_mockup_frame",
      "design_style_guide",
    ],
  },
  {
    id: "pack_developer_pro",
    name: "Developer Pro Pack",
    description: "Professional dev templates: API docs, architecture diagrams, code reviews",
    priceUSD: 4.99,
    templateCount: 8,
    category: "developer",
    templates: [
      "dev_api_docs_full",
      "dev_architecture_diagram",
      "dev_code_review_template",
      "dev_deployment_checklist",
      "dev_test_plan",
      "dev_changelog",
      "dev_contributing_guide",
      "dev_security_policy",
    ],
  },
  {
    id: "pack_academic_pro",
    name: "Academic Pro Pack",
    description: "Academic templates: research papers, thesis, lab reports, citations",
    priceUSD: 3.99,
    templateCount: 10,
    category: "academic",
    templates: [
      "acad_research_paper",
      "acad_thesis_outline",
      "acad_lab_report",
      "acad_literature_review",
      "acad_poster_presentation",
      "acad_grant_proposal",
      "acad_curriculum_vitae",
      "acad_study_guide",
      "acad_annotated_bibliography",
      "acad_conference_abstract",
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get all free templates.
 */
export function getFreeTemplates(): Template[] {
  return FREE_TEMPLATES;
}

/**
 * Get all premium template packs.
 */
export function getPremiumTemplatePacks(): TemplatePack[] {
  return PREMIUM_TEMPLATE_PACKS;
}

/**
 * Get templates for a specific tool.
 */
export function getTemplatesForTool(toolSlug: string): Template[] {
  return FREE_TEMPLATES.filter((t) => t.toolSlug === toolSlug);
}

/**
 * Get a premium template pack by ID.
 */
export function getTemplatePack(packId: string): TemplatePack | undefined {
  return PREMIUM_TEMPLATE_PACKS.find((p) => p.id === packId);
}

/**
 * Check if a template is premium.
 */
export function isPremiumTemplate(templateId: string): boolean {
  return !FREE_TEMPLATES.some((t) => t.id === templateId);
}

/**
 * Get all templates in a premium pack.
 */
export function getTemplatesInPack(packId: string): string[] {
  const pack = getTemplatePack(packId);
  return pack?.templates ?? [];
}