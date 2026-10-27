import ts from "typescript";

const TEXT_FIELDS = new Set(["title", "label", "description", "shortDescription", "placeholder", "aria-label", "alt", "question", "answer", "message", "error", "name", "text", "heading", "subtitle", "features"]);
const EXCLUDED_FIELDS = new Set(["code", "html", "css", "sql", "prompt", "systemPrompt", "className", "href", "src", "value", "id", "slug"]);
const ENTITIES = { amp: "&", apos: "'", quot: '"', nbsp: " ", middot: "·", ndash: "–", mdash: "—", hellip: "…", rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”", copy: "©", times: "×", rarr: "→", larr: "←", bull: "•" };

export function normalizeText(value) {
  return value.replace(/&([a-z]+);/gi, (match, name) => Object.hasOwn(ENTITIES, name.toLowerCase()) ? ENTITIES[name.toLowerCase()] : match).replace(/\s+/g, " ").trim();
}
export function isHumanText(value, explicit = false) {
  return value.length > 1 && value.length < 2400 && /[A-Za-z]/.test(value)
    && !/https?:|\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b|<\/?\w|=>|@\/|\b(?:const|import|export)\b|\{\s*"|[\w-]+:[\w-]+|"""|```/.test(value)
    && !/^[/#]|^(?:bg-|text-|flex |grid |rounded-|h-|w-|p-|m-|border-|from-|dark:)/.test(value)
    && (explicit || /[a-zA-Z]{2,}\s+[a-zA-Z]{2,}/.test(value));
}
function field(node, source) { return node.name?.getText(source).replace(/^['"]|['"]$/g, "") ?? ""; }
function uiContext(node, source) {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (ts.isVariableDeclaration(parent) && /^(?:SAMPLE|EXAMPLE|PRESET|DEFAULT_DATA|DEFAULT_RESUME|DEFAULT_CV)/.test(parent.name.getText(source))) return false;
    if (ts.isObjectLiteralExpression(parent) && parent.properties.some((property) => ts.isPropertyAssignment(property) && field(property, source) === "type" && ts.isStringLiteralLike(property.initializer) && property.initializer.text === "code")) return false;
    if (ts.isPropertyAssignment(parent) && EXCLUDED_FIELDS.has(field(parent, source))) return false;
    if (ts.isJsxAttribute(parent) && !TEXT_FIELDS.has(field(parent, source))) return false;
    if (ts.isBinaryExpression(parent) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken].includes(parent.operatorToken.kind)) return false;
  }
  const parent = node.parent;
  if (ts.isPropertyAssignment(parent)) return TEXT_FIELDS.has(field(parent, source)) || /auth-errors\.ts$/.test(source.fileName);
  if (ts.isJsxAttribute(parent)) return TEXT_FIELDS.has(field(parent, source));
  for (let ancestor = parent; ancestor; ancestor = ancestor.parent) {
    if (ts.isJsxExpression(ancestor)) return true;
    if (ts.isPropertyAssignment(ancestor) && ts.isArrayLiteralExpression(ancestor.initializer)) return TEXT_FIELDS.has(field(ancestor, source));
    if (ts.isNewExpression(ancestor) && ancestor.expression.getText(source) === "Error") return true;
    if (ts.isCallExpression(ancestor)) {
      const name = ancestor.expression.getText(source);
      return /^toast\.(success|error|info|warning)$|^(?:t|alert|confirm|setError|setStatusMessage|setMessage|setWarning)$/.test(name);
    }
    if (ts.isVariableDeclaration(ancestor) && /ERROR|MESSAGE/.test(ancestor.name.getText(source))) return true;
  }
  return false;
}
export function extractUiStrings(filename, text) {
  const source = ts.createSourceFile(filename, text, ts.ScriptTarget.Latest, true);
  const values = new Set();
  const add = (value, explicit) => { const normalized = normalizeText(value); if (isHumanText(normalized, explicit)) values.add(normalized); };
  const visit = (node) => {
    if (ts.isJsxText(node)) {
      const tag = node.parent?.openingElement?.tagName?.getText(source);
      if (!["pre", "code", "script", "style"].includes(tag)) add(node.text, true);
    } else if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && uiContext(node, source)) add(node.text, true);
    else if (ts.isTemplateExpression(node) && uiContext(node, source)) add(node.head.text + node.templateSpans.map((part, i) => `__MTB_SLOT_${i}__` + part.literal.text).join(""), true);
    ts.forEachChild(node, visit);
  };
  visit(source);
  return [...values];
}
export function parseGenerationOptions(args) {
  const read = (name, fallback, maximum) => {
    const raw = args.find((arg) => arg.startsWith(`--${name}=`))?.split("=")[1];
    const value = raw === undefined ? fallback : Number(raw);
    if (!Number.isFinite(value) || value <= 0 || value > maximum) throw new Error(`--${name} must be between 1 and ${maximum}`);
    return value;
  };
  return { maxStrings: Math.floor(read("max-strings", 50, 100000)), maxMinutes: read("max-minutes", 5, 120), batchSeconds: read("batch-seconds", 60, 300) };
}

export function catalogPayload(language, entries, cache) {
  const translations = Object.fromEntries(entries.filter((entry) => typeof cache[entry] === "string" && cache[entry].trim()).map((entry) => [entry, cache[entry]]));
  return { language, translations, coverage: { total: entries.length, missing: entries.length - Object.keys(translations).length } };
}
