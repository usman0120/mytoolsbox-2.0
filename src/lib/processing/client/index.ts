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

export {
  formatJSON,
  validateJSON,
  minifyJSON,
  type JSONFormatOptions,
} from "./json-processor";

export {
  parseCSV,
  csvToJSON,
  jsonToCSV,
  type CSVParseOptions,
} from "./csv-processor";

export {
  renderMarkdown,
  stripMarkdown,
  type MarkdownOptions,
} from "./markdown-processor";

export {
  countWords,
  countCharacters,
  changeCase,
  findAndReplace,
  type CaseType,
  type TextStats,
} from "./text-processor";