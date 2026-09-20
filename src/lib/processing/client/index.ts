// ---------------------------------------------------------------------------
// Client Processors – barrel export
// ---------------------------------------------------------------------------

export {
  processImageClient,
  cropImageClient,
  rotateImageClient,
  watermarkImageClient,
  removeImageMetadataClient,
  type ImageProcessOptions,
  type ImageFilters,
  type CropOptions,
  type WatermarkOptions,
} from "./image-processor";

export {
  trimAudioClient,
  convertAudioClient,
  type AudioTrimOptions,
  type AudioConvertOptions,
} from "./audio-processor";

export {
  mergePDFsClient,
  extractPDFPagesClient,
  imagesToPDFClient,
  type PDFMergeInput,
  type PDFExtractOptions,
  type ImagesToPDFOptions,
} from "./pdf-processor";

export {
  trimVideoClient,
  videoToGIFClient,
  type VideoTrimOptions,
  type VideoToGIFOptions,
} from "./video-processor";