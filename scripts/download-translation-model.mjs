import { mkdir, stat, writeFile, rename } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

// Public MIT-licensed model weights. SHA-256 is the repository's LFS object ID.
const files = [
  { name: "encoder_model_quantized.onnx", size: 287856370, sha: "13a94e354a9140764eb81102d77d3ec6952d796e6f113c651eeb3c3443da0386" },
  { name: "decoder_model_merged_quantized.onnx", size: 344128178, sha: "007654bcabb6cea6fd3bde34ce933137b431330b3755781145d7b6906270b45a" },
];
async function size(file) { try { return (await stat(file)).size; } catch { return 0; } }
async function checksum(file) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest("hex");
}

export async function prepareTranslationWeights(cacheDirectory, { signal } = {}) {
  const directory = path.join(cacheDirectory, "Xenova/m2m100_418M/onnx");
  await mkdir(directory, { recursive: true });
  for (const file of files) {
    signal?.throwIfAborted();
    const target = path.join(directory, file.name);
    if (await size(target) === file.size && await checksum(target) === file.sha) continue;
    const partial = `${target}.part`;
    let offset = await size(partial);
    if (offset > file.size) throw new Error("Invalid partial model length; refusing to overwrite it.");
    console.log(`${file.name}: resuming at ${Math.round(offset / 1048576)} / ${Math.round(file.size / 1048576)} MB`);
    while (offset < file.size) {
      signal?.throwIfAborted();
      const end = Math.min(file.size - 1, offset + 4 * 1024 * 1024 - 1);
      let bytes;
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 60_000);
          try {
            const response = await fetch(`https://huggingface.co/Xenova/m2m100_418M/resolve/main/onnx/${file.name}`, { headers: { Range: `bytes=${offset}-${end}` }, signal: signal ? AbortSignal.any([signal, controller.signal]) : controller.signal });
            if (response.status === 401 || response.status === 403 || response.status === 429) throw new Error(`Model download unavailable (HTTP ${response.status}).`);
            if (response.status !== 206 || response.headers.get("content-range") !== `bytes ${offset}-${end}/${file.size}`) throw new Error("Server did not supply the requested model byte range.");
            bytes = new Uint8Array(await response.arrayBuffer());
            if (bytes.length !== end - offset + 1) throw new Error("Incomplete model chunk");
          } finally { clearTimeout(timeout); controller.abort(); }
          break;
        } catch (error) {
          signal?.throwIfAborted();
          if (attempt === 3 || /HTTP (401|403|429)|byte range/.test(error.message)) throw error;
          await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
        }
      }
      await writeFile(partial, bytes, { flag: "a" });
      offset += bytes.length;
      if (offset % (32 * 1048576) < bytes.length || offset === file.size) console.log(`${file.name}: ${Math.round(offset / 1048576)} / ${Math.round(file.size / 1048576)} MB`);
    }
    if (await checksum(partial) !== file.sha) throw new Error("Model checksum mismatch; the incomplete model was not activated.");
    await rename(partial, target);
  }
}
