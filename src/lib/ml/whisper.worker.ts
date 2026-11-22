/// <reference lib="webworker" />
// Speech to text with Whisper in a Web Worker. Audio never leaves the device.
import { env, pipeline, WhisperTextStreamer, type AutomaticSpeechRecognitionPipeline, type ProgressInfo } from "@huggingface/transformers";
import { WHISPER_MODELS, expectedChunks, type WhisperChunk, type WhisperModel, type WhisperRequest, type WhisperResponse } from "./whisper-models";

env.allowLocalModels = false;
env.useBrowserCache = true;

const loaded = new Map<WhisperModel, Promise<AutomaticSpeechRecognitionPipeline>>();

function post(msg: WhisperResponse) {
  (self as unknown as DedicatedWorkerGlobalScope).postMessage(msg);
}

function load(model: WhisperModel, id: number) {
  let p = loaded.get(model);
  if (!p) {
    p = pipeline("automatic-speech-recognition", WHISPER_MODELS[model].repo, {
      dtype: "q8",
      device: "wasm",
      progress_callback: (info: ProgressInfo) => {
        if (info.status === "progress_total") post({ id, type: "download", loaded: info.loaded, total: info.total });
      },
    }) as Promise<AutomaticSpeechRecognitionPipeline>;
    p.catch(() => loaded.delete(model));
    loaded.set(model, p);
  }
  return p;
}

self.onmessage = async (e: MessageEvent<WhisperRequest>) => {
  const { id, model, audio, language, task } = e.data;
  try {
    const asr = await load(model, id);
    const total = expectedChunks(audio.length / 16000);
    let done = 0;
    let text = "";
    post({ id, type: "progress", done, total, text });
    const streamer = new WhisperTextStreamer(asr.tokenizer as ConstructorParameters<typeof WhisperTextStreamer>[0], {
      callback_function: (t: string) => {
        text += t;
        post({ id, type: "progress", done, total, text });
      },
      on_finalize: () => {
        done = Math.min(total, done + 1);
        post({ id, type: "progress", done, total, text });
      },
    });
    const out = (await asr(audio, {
      language: language || undefined,
      task,
      chunk_length_s: 30,
      stride_length_s: 5,
      return_timestamps: true,
      streamer,
    })) as { text: string; chunks?: WhisperChunk[] };
    post({ id, type: "done", text: out.text.trim(), chunks: out.chunks ?? [] });
  } catch (err) {
    post({ id, type: "error", message: err instanceof Error ? err.message : String(err) });
  }
};
