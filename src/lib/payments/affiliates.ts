// ---------------------------------------------------------------------------
// Affiliate Revenue System
// ---------------------------------------------------------------------------
// Recommend relevant products/services to users. Only recommend things
// that are genuinely useful to the user's context.
//
// Categories:
// - Hosting (for developers deploying projects)
// - Domains (for developers registering domains)
// - Software (tools that complement MyToolsBox)
// - Educational platforms (for students/learners)
// - Design resources (for designers)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AffiliateCategory =
  | "hosting"
  | "domains"
  | "software"
  | "education"
  | "design";

export interface AffiliateProduct {
  id: string;
  name: string;
  description: string;
  category: AffiliateCategory;
  url: string;
  affiliateUrl: string;       // Your affiliate link
  logo?: string;
  pricing?: string;
  relevantTo: string[];       // Tool slugs or user contexts
  tags: string[];
  featured?: boolean;
}

// ---------------------------------------------------------------------------
// Affiliate Products Registry
// ---------------------------------------------------------------------------

export const AFFILIATE_PRODUCTS: AffiliateProduct[] = [
  // --- Hosting ---
  {
    id: "host_vercel",
    name: "Vercel",
    description: "Deploy your Next.js apps with zero configuration. The platform MyToolsBox is built on.",
    category: "hosting",
    url: "https://vercel.com",
    affiliateUrl: "https://vercel.com?ref=mytoolsbox",
    pricing: "Free tier available, Pro from $20/mo",
    relevantTo: ["code-explainer", "readme-generator", "api-doc-generator"],
    tags: ["hosting", "nextjs", "deploy", "frontend"],
    featured: true,
  },
  {
    id: "host_netlify",
    name: "Netlify",
    description: "Modern web hosting with git integration, serverless functions, and forms.",
    category: "hosting",
    url: "https://netlify.com",
    affiliateUrl: "https://netlify.com?ref=mytoolsbox",
    pricing: "Free tier available, Pro from $19/mo",
    relevantTo: ["code-explainer", "html-formatter"],
    tags: ["hosting", "jamstack", "deploy"],
  },
  {
    id: "host_railway",
    name: "Railway",
    description: "Instant deployments for any backend. Great for APIs and databases.",
    category: "hosting",
    url: "https://railway.app",
    affiliateUrl: "https://railway.app?ref=mytoolsbox",
    pricing: "Pay-as-you-go, $5 free credit",
    relevantTo: ["api-request-builder", "sql-formatter", "api-doc-generator"],
    tags: ["hosting", "backend", "api", "database"],
  },

  // --- Domains ---
  {
    id: "domain_namecheap",
    name: "Namecheap",
    description: "Affordable domain registration with free WHOIS privacy.",
    category: "domains",
    url: "https://namecheap.com",
    affiliateUrl: "https://namecheap.com?ref=mytoolsbox",
    pricing: "Domains from $5.98/year",
    relevantTo: ["dns-lookup", "ssl-checker", "whois-lookup"],
    tags: ["domains", "dns", "ssl"],
  },
  {
    id: "domain_porkbun",
    name: "Porkbun",
    description: "Surprisingly cheap domains with great UI and free SSL.",
    category: "domains",
    url: "https://porkbun.com",
    affiliateUrl: "https://porkbun.com?ref=mytoolsbox",
    pricing: "Domains from $4.00/year",
    relevantTo: ["dns-lookup", "ssl-checker"],
    tags: ["domains", "dns", "ssl"],
  },

  // --- Software ---
  {
    id: "sw_notion",
    name: "Notion",
    description: "All-in-one workspace for notes, docs, and project management.",
    category: "software",
    url: "https://notion.so",
    affiliateUrl: "https://notion.so?ref=mytoolsbox",
    pricing: "Free, Plus from $10/mo",
    relevantTo: ["notes-generator", "project-ideas", "planning"],
    tags: ["productivity", "notes", "docs", "planning"],
    featured: true,
  },
  {
    id: "sw_figma",
    name: "Figma",
    description: "Collaborative design tool. Great with our design ecosystem tools.",
    category: "software",
    url: "https://figma.com",
    affiliateUrl: "https://figma.com?ref=mytoolsbox",
    pricing: "Free, Professional from $12/mo",
    relevantTo: ["image-editor", "diagram-maker", "color-palette"],
    tags: ["design", "ui", "collaboration"],
    featured: true,
  },
  {
    id: "sw_grammarly",
    name: "Grammarly",
    description: "AI writing assistant for clear, mistake-free writing.",
    category: "software",
    url: "https://grammarly.com",
    affiliateUrl: "https://grammarly.com?ref=mytoolsbox",
    pricing: "Free, Premium from $12/mo",
    relevantTo: ["grammar-checker", "paraphrase-tool", "text-summarizer"],
    tags: ["writing", "grammar", "ai"],
  },

  // --- Education ---
  {
    id: "edu_coursera",
    name: "Coursera",
    description: "Online courses from top universities. Learn programming, design, business.",
    category: "education",
    url: "https://coursera.org",
    affiliateUrl: "https://coursera.org?ref=mytoolsbox",
    pricing: "Free courses, certificates from $49",
    relevantTo: ["code-explainer", "math-solver", "sql-assistant"],
    tags: ["learning", "courses", "certificates"],
  },
  {
    id: "edu_udemy",
    name: "Udemy",
    description: "Affordable courses on every topic. Great for practical skills.",
    category: "education",
    url: "https://udemy.com",
    affiliateUrl: "https://udemy.com?ref=mytoolsbox",
    pricing: "Courses from $12.99 (frequent sales)",
    relevantTo: ["code-explainer", "regex-builder", "sql-assistant"],
    tags: ["learning", "courses", "skills"],
  },
  {
    id: "edu_brilliant",
    name: "Brilliant",
    description: "Interactive math, science, and CS learning. Perfect complement to our math tools.",
    category: "education",
    url: "https://brilliant.org",
    affiliateUrl: "https://brilliant.org?ref=mytoolsbox",
    pricing: "From $13.49/mo",
    relevantTo: ["math-solver", "scientific-calculator", "graphing-calculator"],
    tags: ["math", "science", "interactive", "learning"],
    featured: true,
  },

  // --- Design Resources ---
  {
    id: "design_envato",
    name: "Envato Elements",
    description: "Unlimited downloads of fonts, graphics, templates, and stock assets.",
    category: "design",
    url: "https://elements.envato.com",
    affiliateUrl: "https://elements.envato.com?ref=mytoolsbox",
    pricing: "From $16.50/mo",
    relevantTo: ["image-editor", "diagram-maker", "color-palette"],
    tags: ["design", "assets", "templates", "fonts"],
  },
  {
    id: "design_freepik",
    name: "Freepik",
    description: "Millions of free and premium graphic resources.",
    category: "design",
    url: "https://freepik.com",
    affiliateUrl: "https://freepik.com?ref=mytoolsbox",
    pricing: "Free, Premium from $9/mo",
    relevantTo: ["image-editor", "background-remover"],
    tags: ["design", "vectors", "photos", "icons"],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get affiliate products relevant to a specific tool.
 */
export function getAffiliatesForTool(toolSlug: string): AffiliateProduct[] {
  return AFFILIATE_PRODUCTS.filter((p) => p.relevantTo.includes(toolSlug));
}

/**
 * Get affiliate products by category.
 */
export function getAffiliatesByCategory(category: AffiliateCategory): AffiliateProduct[] {
  return AFFILIATE_PRODUCTS.filter((p) => p.category === category);
}

/**
 * Get featured affiliate products.
 */
export function getFeaturedAffiliates(): AffiliateProduct[] {
  return AFFILIATE_PRODUCTS.filter((p) => p.featured);
}

/**
 * Get affiliate products relevant to a set of user interests (tags).
 */
export function getAffiliatesForInterests(userTags: string[]): AffiliateProduct[] {
  return AFFILIATE_PRODUCTS.filter((p) =>
    p.tags.some((t) => userTags.includes(t))
  );
}

/**
 * Track an affiliate click (for analytics).
 */
export function trackAffiliateClick(productId: string, userId?: string): void {
  // In production: log to Firestore analytics collection
  if (typeof window !== "undefined") {
    console.debug(`[Affiliate] Click: ${productId}`, { userId });
  }
}

/**
 * Get the affiliate URL with user tracking.
 */
export function getAffiliateUrl(productId: string, userId?: string): string | undefined {
  const product = AFFILIATE_PRODUCTS.find((p) => p.id === productId);
  if (!product) return undefined;

  trackAffiliateClick(productId, userId);
  return product.affiliateUrl;
}