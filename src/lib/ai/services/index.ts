// ---------------------------------------------------------------------------
// AI Domain Services – barrel export
// ---------------------------------------------------------------------------

export { aiService } from "./base";
export type { AIServiceOptions } from "./base";

export { solveMath } from "./math-solver";
export type { MathSolverInput, MathSolverOutput } from "./math-solver";

export { checkGrammar } from "./grammar-checker";
export type {
  GrammarCheckInput,
  GrammarCheckOutput,
  GrammarIssue,
} from "./grammar-checker";

export { paraphrase } from "./paraphrase-tool";
export type {
  ParaphraseInput,
  ParaphraseOutput,
  ParaphraseVariant,
} from "./paraphrase-tool";

export { generateCitation } from "./citation-generator";
export type { CitationInput, CitationOutput, CitationStyle } from "./citation-generator";

export { summarize } from "./text-summarizer";
export type { SummarizeInput, SummarizeOutput } from "./text-summarizer";

export { formatSQL } from "./sql-formatter";
export type { SQLFormatInput, SQLFormatOutput } from "./sql-formatter";

export { explainCode } from "./code-explainer";
export type { CodeExplainInput, CodeExplainOutput } from "./code-explainer";

export { chat } from "./chat";
export type { ChatInput, ChatOutput, ChatMessage } from "./chat";

export { askFarmingExpert } from "./farming-assistant";
export type { FarmingAssistantInput, FarmingAssistantOutput } from "./farming-assistant";

export { buildRegex } from "./regex-builder";
export type { RegexBuilderInput, RegexBuilderOutput } from "./regex-builder";

export { sqlAssist } from "./sql-assistant";
export type { SQLAssistantInput, SQLAssistantOutput } from "./sql-assistant";

export { generateDocs } from "./doc-generator";
export type { DocGeneratorInput, DocGeneratorOutput } from "./doc-generator";

export { explainError } from "./error-explainer";
export type { ErrorExplainerInput, ErrorExplainerOutput } from "./error-explainer";

export { generateAPIDocs } from "./api-doc-generator";
export type { APIDocGeneratorInput, APIDocGeneratorOutput } from "./api-doc-generator";