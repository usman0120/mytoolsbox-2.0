// ---------------------------------------------------------------------------
// Processing Domain Services – barrel export
// ---------------------------------------------------------------------------

export {
  processImage,
  compressImage,
  resizeImage,
  filterImage,
  type ImageServiceOptions,
} from "./image-service";

export {
  trimVideo,
  convertVideoToGIF,
  type VideoServiceOptions,
} from "./video-service";

export {
  trimAudio,
  convertAudio,
  type AudioServiceOptions,
} from "./audio-service";

export {
  mergePDFs,
  extractPDFPages,
  convertImagesToPDF,
  type PDFServiceOptions,
} from "./pdf-service";