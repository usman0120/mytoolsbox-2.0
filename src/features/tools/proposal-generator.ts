export interface ProposalSection {
  id: string;
  title: string;
  content: string;
}

export interface ProposalData {
  title: string;
  clientName: string;
  clientCompany: string;
  date: string;
  preparedBy: string;
  companyName: string;
  sections: ProposalSection[];
}

export const PROPOSAL_TEMPLATES: Record<string, ProposalSection[]> = {
  "General": [
    { id: "executive", title: "Executive Summary", content: "" },
    { id: "scope", title: "Scope of Work", content: "" },
    { id: "timeline", title: "Timeline", content: "" },
    { id: "pricing", title: "Pricing", content: "" },
    { id: "terms", title: "Terms & Conditions", content: "" },
  ],
  "Marketing": [
    { id: "executive", title: "Executive Summary", content: "" },
    { id: "objectives", title: "Campaign Objectives", content: "" },
    { id: "strategy", title: "Marketing Strategy", content: "" },
    { id: "channels", title: "Channels & Tactics", content: "" },
    { id: "budget", title: "Budget Breakdown", content: "" },
    { id: "metrics", title: "KPIs & Measurement", content: "" },
  ],
  "Web Development": [
    { id: "executive", title: "Executive Summary", content: "" },
    { id: "requirements", title: "Technical Requirements", content: "" },
    { id: "design", title: "Design & UX", content: "" },
    { id: "development", title: "Development Plan", content: "" },
    { id: "timeline", title: "Project Timeline", content: "" },
    { id: "pricing", title: "Pricing & Payment", content: "" },
    { id: "maintenance", title: "Maintenance & Support", content: "" },
  ],
  "Consulting": [
    { id: "executive", title: "Executive Summary", content: "" },
    { id: "approach", title: "Our Approach", content: "" },
    { id: "deliverables", title: "Deliverables", content: "" },
    { id: "timeline", title: "Engagement Timeline", content: "" },
    { id: "team", title: "Team", content: "" },
    { id: "fees", title: "Fees & Expenses", content: "" },
  ],
};

export function generateProposalId(): string {
  return `PROP-${Date.now().toString(36).toUpperCase()}`;
}

export function formatProposalDate(date: Date = new Date()): string {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}