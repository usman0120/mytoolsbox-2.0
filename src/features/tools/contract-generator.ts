export interface ContractClause {
  id: string;
  title: string;
  content: string;
  optional: boolean;
}

export interface ContractData {
  title: string;
  partyA: string;
  partyB: string;
  date: string;
  effectiveDate: string;
  clauses: ContractClause[];
}

export const CONTRACT_TEMPLATES: Record<string, { title: string; clauses: ContractClause[] }> = {
  "Service Agreement": {
    title: "Service Agreement",
    clauses: [
      { id: "parties", title: "Parties", content: "This Service Agreement is entered into between {Party A} and {Party B}.", optional: false },
      { id: "services", title: "Services", content: "{Party A} agrees to provide the following services to {Party B} as described in the scope of work.", optional: false },
      { id: "payment", title: "Payment Terms", content: "{Party B} agrees to pay {Party A} the agreed-upon fees within 30 days of invoice receipt.", optional: false },
      { id: "term", title: "Term & Termination", content: "This agreement shall commence on {Effective Date} and continue until terminated by either party with 30 days written notice.", optional: false },
      { id: "confidentiality", title: "Confidentiality", content: "Both parties agree to maintain the confidentiality of all proprietary information shared during the course of this agreement.", optional: true },
      { id: "liability", title: "Limitation of Liability", content: "Neither party shall be liable for indirect, incidental, or consequential damages arising from this agreement.", optional: true },
      { id: "governing", title: "Governing Law", content: "This agreement shall be governed by the laws of the state in which {Party A} is registered.", optional: false },
    ],
  },
  "NDA": {
    title: "Non-Disclosure Agreement",
    clauses: [
      { id: "parties", title: "Parties", content: "This Non-Disclosure Agreement is entered into between {Party A} (Disclosing Party) and {Party B} (Receiving Party).", optional: false },
      { id: "definition", title: "Definition of Confidential Information", content: "Confidential Information includes all non-public information, including business plans, financial data, customer lists, trade secrets, and technical information.", optional: false },
      { id: "obligations", title: "Obligations of Receiving Party", content: "The Receiving Party agrees to hold Confidential Information in strict confidence and not disclose it to any third party without prior written consent.", optional: false },
      { id: "exclusions", title: "Exclusions", content: "Confidential Information does not include information that is publicly available, independently developed, or rightfully received from a third party.", optional: false },
      { id: "term", title: "Term", content: "This agreement shall remain in effect for a period of 3 years from the Effective Date.", optional: false },
      { id: "remedies", title: "Remedies", content: "The Disclosing Party is entitled to seek injunctive relief in addition to any other remedies available at law.", optional: true },
    ],
  },
  "Freelance Contract": {
    title: "Freelance Contract",
    clauses: [
      { id: "parties", title: "Parties", content: "This Freelance Contract is between {Party A} (Client) and {Party B} (Freelancer).", optional: false },
      { id: "scope", title: "Scope of Work", content: "The Freelancer agrees to deliver the following deliverables as described in the project brief.", optional: false },
      { id: "compensation", title: "Compensation", content: "The Client agrees to pay the Freelancer the agreed-upon amount. Payment schedule: 50% upfront, 50% upon completion.", optional: false },
      { id: "deadlines", title: "Deadlines", content: "All deliverables shall be completed by the agreed-upon deadlines. Extensions require mutual written agreement.", optional: false },
      { id: "ownership", title: "Intellectual Property", content: "Upon full payment, all intellectual property rights transfer to the Client.", optional: false },
      { id: "independent", title: "Independent Contractor", content: "The Freelancer is an independent contractor and not an employee of the Client.", optional: false },
      { id: "termination", title: "Termination", content: "Either party may terminate this contract with 14 days written notice.", optional: false },
    ],
  },
};

export function generateContractId(): string {
  return `CNTR-${Date.now().toString(36).toUpperCase()}`;
}

export function fillTemplate(template: string, data: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => data[key] ?? `{${key}}`);
}