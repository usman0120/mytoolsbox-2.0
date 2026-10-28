import { cp, mkdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
const source = path.resolve("node_modules/pdfjs-dist");
const target = path.resolve("public/pdfjs");
const version = JSON.parse(await readFile(path.join(source, "package.json"), "utf8")).version;
try {
  if (JSON.parse(await readFile(path.join(target, "version.json"), "utf8")).version === version && (await stat(path.join(target, "pdf.min.mjs"))).size > 0 && (await stat(path.join(target, "pdf.worker.min.mjs"))).size > 0 && (await stat(path.join(target, "standard_fonts"))).isDirectory() && (await stat(path.join(target, "cmaps"))).isDirectory() && (await stat(path.join(target, "wasm"))).isDirectory()) {
    console.log("Same-origin PDF.js assets are already up to date."); process.exit(0);
  }
} catch { /* Generate missing assets. */ }
await mkdir(target, { recursive: true });
await cp(path.join(source, "build/pdf.min.mjs"), path.join(target, "pdf.min.mjs"));
await cp(path.join(source, "build/pdf.worker.min.mjs"), path.join(target, "pdf.worker.min.mjs"));
for (const folder of ["cmaps", "standard_fonts", "wasm"]) await cp(path.join(source, folder), path.join(target, folder), { recursive: true });
await writeFile(path.join(target, "version.json"), JSON.stringify({ version }));
console.log("PDF.js worker, fonts and decoders prepared for same-origin local workflows.");
