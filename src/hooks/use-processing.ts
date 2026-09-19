"use client";

import { useState, useCallback, useRef } from "react";
import { ProcessingStatus, ProcessingResult, ProcessingOptions } from "@/lib/processing/types";

interface UseProcessingReturn {
  status: ProcessingStatus;
  result: ProcessingResult | null;
  error: string | null;
  progress: number;
  process: (fn: () => Promise<ProcessingResult>) => Promise<void>;
  reset: () => void;
  cancel: () => void;
}

export function useProcessing(): UseProcessingReturn {
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const process = useCallback(async (fn: () => Promise<ProcessingResult>) => {
    abortRef.current = new AbortController();
    setStatus("processing");
    setError(null);
    setProgress(10);

    try {
      const res = await fn();
      if (abortRef.current?.signal.aborted) return;

      setResult(res);
      setStatus(res.status);
      setProgress(100);
    } catch (err: any) {
      if (abortRef.current?.signal.aborted) return;
      setStatus("error");
      setError(err?.message || "An unexpected error occurred");
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setStatus("idle");
    setResult(null);
    setError(null);
    setProgress(0);
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setStatus("cancelled");
  }, []);

  return { status, result, error, progress, process, reset, cancel };
}