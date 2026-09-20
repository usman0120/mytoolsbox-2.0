"use client";

import { useState, useCallback, useRef } from "react";
import type { ProcessingStatus, ProcessingResult } from "@/lib/processing/types";

// ---------------------------------------------------------------------------
// User-friendly error messages mapped from common error patterns
// ---------------------------------------------------------------------------

const ERROR_MESSAGES: Record<string, string> = {
  "file too large": "File is too large. Try a smaller file or upgrade to Pro.",
  "unsupported format": "This file format is not supported.",
  "rate limit": "Too many requests. Please wait a moment and try again.",
  "insufficient credits": "Not enough credits. Upgrade to Pro for more.",
  "network error": "Network error. Check your connection and try again.",
  "timeout": "Processing timed out. Try again with a smaller file.",
  "aborted": "Processing was cancelled.",
  "unauthorized": "Please sign in to use this feature.",
  "payment required": "This feature requires a Pro subscription.",
};

function getUserFriendlyError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    for (const [key, friendly] of Object.entries(ERROR_MESSAGES)) {
      if (message.includes(key)) return friendly;
    }
    return error.message;
  }
  return "An unexpected error occurred. Please try again.";
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

interface UseProcessingOptions {
  /** Called when status changes */
  onStatusChange?: (status: ProcessingStatus) => void;
  /** Called when an error occurs */
  onError?: (error: string) => void;
  /** Called when processing completes successfully */
  onSuccess?: (result: ProcessingResult) => void;
}

interface UseProcessingReturn {
  status: ProcessingStatus;
  result: ProcessingResult | null;
  error: string | null;
  progress: number;
  /** Start processing with an async function */
  process: (fn: () => Promise<ProcessingResult>) => Promise<void>;
  /** Start processing with file upload tracking */
  processWithUpload: (
    uploadFn: () => Promise<ProcessingResult>,
    processFn: (uploadResult: ProcessingResult) => Promise<ProcessingResult>
  ) => Promise<void>;
  /** Reset to idle state */
  reset: () => void;
  /** Cancel the current operation */
  cancel: () => void;
  /** Set a specific error state (e.g., "unsupported", "limit-exceeded") */
  setErrorState: (status: ProcessingStatus, message?: string) => void;
}

export function useProcessing(options: UseProcessingOptions = {}): UseProcessingReturn {
  const { onStatusChange, onError, onSuccess } = options;
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const updateStatus = useCallback(
    (newStatus: ProcessingStatus) => {
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    },
    [onStatusChange]
  );

  const process = useCallback(
    async (fn: () => Promise<ProcessingResult>) => {
      abortRef.current = new AbortController();
      updateStatus("processing");
      setError(null);
      setProgress(10);

      try {
        const res = await fn();
        if (abortRef.current?.signal.aborted) return;

        setResult(res);
        updateStatus(res.status);
        setProgress(100);

        if (res.status === "success") {
          onSuccess?.(res);
        } else if (res.status === "error" || res.status === "limit-exceeded") {
          const msg = res.error ?? res.message ?? "An error occurred";
          setError(msg);
          onError?.(msg);
        }
      } catch (err: unknown) {
        if (abortRef.current?.signal.aborted) return;
        const friendly = getUserFriendlyError(err);
        updateStatus("error");
        setError(friendly);
        onError?.(friendly);
      }
    },
    [updateStatus, onError, onSuccess]
  );

  const processWithUpload = useCallback(
    async (
      uploadFn: () => Promise<ProcessingResult>,
      processFn: (uploadResult: ProcessingResult) => Promise<ProcessingResult>
    ) => {
      abortRef.current = new AbortController();
      updateStatus("uploading");
      setError(null);
      setProgress(5);

      try {
        // Upload phase
        const uploadResult = await uploadFn();
        if (abortRef.current?.signal.aborted) return;

        if (uploadResult.status === "error" || uploadResult.status === "unsupported") {
          setResult(uploadResult);
          updateStatus(uploadResult.status);
          const msg = uploadResult.error ?? uploadResult.message ?? "Upload failed";
          setError(msg);
          onError?.(msg);
          return;
        }

        // Processing phase
        updateStatus("processing");
        setProgress(30);

        const processResult = await processFn(uploadResult);
        if (abortRef.current?.signal.aborted) return;

        setResult(processResult);
        updateStatus(processResult.status);
        setProgress(100);

        if (processResult.status === "success") {
          onSuccess?.(processResult);
        } else if (processResult.status === "error" || processResult.status === "limit-exceeded") {
          const msg = processResult.error ?? processResult.message ?? "Processing failed";
          setError(msg);
          onError?.(msg);
        }
      } catch (err: unknown) {
        if (abortRef.current?.signal.aborted) return;
        const friendly = getUserFriendlyError(err);
        updateStatus("error");
        setError(friendly);
        onError?.(friendly);
      }
    },
    [updateStatus, onError, onSuccess]
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    updateStatus("idle");
    setResult(null);
    setError(null);
    setProgress(0);
  }, [updateStatus]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    updateStatus("cancelled");
  }, [updateStatus]);

  const setErrorState = useCallback(
    (errorStatus: ProcessingStatus, message?: string) => {
      updateStatus(errorStatus);
      setError(message ?? null);
    },
    [updateStatus]
  );

  return {
    status,
    result,
    error,
    progress,
    process,
    processWithUpload,
    reset,
    cancel,
    setErrorState,
  };
}