// Whisper models (MIT). Shared by the worker and the UI; no heavy imports.

export type WhisperModel = "fast" | "accurate";

export const WHISPER_MODELS: Record<WhisperModel, { repo: string; label: string; sizeMb: number }> = {
  fast: { repo: "onnx-community/whisper-tiny", label: "Fast", sizeMb: 41 },
  accurate: { repo: "onnx-community/whisper-base", label: "Accurate", sizeMb: 77 },
};

export const LANGUAGES: [string, string][] = [
  ["", "Detect automatically"],
  ["en", "English"],
  ["ur", "Urdu"],
  ["hi", "Hindi"],
  ["ar", "Arabic"],
  ["bn", "Bengali"],
  ["pa", "Punjabi"],
  ["fa", "Persian"],
  ["es", "Spanish"],
  ["fr", "French"],
  ["de", "German"],
  ["it", "Italian"],
  ["pt", "Portuguese"],
  ["nl", "Dutch"],
  ["tr", "Turkish"],
  ["ru", "Russian"],
  ["uk", "Ukrainian"],
  ["pl", "Polish"],
  ["id", "Indonesian"],
  ["ms", "Malay"],
  ["zh", "Chinese"],
  ["ja", "Japanese"],
  ["ko", "Korean"],
  ["vi", "Vietnamese"],
  ["th", "Thai"],
  ["sw", "Swahili"],
];

export type WhisperRequest = { id: number; model: WhisperModel; audio: Float32Array; language: string; task: "transcribe" | "translate" };

export type WhisperChunk = { timestamp: [number, number | null]; text: string };

export type WhisperResponse =
  | { id: number; type: "download"; loaded: number; total: number }
  | { id: number; type: "progress"; done: number; total: number; text: string }
  | { id: number; type: "done"; text: string; chunks: WhisperChunk[] }
  | { id: number; type: "error"; message: string };

/** Chunks the pipeline will process for 30 s windows with 5 s stride on each side. */
export const expectedChunks = (seconds: number) => Math.max(1, Math.ceil(Math.max(0, seconds - 30) / 20) + 1);
