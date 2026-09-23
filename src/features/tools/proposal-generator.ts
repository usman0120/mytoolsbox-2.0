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
  budget?: string;
  timeline?: string;
}

export const PROPOSAL_TEMPLATES: Record<string, ProposalSection[]> = {
  "General": [
    { id: "executive", title: "Executive Summary", content: "This proposal outlines our recommended approach to addressing {clientCompany}'s primary goals and challenges." },
    { id: "scope", title: "Scope of Work", content: "We will perform comprehensive analysis, implementation, and handover for {clientName}." },
    { id: "timeline", title: "Timeline", content: "The proposed engagement will span {timeline} with weekly milestone check-ins." },
    { id: "pricing", title: "Investment & Pricing", content: "The total fee for this engagement is estimated at {budget}, payable in milestone installments." },
    { id: "terms", title: "Terms & Acceptance", content: "This proposal remains valid for 30 days from {date}. Acceptance constitutes authorization to proceed." },
  ],
  "Marketing": [
    { id: "executive", title: "Executive Summary", content: "Comprehensive multi-channel marketing campaign designed to increase {clientCompany}'s brand visibility and customer acquisition." },
    { id: "objectives", title: "Campaign Objectives", content: "1. Increase qualified organic traffic by 40%.\n2. Scale paid media ROAS to 3.5x.\n3. Establish cohesive brand identity." },
    { id: "strategy", title: "Marketing Strategy", content: "Content marketing, performance search/social advertising, and conversion rate optimization tailored for {clientCompany}." },
    { id: "channels", title: "Channels & Tactics", content: "Google Ads, LinkedIn B2B campaigns, targeted email automations, and SEO-driven content." },
    { id: "budget", title: "Budget Breakdown", content: "Media Spend: 70% | Strategy & Creative: 20% | Analytics & Reporting: 10%. Total: {budget}." },
    { id: "metrics", title: "KPIs & Measurement", content: "Weekly dashboards tracking CAC, LTV, conversion rates, and pipeline impact." },
  ],
  "Web Development": [
    { id: "executive", title: "Executive Summary", content: "Development of a modern, responsive, high-performance web platform for {clientCompany}." },
    { id: "requirements", title: "Technical Requirements", content: "Next.js application framework, responsive UI with accessible components, performant serverless backend, and SEO optimization." },
    { id: "design", title: "Design & UX", content: "Custom UI design system aligned with brand guidelines, user journey mapping, and mobile-first experience." },
    { id: "development", title: "Development Plan", content: "Sprint-based delivery with continuous integration, automated testing, and staging previews." },
    { id: "timeline", title: "Project Timeline", content: "Estimated duration: {timeline}. Phase 1 Discovery (2 wks), Phase 2 Build (4 wks), Phase 3 Testing & Launch (2 wks)." },
    { id: "pricing", title: "Pricing & Payment", content: "Fixed price of {budget}. 40% deposit, 30% alpha milestone, 30% final sign-off." },
    { id: "maintenance", title: "Maintenance & Support", content: "Includes 30 days post-launch warranty and bug-fixing support." },
  ],
  "Consulting": [
    { id: "executive", title: "Executive Summary", content: "Strategic advisory engagement to evaluate and optimize {clientCompany}'s operational workflow." },
    { id: "approach", title: "Our Approach", content: "Rigorous stakeholder interviews, data analysis, bottleneck identification, and actionable roadmap formulation." },
    { id: "deliverables", title: "Deliverables", content: "Comprehensive assessment report, executive briefing deck, and 90-day implementation blueprint." },
    { id: "timeline", title: "Engagement Timeline", content: "6-week intensive sprint starting upon contract execution." },
    { id: "team", title: "Engagement Team", content: "Led by Senior Strategy Consultant ({preparedBy}) and specialized domain analysts." },
    { id: "fees", title: "Fees & Expenses", content: "Fixed advisory fee of {budget} inclusive of all standard engagement materials." },
  ],
};

export function generateProposalId(): string {
  return `PROP-${Date.now().toString(36).toUpperCase()}`;
}

export function formatProposalDate(date: Date = new Date()): string {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function fillProposalVariables(text: string, data: ProposalData): string {
  const vars: Record<string, string> = {
    clientName: data.clientName || "[Client Name]",
    clientCompany: data.clientCompany || "[Client Company]",
    date: data.date || "[Date]",
    preparedBy: data.preparedBy || "[Prepared By]",
    companyName: data.companyName || "[Your Company]",
    budget: data.budget || "[Budget/Fee]",
    timeline: data.timeline || "[Timeline]",
    title: data.title || "[Proposal Title]",
  };

  return text.replace(/\{([^}]+)\}/g, (match, key) => {
    const trimmed = key.trim();
    return vars[trimmed] !== undefined ? vars[trimmed] : match;
  });
}

export function exportProposalDocument(data: ProposalData): string {
  const lines: string[] = [
    `# ${data.title.toUpperCase()}`,
    "",
    `**Prepared For:** ${data.clientName} (${data.clientCompany})`,
    `**Prepared By:** ${data.preparedBy} (${data.companyName})`,
    `**Date:** ${data.date}`,
    "",
    "---",
    "",
  ];

  data.sections.forEach((sec, idx) => {
    lines.push(`## ${idx + 1}. ${sec.title}`);
    lines.push("");
    lines.push(fillProposalVariables(sec.content, data));
    lines.push("");
  });

  return lines.join("\n");
}