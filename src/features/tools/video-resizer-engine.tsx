"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Film, Download, Loader2, CheckCircle2, XCircle,
  Crop, Maximize, Settings2,
} from "lucide-react";

type ResizeMode = "dimensions" | "percentage" | "crop";

export function VideoResizerEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState<ResizeMode>("dimensions");
  const [targetWidth, setTargetWidth] = useState(640);
  const [targetHeight, setTargetHeight] = useState(360);
  const [percentage, setPercentage] = useState(50);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const url = URL.createObjectURL(selected);
    const video = document.createElement("video");
    video.src = url;
    video.onloadedmetadata = () => {
      setOriginalWidth(video.videoWidth);
      setOriginalHeight(video.videoHeight);
      setTargetWidth(video.videoWidth);
      setTargetHeight(video.videoHeight);
      URL.revokeObjectURL(url);
    };
  }, []);

  const handleResize = useCallback(async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      let outWidth = targetWidth;
      let outHeight = targetHeight;

      if (mode === "percentage") {
        outWidth = Math.round(originalWidth * (percentage / 100));
        outHeight = Math.round(originalHeight * (percentage / 100));
      }

      const videoUrl = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.src = videoUrl;
      video.muted = true;

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("Failed to load video"));
        video.load();
      });

      setProgress(10);

      const canvas = document.createElement("canvas");
      canvas.width = outWidth;
      canvas.height = outHeight;
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
        videoBitsPerSecond: 2500000,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setOutputUrl(url);
        setOutputName(file.name.replace(/\.[^.]+$/, "_resized.webm"));
        setProgress(100);
        URL.revokeObjectURL(videoUrl);
        audioContext.close();
        toast.success("Video resized successfully!");
      };

      mediaRecorder.start();
      setProgress(20);

      await video.play();

      const drawFrame = () => {
        if (!video.ended && !video.paused) {
          ctx.drawImage(video, 0, 0, outWidth, outHeight);
          const elapsed = video.currentTime;
          const total = video.duration;
          const pct = 20 + Math.round((elapsed / total) * 70);
          setProgress(Math.min(pct, 95));
          requestAnimationFrame(drawFrame);
        }
      };
      drawFrame();

      video.onended = () => {
        mediaRecorder.stop();
        video.pause();
      };

      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
      }, (video.duration + 5) * 1000);

    } catch (err) {
      const message = err instanceof Error ? err.message : "Resize failed";
      setError(message);
      toast.error("Resize failed: " + message);
    } finally {
      setIsProcessing(false);
    }
  }, [file, mode, targetWidth, targetHeight, percentage, originalWidth, originalHeight]);

  return (
    <div className="space-y-4">
      <Badge variant="outline" className="gap-1.5">
        <Crop className="h-3.5 w-3.5" /> Video Resizer
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
                  {originalWidth > 0 && ` — ${originalWidth}×${originalHeight}`}
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

      {/* Resize settings */}
      <Card>
        <CardContent className="py-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              <span className="text-sm font-medium">Resize Settings</span>
            </div>

            <div className="flex gap-2">
              {(["dimensions", "percentage"] as ResizeMode[]).map((m) => (
                <Button
                  key={m}
                  variant={mode === m ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode(m)}
                  className="flex-1"
                >
                  {m === "dimensions" ? "By Dimensions" : "By Percentage"}
                </Button>
              ))}
            </div>

            {mode === "dimensions" ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Width (px)</label>
                  <input
                    type="number"
                    value={targetWidth}
                    onChange={(e) => {
                      const w = Number(e.target.value);
                      setTargetWidth(w);
                      if (maintainAspect && originalWidth > 0) {
                        setTargetHeight(Math.round(w * (originalHeight / originalWidth)));
                      }
                    }}
                    className="w-full rounded-md border px-3 py-1.5 text-sm"
                    min={32}
                    max={3840}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Height (px)</label>
                  <input
                    type="number"
                    value={targetHeight}
                    onChange={(e) => {
                      const h = Number(e.target.value);
                      setTargetHeight(h);
                      if (maintainAspect && originalHeight > 0) {
                        setTargetWidth(Math.round(h * (originalWidth / originalHeight)));
                      }
                    }}
                    className="w-full rounded-md border px-3 py-1.5 text-sm"
                    min={32}
                    max={2160}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Scale: {percentage}%</label>
                <Slider
                  value={[percentage]}
                  min={10}
                  max={200}
                  step={5}
                  onValueChange={(v) => setPercentage(Array.isArray(v) ? v[0] : v)}
                />
                <p className="text-xs text-muted-foreground">
                  Output: {Math.round(originalWidth * (percentage / 100))}×{Math.round(originalHeight * (percentage / 100))}
                </p>
              </div>
            )}

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={maintainAspect}
                onChange={(e) => setMaintainAspect(e.target.checked)}
                className="rounded"
              />
              Maintain aspect ratio
            </label>
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

      {isProcessing && (
        <Card>
          <CardContent className="py-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Resizing... {progress}%</span>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-sm">Resized!</p>
                  <p className="text-xs text-muted-foreground">{outputName}</p>
                </div>
              </div>
              <Button size="sm" className="gap-1.5" onClick={() => { const a = document.createElement("a"); a.href = outputUrl; a.download = outputName; a.click(); }}>
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleResize}
        disabled={!file || isProcessing}
        className="w-full gap-2"
      >
        {isProcessing ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Resizing...</>
        ) : (
          <><Maximize className="h-4 w-4" /> Resize Video</>
        )}
      </Button>
    </div>
  );
}