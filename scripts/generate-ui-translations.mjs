// Offline translation refresh. Defaults are bounded; no endless background job.
import { readdir, readFile, mkdir, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
import { extractUiStrings, normalizeText, isHumanText, parseGenerationOptions, catalogPayload } from "./translation-utils.mjs";
import { TranslationRunner } from "./translation-runner.mjs";

const root = process.cwd();
const args = process.argv.slice(2);
const options = parseGenerationOptions(args);
const languages = (process.env.TRANSLATION_LANGUAGES ?? "es,ur,fr,de,pt,hi,ar").split(",");
if (languages.some((language) => !["es", "ur", "fr", "de", "pt", "hi", "ar"].includes(language))) throw new Error("Unsupported language");
const out = path.join(root, "public/i18n");
const sources = new Set();
async function walk(directory) {
  if (directory === path.join(root, "src/lib/i18n")) return;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { if (!["__tests__", "locales"].includes(entry.name)) await walk(file); }
    else if (/\.(ts|tsx)$/.test(file) && !/\.test\.|\.d\.ts$/.test(file)) {
      extractUiStrings(file, await readFile(file, "utf8")).forEach((text) => sources.add(text));
    }
  }
}
function dictionary(text) {
  const source = ts.createSourceFile("locale.ts", text, ts.ScriptTarget.Latest, true);
  const result = Object.create(null);
  const visit = (node) => {
    if (ts.isPropertyAssignment(node) && ts.isStringLiteralLike(node.initializer)) result[node.name.getText(source).replace(/^['"]|['"]$/g, "")] = node.initializer.text;
    ts.forEachChild(node, visit);
  };
  visit(source); return result;
}
async function save(language, entries, cache) {
  const target = path.join(out, `${language}.json`);
  await writeFile(`${target}.tmp`, JSON.stringify(catalogPayload(language, entries, cache), null, 2) + "\n");
  await rename(`${target}.tmp`, target);
}
await mkdir(out, { recursive: true });
await walk(path.join(root, "src"));
const english = dictionary(await readFile(path.join(root, "src/lib/i18n/locales/en.ts"), "utf8"));
Object.values(english).forEach((text) => { const normalized = normalizeText(text); if (isHumanText(normalized, true)) sources.add(normalized); });
const entries = [...sources].sort();
await writeFile(path.join(out, "source.json"), JSON.stringify({ count: entries.length, entries }, null, 2) + "\n");
console.log(`Extracted ${entries.length} UI strings (code, prompts and sample documents excluded).`);
if (args.includes("--extract-only")) process.exit(0);

const catalogs = new Map();
for (const language of languages) {
  let cache = Object.create(null);
  try { const stored = JSON.parse(await readFile(path.join(out, `${language}.json`), "utf8")); cache = stored.translations ?? stored; } catch { /* Seed a new catalog. */ }
  if (!args.includes("--check")) {
    const existing = dictionary(await readFile(path.join(root, `src/lib/i18n/locales/${language}.ts`), "utf8"));
    // Human-maintained translations take precedence over machine guesses.
    for (const [key, text] of Object.entries(english)) if (existing[key]) cache[normalizeText(text)] = existing[key];
    await save(language, entries, cache);
  }
  catalogs.set(language, cache);
  const payload = catalogPayload(language, entries, cache);
  console.log(`${language}: ${payload.coverage.total - payload.coverage.missing}/${payload.coverage.total} covered; ${payload.coverage.missing} missing`);
  if (args.includes("--check") && payload.coverage.missing) process.exitCode = 1;
}
if (args.includes("--check") || args.includes("--seed-only")) process.exit(process.exitCode ?? 0);

const runner = new TranslationRunner(options);
let stopped = false;
const stop = () => { stopped = true; runner.close(); };
process.once("SIGINT", stop); process.once("SIGTERM", stop);
const runTimer = setTimeout(stop, options.maxMinutes * 60_000);
let processed = 0;
try {
  console.log(`Bounded refresh: at most ${options.maxStrings} new strings, ${options.maxMinutes} minutes, ${options.batchSeconds}s per inference batch.`);
  const cacheDirectory = path.join(root, ".data/translation-models");
  const { prepareTranslationWeights } = await import("./download-translation-model.mjs");
  await prepareTranslationWeights(cacheDirectory, { signal: AbortSignal.timeout(Math.max(1, runner.remainingMs())) });
  const perLanguage = Math.ceil(options.maxStrings / languages.length);
  for (const language of languages) {
    const cache = catalogs.get(language);
    const missing = entries.filter((text) => !cache[text]).slice(0, Math.min(perLanguage, options.maxStrings - processed));
    for (let offset = 0; offset < missing.length; offset += 2) {
      if (stopped || !runner.remainingMs()) throw new Error("Translation run time limit reached");
      const batch = missing.slice(offset, offset + 2);
      const fragments = [...new Set(batch.flatMap((text) => text.split(/(__MTB_SLOT_\d+__)/g).filter((part) => part.trim() && !/^__MTB_SLOT_/.test(part))))];
      const chunks = fragments.map((text) => {
        const parts = []; let remaining = text.trim();
        while (remaining.length > 200) { const space = remaining.lastIndexOf(" ", 200); const split = space > 0 ? space : 200; parts.push(remaining.slice(0, split)); remaining = remaining.slice(split).trimStart(); }
        if (remaining) parts.push(remaining); return parts;
      });
      console.log(`${language}: translating ${batch.length} strings (${processed}/${options.maxStrings} completed this run)...`);
      const translated = await runner.translate(chunks.flat(), language, cacheDirectory);
      if (!Array.isArray(translated) || translated.length !== chunks.flat().length || translated.some((text) => typeof text !== "string" || !text.trim())) throw new Error("Invalid translation output");
      let index = 0;
      const lookup = new Map(fragments.map((text, position) => [text, (text.match(/^\s*/)?.[0] ?? "") + chunks[position].map(() => translated[index++]).join(" ") + (text.match(/\s*$/)?.[0] ?? "")]));
      for (const text of batch) cache[text] = text.split(/(__MTB_SLOT_\d+__)/g).map((part) => lookup.get(part) ?? part).join("");
      processed += batch.length;
      await save(language, entries, cache);
      console.log(`${language}: saved checkpoint; ${processed} new strings completed.`);
    }
  }
} catch (error) {
  console.error(`Stopped safely: ${error.message}`);
  process.exitCode = 2;
} finally {
  clearTimeout(runTimer); runner.close();
  process.removeListener("SIGINT", stop); process.removeListener("SIGTERM", stop);
}
console.log(`Finished bounded refresh (${processed} new strings). Run npm run i18n:check to see remaining coverage.`);
