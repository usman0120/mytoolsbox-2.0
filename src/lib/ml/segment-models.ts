// Segmentation models (both Apache-2.0). Shared by the worker and the UI; no heavy imports.

export type SegmentModel = "person" | "object";

export const SEGMENT_MODELS: Record<SegmentModel, { repo: string; label: string; sizeMb: number }> = {
  person: { repo: "Xenova/modnet", label: "Person", sizeMb: 7 },
  object: { repo: "onnx-community/ormbg-ONNX", label: "Any object", sizeMb: 44 },
};

export type SegmentRequest = { id: number; model: SegmentModel; bitmap: ImageBitmap };

export type SegmentResponse =
  | { id: number; type: "progress"; loaded: number; total: number }
  | { id: number; type: "running" }
  | { id: number; type: "done"; mask: Uint8Array; width: number; height: number }
  | { id: number; type: "error"; message: string };
