// ---------------------------------------------------------------------------
// Direct Upload – Browser → Cloud Storage (bypasses Next.js server)
//
// Flow:
// 1. Browser calls GET /api/upload/presigned?filename=...&contentType=...
// 2. Server generates a presigned URL (S3/R2/GCS) and returns it
// 3. Browser uploads directly to the presigned URL via PUT
// 4. Browser optionally notifies server of completion via POST /api/upload/complete
//
// This avoids routing large files through the Next.js server entirely.
// ---------------------------------------------------------------------------

export interface PresignedUploadRequest {
  filename: string;
  contentType: string;
  /** Size in bytes – server can reject files that are too large */
  size: number;
  /** Optional metadata to store with the file */
  metadata?: Record<string, string>;
}

export interface PresignedUploadResponse {
  /** The presigned URL to PUT the file to */
  uploadUrl: string;
  /** The final public/private URL of the uploaded file */
  fileUrl: string;
  /** Unique file key/ID for later reference */
  fileKey: string;
  /** When the presigned URL expires (ISO timestamp) */
  expiresAt: string;
  /** Any additional headers required for the upload */
  requiredHeaders?: Record<string, string>;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export interface DirectUploadResult {
  success: boolean;
  fileUrl?: string;
  fileKey?: string;
  error?: string;
}

/**
 * Request a presigned upload URL from the server.
 * The server validates the request and returns a time-limited URL.
 */
export async function requestPresignedUrl(
  request: PresignedUploadRequest
): Promise<PresignedUploadResponse> {
  const response = await fetch("/api/upload/presigned", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get presigned URL: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Upload a file directly to cloud storage via a presigned URL.
 * Reports progress via the onProgress callback.
 */
export async function uploadDirectToCloud(
  file: File,
  presigned: PresignedUploadResponse,
  onProgress?: (progress: UploadProgress) => void
): Promise<DirectUploadResult> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({
          loaded: e.loaded,
          total: e.total,
          percent: Math.round((e.loaded / e.total) * 100),
        });
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({
          success: true,
          fileUrl: presigned.fileUrl,
          fileKey: presigned.fileKey,
        });
      } else {
        resolve({
          success: false,
          error: `Upload failed with status ${xhr.status}`,
        });
      }
    });

    xhr.addEventListener("error", () => {
      resolve({
        success: false,
        error: "Network error during upload",
      });
    });

    xhr.addEventListener("abort", () => {
      resolve({
        success: false,
        error: "Upload aborted",
      });
    });

    xhr.open("PUT", presigned.uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);

    // Apply any additional required headers
    if (presigned.requiredHeaders) {
      for (const [key, value] of Object.entries(presigned.requiredHeaders)) {
        xhr.setRequestHeader(key, value);
      }
    }

    xhr.send(file);
  });
}

/**
 * Notify the server that an upload is complete.
 * This allows the server to run post-processing, update databases, etc.
 */
export async function notifyUploadComplete(
  fileKey: string,
  metadata?: Record<string, string>
): Promise<void> {
  await fetch("/api/upload/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileKey, metadata }),
  });
}

/**
 * High-level function: get presigned URL → upload directly → notify completion.
 * This is the recommended way to upload files.
 */
export async function uploadFile(
  file: File,
  options?: {
    metadata?: Record<string, string>;
    onProgress?: (progress: UploadProgress) => void;
  }
): Promise<DirectUploadResult> {
  try {
    // 1. Get presigned URL
    const presigned = await requestPresignedUrl({
      filename: file.name,
      contentType: file.type,
      size: file.size,
      metadata: options?.metadata,
    });

    // 2. Upload directly to cloud
    const result = await uploadDirectToCloud(file, presigned, options?.onProgress);

    // 3. Notify server of completion
    if (result.success && result.fileKey) {
      await notifyUploadComplete(result.fileKey, options?.metadata).catch(() => {
        // Non-critical – upload succeeded even if notification fails
      });
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Create a resumable upload session for very large files.
 * Uses a multipart upload strategy.
 */
export interface MultipartUploadSession {
  uploadId: string;
  fileKey: string;
  partSize: number; // Size of each part in bytes
  totalParts: number;
  parts: { partNumber: number; uploadUrl: string }[];
}

/**
 * Initialize a multipart/resumable upload session.
 */
export async function initMultipartUpload(
  filename: string,
  contentType: string,
  totalSize: number,
  partSize: number = 5 * 1024 * 1024 // 5MB default
): Promise<MultipartUploadSession> {
  const response = await fetch("/api/upload/multipart/init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, contentType, totalSize, partSize }),
  });

  if (!response.ok) {
    throw new Error(`Failed to init multipart upload: ${response.status}`);
  }

  return response.json();
}

/**
 * Upload a single part of a multipart upload.
 */
export async function uploadPart(
  partData: Blob,
  uploadUrl: string,
  partNumber: number,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ partNumber: number; etag: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({
          loaded: e.loaded,
          total: e.total,
          percent: Math.round((e.loaded / e.total) * 100),
        });
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const etag = xhr.getResponseHeader("ETag") ?? "";
        resolve({ partNumber, etag: etag.replace(/"/g, "") });
      } else {
        reject(new Error(`Part ${partNumber} upload failed: ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error(`Part ${partNumber} network error`)));

    xhr.open("PUT", uploadUrl);
    xhr.send(partData);
  });
}

/**
 * Complete a multipart upload by notifying the server with all part ETags.
 */
export async function completeMultipartUpload(
  fileKey: string,
  uploadId: string,
  parts: { partNumber: number; etag: string }[]
): Promise<DirectUploadResult> {
  const response = await fetch("/api/upload/multipart/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileKey, uploadId, parts }),
  });

  if (!response.ok) {
    return { success: false, error: `Multipart completion failed: ${response.status}` };
  }

  const data = await response.json();
  return { success: true, fileUrl: data.fileUrl, fileKey };
}

/**
 * Abort a multipart upload (cleanup).
 */
export async function abortMultipartUpload(
  fileKey: string,
  uploadId: string
): Promise<void> {
  await fetch("/api/upload/multipart/abort", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileKey, uploadId }),
  });
}