"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Film, Upload, Download, Loader2, CheckCircle2, XCircle,
  FileDown, Settings2,
} from "lucide-react";

type QualityLevel = "low" | "medium" | "high";

const QUALITY_CONFIG: Record<QualityLevel, { bitrate: number; scale: number; label: string }> = {
  low: { bitrate: 1000000, scale: 0.5, label: "Low (smaller file)" },
  medium: { bitrate: 2500000, scale: 0.75, label: "Medium (balanced)" },
  high: { bitrate: 5000000, scale: 1.0, label: "High (best quality)" },
};

export function VideoCompressorEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState<QualityLevel>("medium");
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setError(null);
    setOutputUrl(null);

    if (!selected.type.startsWith("video/")) {
      setError("Please select a valid video file.");
      return;
    }

    if (selected.size > 500 * 1024 * 1024) {
      setError("File size must be under 500MB.");
      return;
    }

    setFile(selected);
    setOriginalSize(selected.size);
  }, []);

  const handleCompress = useCallback(async () => {
    if (!file) return;
    setIsCompressing(true);
    setError(null);
    setProgress(0);

    try {
      const config = QUALITY_CONFIG[quality];
      const videoUrl = URL.createObjectURL(file);

      // Create video element to get dimensions
      const video = document.createElement("video");
      video.src = videoUrl;
      video.muted = true;

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("Failed to load video"));
        video.load();
      });

      setProgress(10);

      const width = Math.round(video.videoWidth * config.scale);
      const height = Math.round(video.videoHeight * config.scale);

      // Capture video frames to canvas and record
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;

      const stream = canvas.captureStream(30);
      const audioContext = new AudioContext();
      const source = audioContext.createMediaElementSource(video);
      const dest = audioContext.createMediaStreamDestination();
      source.connect(dest);
      source.connect(audioContext.destination);

      const combinedStream = new MediaStream([
        ...stream.getVideoTracks(),
        ...dest.stream.getAudioTracks(),
      ]);

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: config.bitrate,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setCompressedSize(blob.size);
        const url = URL.createObjectURL(blob);
        setOutputUrl(url);
        setOutputName(file.name.replace(/\.[^.]+$/, "_compressed.webm"));
        setProgress(100);
        URL.revokeObjectURL(videoUrl);
        audioContext.close();
        toast.success("Video compressed successfully!");
      };

      // Draw frames while recording
      video.currentTime = 0;
      await video.play();

      mediaRecorder.start();
      setProgress(20);

      const drawFrame = () => {
        if (video.ended || video.paused) return;
        ctx.drawImage(video, 0, 0, width, height);
        const elapsed = video.currentTime;
        const total = video.duration;
        const pct = 20 + Math.round((elapsed / total) * 70);
        setProgress(Math.min(pct, 95));
        requestAnimationFrame(drawFrame);
      };

      drawFrame();

      video.onended = () => {
        mediaRecorder.stop();
        video.pause();
      };

      // Safety timeout
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
      }, (video.duration + 5) * 1000);

    } catch (err) {
      const message = err instanceof Error ? err.message : "Compression failed";
      setError(message);
      toast.error("Compression failed: " + message);
    } finally {
      setIsCompressing(false);
    }
  }, [file, quality]);

  const reductionPercent = originalSize && compressedSize
    ? Math.round((1 - compressedSize / originalSize) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <Badge variant="outline" className="gap-1.5">
        <FileDown className="h-3.5 w-3.5" /> Video Compressor
      </Badge>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload Video</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            {file ? (
              <div className="space-y-2">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Film className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="font-medium">Drop video here or click to browse</p>
                <p className="text-sm text-muted-foreground">MP4, WebM, MOV — Max 500MB</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quality selector */}
      <Card>
        <CardContent className="py-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              <span className="text-sm font-medium">Compression Quality</span>
            </div>
            <div className="flex gap-2">
              {(Object.keys(QUALITY_CONFIG) as QualityLevel[]).map((q) => (
                <Button
                  key={q}
                  variant={quality === q ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQuality(q)}
                  className="flex-1"
                >
                  {QUALITY_CONFIG[q].label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {isCompressing && (
        <Card>
          <CardContent className="py-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Compressing... {progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {outputUrl && (
        <Card>
          <CardContent className="py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-sm">Compressed!</p>
                    <p className="text-xs text-muted-foreground">{outputName}</p>
                  </div>
                </div>
                <Button size="sm" className="gap-1.5" onClick={() => { const a = document.createElement("a"); a.href = outputUrl; a.download = outputName; a.click(); }}>
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Original: {(originalSize / (1024 * 1024)).toFixed(1)} MB</span>
                <span>Compressed: {(compressedSize / (1024 * 1024)).toFixed(1)} MB</span>
                {reductionPercent > 0 && (
                  <span className="text-green-500 font-medium">Saved {reductionPercent}%</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleCompress}
        disabled={!file || isCompressing}
        className="w-full gap-2"
      >
        {isCompressing ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Compressing...</>
        ) : (
          <><FileDown className="h-4 w-4" /> Compress Video</>
        )}
      </Button>
    </div>
  );
}