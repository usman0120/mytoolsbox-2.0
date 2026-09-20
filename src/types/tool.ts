export type ToolCategory =
  | "documents"
  | "images"
  | "video"
  | "audio"
  | "writing"
  | "calculators"
  | "developer"
  | "academic"
  | "productivity"
  | "design"
  | "security"
  | "ai"
  | "misc";

export type ToolAudience =
  | "students"
  | "developers"
  | "business"
  | "designers"
  | "writers"
  | "teachers"
  | "researchers"
  | "farmers"
  | "everyone";

export type ProcessingMode = "client" | "server" | "hybrid";

export type ProductType = "tool" | "app" | "ai";

export interface ToolDefinition {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: ToolCategory;
  audiences: ToolAudience[];
  icon: string;
  features: string[];
  inputTypes: string[];
  outputTypes: string[];
  processingMode: ProcessingMode;
  requiresAuth: boolean;
  requiresPro: boolean;
  productType: ProductType;
  seoTitle: string;
  seoDescription: string;
  faq: { question: string; answer: string }[];
  relatedTools: string[];
  keywords: string[];
  status: "active" | "coming-soon" | "beta";
}

export interface CategoryDefinition {
  id: ToolCategory;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export interface HubDefinition {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  audiences: ToolAudience[];
  toolIds: string[];
  appIds: string[];
}