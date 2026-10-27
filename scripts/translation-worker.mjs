// Heavy inference is isolated so the parent can enforce deadlines and exit.
import { pipeline, env } from "@xenova/transformers";
let translator;
process.on("message", async ({ id, cacheDirectory, language, inputs }) => {
  try {
    if (!translator) {
      env.cacheDir = cacheDirectory;
      translator = await pipeline("translation", "Xenova/m2m100_418M", { quantized: true, local_files_only: true });
    }
    const results = await translator(inputs, { src_lang: "en", tgt_lang: language, num_beams: 1, do_sample: false, max_new_tokens: 256, no_repeat_ngram_size: 3 });
    if (!Array.isArray(results) || results.length !== inputs.length || results.some((result) => !result.translation_text?.trim())) throw new Error("Invalid local-model output");
    process.send?.({ id, results: results.map((result) => result.translation_text) });
  } catch (error) { process.send?.({ id, error: error.message }); }
});
