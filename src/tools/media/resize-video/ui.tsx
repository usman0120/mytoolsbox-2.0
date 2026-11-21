"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Film, Download, Loader2, CheckCircle2, XCircle,
  Crop, Maximize, Settings2, Sparkles, Upload, Lock, Unlock,
} from "lucide-react";

type FitMode = "blur" | "letterbox" | "crop" | "stretch";

const SOCIAL_PRESETS = [
  { id: "yt-1080", label: "YouTube (16:9)", width: 1920, height: 1080, icon: "📺" },
  { id: "tiktok-reels", label: "TikTok / Reels (9:16)", width: 1080, height: 1920, icon: "📱" },
  { id: "ig-square", label: "Instagram (1:1)", width: 1080, height: 1080, icon: "⏹️" },
  { id: "ig-portrait", label: "Instagram (4:5)", width: 1080, height: 1350, icon: "📸" },
  { id: "yt-720", label: "HD Ready (16:9)", width: 1280, height: 720, icon: "💻" },
];

export function VideoResizerEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState("");
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  // Dimensions & Fit
  const [targetWidth, setTargetWidth] = useState(1080);
  const [targetHeight, setTargetHeight] = useState(1920);
  const [fitMode, setFitMode] = useState<FitMode>("blur");
  const [lockAspect, setLockAspect] = useState(false);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    setVideoUrl(url);

    const temp = document.createElement("video");
    temp.src = url;
    temp.onloadedmetadata = () => {
      setOriginalWidth(temp.videoWidth);
      setOriginalHeight(temp.videoHeight);
      setVideoDuration(temp.duration);
      // Default to 9:16 Reels if landscape, or 16:9 if portrait
      if (temp.videoWidth > temp.videoHeight) {
        setTargetWidth(1080);
        setTargetHeight(1920);
      } else {
        setTargetWidth(1920);
        setTargetHeight(1080);
      }
    };
  }, []);

  const selectPreset = (w: number, h: number) => {
    setTargetWidth(w);
    setTargetHeight(h);
  };

  const handleResize = useCallback(async () => {
    if (!file || !videoUrl) return;
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setStatusMessage("Setting up canvas resolution...");

    try {
      const video = document.createElement("video");
      video.src = videoUrl;
      video.muted = true;
      video.playsInline = true;

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("Failed to load video"));
        video.load();
      });

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

      const canvasStream = canvas.captureStream(30);
      const tracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];

      let audioCtx: AudioContext | null = null;
      try {
        audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const source = audioCtx.createMediaElementSource(video);
        const dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);
        tracks.push(...dest.stream.getAudioTracks());
      } catch {
        // Continue if audio setup fails
      }

      const combinedStream = new MediaStream(tracks);
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : "video/webm";

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 5000000,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const completionPromise = new Promise<Blob>((resolve) => {
        mediaRecorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
      });

      video.currentTime = 0;
      await video.play();
      mediaRecorder.start(250);

      setStatusMessage("Resizing & rendering video frames...");

      let isDrawing = true;
      const vw = video.videoWidth || targetWidth;
      const vh = video.videoHeight || targetHeight;

      const drawFrame = () => {
        if (!isDrawing) return;
        if (!video.paused && !video.ended) {
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, targetWidth, targetHeight);

          if (fitMode === "blur") {
            // Blurred background layer
            ctx.save();
            ctx.filter = "blur(24px) brightness(0.65)";
            const bgScale = Math.max(targetWidth / vw, targetHeight / vh);
            const bw = vw * bgScale;
            const bh = vh * bgScale;
            ctx.drawImage(video, (targetWidth - bw) / 2, (targetHeight - bh) / 2, bw, bh);
            ctx.restore();

            // Crisp centered video
            const fgScale = Math.min(targetWidth / vw, targetHeight / vh);
            const fw = vw * fgScale;
            const fh = vh * fgScale;
            ctx.drawImage(video, (targetWidth - fw) / 2, (targetHeight - fh) / 2, fw, fh);
          } else if (fitMode === "crop") {
            const scale = Math.max(targetWidth / vw, targetHeight / vh);
            const w = vw * scale;
            const h = vh * scale;
            ctx.drawImage(video, (targetWidth - w) / 2, (targetHeight - h) / 2, w, h);
          } else if (fitMode === "stretch") {
            ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
          } else {
            // Letterbox
            const scale = Math.min(targetWidth / vw, targetHeight / vh);
            const w = vw * scale;
            const h = vh * scale;
            ctx.drawImage(video, (targetWidth - w) / 2, (targetHeight - h) / 2, w, h);
          }

          const pct = Math.min(95, Math.round((video.currentTime / video.duration) * 100));
          setProgress(pct);
        }
        requestAnimationFrame(drawFrame);
      };

      drawFrame();

      await new Promise<void>((resolve) => {
        video.onended = () => {
          isDrawing = false;
          mediaRecorder.stop();
          resolve();
        };

        setTimeout(() => {
          if (mediaRecorder.state === "recording") {
            isDrawing = false;
            mediaRecorder.stop();
            resolve();
          }
        }, (video.duration + 4) * 1000);
      });

      const blob = await completionPromise;
      if (audioCtx) audioCtx.close().catch(() => {});

      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      setOutputSize(blob.size);
      setOutputName(file.name.replace(/\.[^.]+$/, `_${targetWidth}x${targetHeight}.webm`));
      setProgress(100);
      setStatusMessage("Done!");
      toast.success("Video resized successfully!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Resize failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  }, [file, videoUrl, targetWidth, targetHeight, fitMode]);

  return (
    <div className="space-y-6">
      <Badge variant="outline" className="gap-1.5">
        <Crop className="h-3.5 w-3.5" /> Video Resizer & Aspect Formatter
      </Badge>

      {!file ? (
        <Card className="border-2 border-dashed">
          <CardContent className="p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer space-y-3"
            >
              <Film className="h-12 w-12 text-primary opacity-80 mx-auto" />
              <h3 className="font-semibold text-lg">Upload Video to Resize</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Quickly convert videos for YouTube, TikTok, Instagram Reels, or custom resolutions with blur padding.
              </p>
              <Button className="gap-2">
                <Upload className="h-4 w-4" /> Browse Video
              </Button>
              <p className="text-xs text-muted-foreground mt-2">MP4, WebM, MOV up to 500MB</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Video Source Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span className="truncate max-w-[200px]">{file.name}</span>
                <Badge variant="secondary">
                  {originalWidth}×{originalHeight} • {(file.size / (1024 * 1024)).toFixed(1)} MB
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {videoUrl && (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  className="w-full rounded-lg border border-border bg-black aspect-video object-contain"
                />
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => {
                  setFile(null);
                  setVideoUrl(null);
                  setOutputUrl(null);
                }}
              >
                <Upload className="h-4 w-4" /> Choose Different Video
              </Button>
            </CardContent>
          </Card>

          {/* Right: Presets & Fit Controls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" /> Target Dimensions & Fit Style
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Social Presets</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {SOCIAL_PRESETS.map((p) => {
                    const isSelected = targetWidth === p.width && targetHeight === p.height;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => selectPreset(p.width, p.height)}
                        className={`p-2 rounded-lg border text-left text-xs transition-all ${
                          isSelected ? "border-primary bg-primary/5 font-semibold text-primary" : "border-border"
                        }`}
                      >
                        <div>{p.icon} {p.label}</div>
                        <div className="text-[10px] text-muted-foreground font-normal">{p.width} × {p.height}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Dimensions */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Width (px)</label>
                  <input
                    type="number"
                    min={160}
                    max={3840}
                    step={2}
                    value={targetWidth}
                    onChange={(e) => {
                      const w = Number(e.target.value) || 160;
                      setTargetWidth(w);
                      if (lockAspect && originalWidth > 0) {
                        setTargetHeight(Math.round((w * originalHeight) / originalWidth));
                      }
                    }}
                    className="w-full rounded-md border px-3 py-1.5 text-xs bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Height (px)</label>
                  <input
                    type="number"
                    min={120}
                    max={3840}
                    step={2}
                    value={targetHeight}
                    onChange={(e) => {
                      const h = Number(e.target.value) || 120;
                      setTargetHeight(h);
                      if (lockAspect && originalHeight > 0) {
                        setTargetWidth(Math.round((h * originalWidth) / originalHeight));
                      }
                    }}
                    className="w-full rounded-md border px-3 py-1.5 text-xs bg-background"
                  />
                </div>
              </div>

              {/* Fit Modes */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Background & Fit Style</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(
                    [
                      { id: "blur", label: "Blur BG" },
                      { id: "letterbox", label: "Black Bars" },
                      { id: "crop", label: "Fill / Crop" },
                      { id: "stretch", label: "Stretch" },
                    ] as const
                  ).map((m) => (
                    <Button
                      key={m.id}
                      type="button"
                      size="sm"
                      variant={fitMode === m.id ? "default" : "outline"}
                      className="text-xs h-7"
                      onClick={() => setFitMode(m.id)}
                    >
                      {m.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleResize}
                disabled={isProcessing}
                className="w-full gap-2 font-semibold"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> {statusMessage} ({progress}%)
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Resize Video ({targetWidth}×{targetHeight})
                  </>
                )}
              </Button>

              {isProcessing && (
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />

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

      {outputUrl && (
        <Card className="border-green-500/40 bg-green-500/5">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <h4 className="font-semibold text-sm">Resized Video Ready!</h4>
                  <p className="text-xs text-muted-foreground">
                    {targetWidth}×{targetHeight} • {outputSize ? `${(outputSize / (1024 * 1024)).toFixed(1)} MB` : ""}
                  </p>
                </div>
              </div>
              <Button
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = outputUrl;
                  a.download = outputName;
                  a.click();
                }}
              >
                <Download className="h-4 w-4" /> Download Resized Video
              </Button>
            </div>

            <video
              src={outputUrl}
              controls
              className="w-full rounded-lg border border-border bg-black max-h-[420px] object-contain"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}