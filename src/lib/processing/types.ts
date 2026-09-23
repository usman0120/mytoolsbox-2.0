export type ProcessingStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "success"
  | "error"
  | "cancelled"
  | "unsupported"
  | "limit-exceeded";

export interface ProcessingResult {
  status: ProcessingStatus;
  message?: string;
  outputUrl?: string;
  outputBlob?: Blob;
  error?: string;
  data?: unknown;
  metadata?: Record<string, unknown>;
}

export interface ProcessingOptions {
  maxFileSize?: number;
  allowedTypes?: string[];
  quality?: number;
  format?: string;
}