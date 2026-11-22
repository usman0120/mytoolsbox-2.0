import { cp, mkdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
const source = path.resolve("node_modules/pdfjs-dist");
const target = path.resolve("public/pdfjs");
const version = JSON.parse(await readFile(path.join(source, "package.json"), "utf8")).version;
let pdfFresh = false;
try {
  pdfFresh = JSON.parse(await readFile(path.join(target, "version.json"), "utf8")).version === version && (await stat(path.join(target, "pdf.min.mjs"))).size > 0 && (await stat(path.join(target, "pdf.worker.min.mjs"))).size > 0 && (await stat(path.join(target, "standard_fonts"))).isDirectory() && (await stat(path.join(target, "cmaps"))).isDirectory() && (await stat(path.join(target, "wasm"))).isDirectory();
} catch { /* Generate missing assets. */ }
if (!pdfFresh) {
  await mkdir(target, { recursive: true });
  await cp(path.join(source, "build/pdf.min.mjs"), path.join(target, "pdf.min.mjs"));
  await cp(path.join(source, "build/pdf.worker.min.mjs"), path.join(target, "pdf.worker.min.mjs"));
  for (const folder of ["cmaps", "standard_fonts", "wasm"]) await cp(path.join(source, folder), path.join(target, folder), { recursive: true });
  await writeFile(path.join(target, "version.json"), JSON.stringify({ version }));
  console.log("PDF.js worker, fonts and decoders prepared for same-origin local workflows.");
}

// Excalidraw fonts, served same-origin (window.EXCALIDRAW_ASSET_PATH = "/excalidraw/").
{
  const exSource = path.resolve("node_modules/@excalidraw/excalidraw");
  const exTarget = path.resolve("public/excalidraw");
  const exVersion = JSON.parse(await readFile(path.join(exSource, "package.json"), "utf8")).version;
  let fresh = false;
  try {
    fresh = JSON.parse(await readFile(path.join(exTarget, "version.json"), "utf8")).version === exVersion;
  } catch { /* copy */ }
  if (!fresh) {
    await mkdir(exTarget, { recursive: true });
    await cp(path.join(exSource, "dist/prod/fonts"), path.join(exTarget, "fonts"), { recursive: true });
    await writeFile(path.join(exTarget, "version.json"), JSON.stringify({ version: exVersion }));
    console.log("Excalidraw fonts prepared.");
  }
}
