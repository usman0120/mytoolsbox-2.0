/** LaTeX commands that begin with a letter that is also a JSON escape (\n \r \t \b \f). */
const ESCAPE_LIKE_LATEX =
  /^(neq|ne|nabla|nu|not|neg|ni|newline|nleq|ngeq|times|theta|tau|tan|tanh|text[a-z]*|to|top|tilde|triangle[a-z]*|therefore|right[a-z]*|rho|rangle|rfloor|rceil|beta|bar|binom|bmod|big[a-z]*|bot|boxed|bullet|frac|forall|flat|floor|frown)(?![a-zA-Z])/;

/**
 * Parses a model's JSON reply. Strips code fences and surrounding prose, and repairs LaTeX written
 * with single backslashes (\frac, \pi): those are invalid JSON escapes, or worse, valid ones
 * (\f, \b, \t) that silently corrupt the text. Returns null when the reply is not usable JSON.
 */
export function parseModelJson(text: string): unknown | null {
  const raw = text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  const body = raw.slice(start, end + 1);
  const latexSafe = body.replace(/(?<!\\)\\([a-zA-Z]{2,})/g, (match, word: string) =>
    !"nrtbf".includes(word[0]) || ESCAPE_LIKE_LATEX.test(word) ? `\\\\${word}` : match,
  );
  try {
    return JSON.parse(latexSafe);
  } catch {
    return null;
  }
}
