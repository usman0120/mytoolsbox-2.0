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
      { id: "payment", title: "Payment Terms", content: "{Party B} agrees to pay {Party A} the agreed-upon fees within 30 days of invoice receipt. Late payments shall incur interest at 1.5% per month.", optional: false },
      { id: "term", title: "Term & Termination", content: "This agreement shall commence on {Effective Date} and continue until terminated by either party with 30 days written notice.", optional: false },
      { id: "confidentiality", title: "Confidentiality", content: "Both parties agree to maintain the strict confidentiality of all proprietary and business information shared during the course of this agreement.", optional: true },
      { id: "ip", title: "Intellectual Property", content: "All deliverables and intellectual property created under this agreement shall belong exclusively to {Party B} upon full payment.", optional: true },
      { id: "liability", title: "Limitation of Liability", content: "Neither party shall be liable for indirect, incidental, special, or consequential damages arising from or related to this agreement.", optional: true },
      { id: "governing", title: "Governing Law", content: "This agreement shall be governed by and construed in accordance with the laws of the jurisdiction in which {Party A} is registered.", optional: false },
    ],
  },
  "NDA": {
    title: "Non-Disclosure Agreement",
    clauses: [
      { id: "parties", title: "Parties", content: "This Non-Disclosure Agreement is entered into between {Party A} (Disclosing Party) and {Party B} (Receiving Party) as of {Effective Date}.", optional: false },
      { id: "definition", title: "Definition of Confidential Information", content: "Confidential Information includes all non-public technical, business, financial, customer, and marketing data disclosed directly or indirectly.", optional: false },
      { id: "obligations", title: "Obligations of Receiving Party", content: "The Receiving Party agrees to hold Confidential Information in strict confidence, apply reasonable care, and not disclose it to any third party without prior written consent.", optional: false },
      { id: "exclusions", title: "Exclusions", content: "Confidential Information does not include information that is publicly known, rightfully received from a third party without duty of confidentiality, or independently developed.", optional: false },
      { id: "term", title: "Term", content: "This agreement and the obligations of confidentiality shall remain in effect for a period of 3 years from the Effective Date.", optional: false },
      { id: "remedies", title: "Remedies", content: "The Disclosing Party shall be entitled to seek injunctive relief in addition to monetary damages in the event of an actual or threatened breach.", optional: true },
      { id: "return", title: "Return of Materials", content: "Upon written request or termination of this agreement, the Receiving Party shall promptly return or certify destruction of all Confidential Information.", optional: true },
    ],
  },
  "Freelance Contract": {
    title: "Freelance Contract",
    clauses: [
      { id: "parties", title: "Parties", content: "This Freelance Contract is entered into between {Party A} (Client) and {Party B} (Freelancer) on {Effective Date}.", optional: false },
      { id: "scope", title: "Scope of Work", content: "The Freelancer agrees to deliver the designated project milestones and deliverables in accordance with agreed specifications.", optional: false },
      { id: "compensation", title: "Compensation & Milestones", content: "The Client agrees to pay the Freelancer the agreed-upon sum according to the following schedule: 50% upfront deposit, 50% upon final delivery and acceptance.", optional: false },
      { id: "deadlines", title: "Deadlines & Revisions", content: "Deliverables shall be completed by agreed deadlines. Up to two rounds of minor revisions are included in the agreed project fee.", optional: false },
      { id: "ownership", title: "Intellectual Property Rights", content: "Upon receipt of full payment, all intellectual property rights and copyrights in the deliverables shall transfer to the Client.", optional: false },
      { id: "independent", title: "Independent Contractor Status", content: "The Freelancer acts as an independent contractor and is solely responsible for all taxes, insurance, and statutory withholdings.", optional: false },
      { id: "termination", title: "Termination", content: "Either party may terminate this contract with 14 days written notice. In such case, Freelancer shall be compensated for work completed to date.", optional: false },
    ],
  },
};

export function generateContractId(): string {
  return `CNTR-${Date.now().toString(36).toUpperCase()}`;
}

/**
 * Fills variables in contract clauses. Correctly handles keys with spaces like {Party A}, {Effective Date}.
 */
export function fillTemplate(template: string, data: Record<string, string>): string {
  return template.replace(/\{([^}]+)\}/g, (match, key) => {
    const trimmed = key.trim();
    return data[trimmed] !== undefined && data[trimmed] !== "" ? data[trimmed] : match;
  });
}

/**
 * Generates the full formatted contract text in plain text / Markdown.
 */
export function generateContractDocument(
  title: string,
  partyA: string,
  partyB: string,
  effectiveDate: string,
  clauses: ContractClause[]
): string {
  const data: Record<string, string> = {
    "Party A": partyA || "[Party A]",
    "Party B": partyB || "[Party B]",
    "Effective Date": effectiveDate || "[Effective Date]",
    "Date": effectiveDate || "[Date]",
  };

  const lines: string[] = [
    `# ${title.toUpperCase()}`,
    "",
    `**Effective Date:** ${data["Effective Date"]}`,
    `**Between:** ${data["Party A"]} and ${data["Party B"]}`,
    "",
    "---",
    "",
  ];

  clauses.forEach((clause, index) => {
    const filledContent = fillTemplate(clause.content, data);
    lines.push(`### ${index + 1}. ${clause.title}`);
    lines.push("");
    lines.push(filledContent);
    lines.push("");
  });

  lines.push("---");
  lines.push("");
  lines.push("### Signatures");
  lines.push("");
  lines.push(`**${data["Party A"]}**                             **${data["Party B"]}**`);
  lines.push("Signature: _______________________      Signature: _______________________");
  lines.push("Date:      _______________________      Date:      _______________________");

  return lines.join("\n");
}