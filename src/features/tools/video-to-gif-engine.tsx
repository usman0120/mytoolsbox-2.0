"use client";

import { useState, useCallback, useRef } from "react";
import { Film, Play, Download, Upload, Settings2, FileVideo, RefreshCw, Type, Sparkles, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { GifEncoder } from "@/lib/processing/client/gif-encoder";
import { planGifFrames } from "./video-to-gif-sampling";

export function VideoToGifEngine() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [gifUrl, setGifUrl] = useState("");
  const [gifSize, setGifSize] = useState<number | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);

  // Settings
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(4);
  const [fps, setFps] = useState(12);
  const [width, setWidth] = useState(400);
  const [speed, setSpeed] = useState(1.0);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [fontSize, setFontSize] = useState(24);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Please select a video file (MP4, WebM, MOV, etc.)");
      return;
    }

    if (file.size > 200 * 1024 * 1024) {
      setError("Video file is too large (max 200MB).");
      return;
    }

    setError("");
    setVideoFile(file);
    setGifUrl("");
    setGifSize(null);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    const tempVideo = document.createElement("video");
    tempVideo.src = url;
    tempVideo.onloadedmetadata = () => {
      setVideoDuration(tempVideo.duration);
      setDuration(Math.min(5, Math.max(1, tempVideo.duration)));
    };
  };

  const handleConvert = useCallback(async () => {
    if (!videoFile || !videoRef.current || !canvasRef.current) return;

    setIsConverting(true);
    setProgress(0);
    setError("");
    setStatusMessage("Preparing video frames...");

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Ensure metadata is loaded
      await new Promise<void>((resolve, reject) => {
        if (video.readyState >= 2) resolve();
        else {
          video.onloadeddata = () => resolve();
          video.onerror = () => reject(new Error("Unable to decode video."));
        }
      });

      const aspectRatio = video.videoHeight / video.videoWidth;
      const targetWidth = width;
      const targetHeight = Math.round(targetWidth * aspectRatio);

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

      const encoder = new GifEncoder({
        width: targetWidth,
        height: targetHeight,
        repeat: 0, // infinite loop
      });

      const { frameTimes, frameDelay } = planGifFrames(video.duration, startTime, duration, fps, speed);
      const totalFrames = frameTimes.length;

      video.pause();

      for (let i = 0; i < totalFrames; i++) {
        const frameTime = frameTimes[i];
        await new Promise<void>((resolve, reject) => {
          if (video.error) {
            reject(new Error("Unable to decode video frame."));
            return;
          }
          if (video.currentTime === frameTime && !video.seeking && video.readyState >= 2) {
            resolve();
            return;
          }
          const cleanup = () => {
            clearTimeout(timeout);
            video.removeEventListener("seeked", onSeeked);
            video.removeEventListener("error", onFailure);
            video.removeEventListener("abort", onFailure);
          };
          const onSeeked = () => {
            cleanup();
            if (video.readyState < 2 || video.seeking || video.error) {
              reject(new Error("Unable to decode video frame."));
            } else resolve();
          };
          const onFailure = () => {
            cleanup();
            reject(new Error("Unable to seek video frame."));
          };
          const timeout = setTimeout(() => {
            cleanup();
            reject(new Error("Video frame seek timed out."));
          }, 5000);
          video.addEventListener("seeked", onSeeked);
          video.addEventListener("error", onFailure);
          video.addEventListener("abort", onFailure);
          try {
            video.currentTime = frameTime;
          } catch {
            onFailure();
          }
        });

        // Draw video frame
        ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

        // Overlay meme / caption text if present
        if (topText.trim() || bottomText.trim()) {
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.textAlign = "center";
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = Math.max(2, fontSize / 8);

          if (topText.trim()) {
            const y = fontSize + 8;
            ctx.strokeText(topText.toUpperCase(), targetWidth / 2, y);
            ctx.fillText(topText.toUpperCase(), targetWidth / 2, y);
          }

          if (bottomText.trim()) {
            const y = targetHeight - 12;
            ctx.strokeText(bottomText.toUpperCase(), targetWidth / 2, y);
            ctx.fillText(bottomText.toUpperCase(), targetWidth / 2, y);
          }
        }

        const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        encoder.addFrame(imageData, { delay: frameDelay });

        const pct = Math.round(((i + 1) / totalFrames) * 85);
        setProgress(pct);
        setStatusMessage(`Capturing frame ${i + 1} of ${totalFrames}...`);
      }

      setStatusMessage("Encoding animated GIF89a binary...");
      setProgress(90);

      // Render GIF
      const gifBlob = encoder.render();
      const url = URL.createObjectURL(gifBlob);
      setGifUrl(url);
      setGifSize(gifBlob.size);
      setProgress(100);
      setStatusMessage("Done!");
      toast.success(`GIF created successfully! (${(gifBlob.size / 1024).toFixed(1)} KB)`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "GIF conversion failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsConverting(false);
    }
  }, [videoFile, width, fps, duration, startTime, speed, topText, bottomText, fontSize]);

  const handleDownload = () => {
    if (!gifUrl) return;
    const link = document.createElement("a");
    const baseName = videoFile ? videoFile.name.replace(/\.[^.]+$/, "") : "animation";
    link.download = `${baseName}.gif`;
    link.href = gifUrl;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* File upload */}
      {!videoFile && (
        <Card className="border-2 border-dashed">
          <CardContent className="p-8 text-center">
            <Film className="h-12 w-12 mx-auto mb-4 text-primary opacity-80" />
            <h3 className="font-semibold text-lg mb-1">Convert Video to Animated GIF</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Extract clips, control frame rate, add text captions, and generate real GIF89a files.
            </p>
            <label>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button className="gap-2">
                <Upload className="h-4 w-4" /> Choose Video File
              </Button>
            </label>
            <p className="text-xs text-muted-foreground mt-3">MP4, WebM, MOV up to 200MB</p>
          </CardContent>
        </Card>
      )}

      {/* Video preview + settings */}
      {videoUrl && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Video Preview */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Film className="h-4 w-4 text-primary" /> Source Video
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {videoDuration > 0 ? `${videoDuration.toFixed(1)}s` : "Loading..."}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  className="w-full rounded-lg border border-border bg-black/90 aspect-video object-contain"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate max-w-[200px]">{videoFile?.name}</span>
                  <span>{((videoFile?.size ?? 0) / (1024 * 1024)).toFixed(1)} MB</span>
                </div>
              </CardContent>
            </Card>

            {/* Right: Output Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-primary" /> GIF Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Start & Duration */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Start Time: {startTime.toFixed(1)}s</Label>
                    <Slider
                      value={[startTime]}
                      min={0}
                      max={Math.max(0, videoDuration - 0.5)}
                      step={0.1}
                      onValueChange={(v) => setStartTime(Array.isArray(v) ? v[0] : v)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Duration: {duration.toFixed(1)}s</Label>
                    <Slider
                      value={[duration]}
                      min={0.5}
                      max={Math.min(15, Math.max(1, videoDuration - startTime))}
                      step={0.5}
                      onValueChange={(v) => setDuration(Array.isArray(v) ? v[0] : v)}
                    />
                  </div>
                </div>

                {/* FPS and Width */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">FPS: {fps}</Label>
                    <Slider
                      value={[fps]}
                      min={5}
                      max={24}
                      step={1}
                      onValueChange={(v) => setFps(Array.isArray(v) ? v[0] : v)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Width: {width}px</Label>
                    <Slider
                      value={[width]}
                      min={200}
                      max={640}
                      step={20}
                      onValueChange={(v) => setWidth(Array.isArray(v) ? v[0] : v)}
                    />
                  </div>
                </div>

                {/* Speed Multiplier */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Playback Speed</Label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0.5, 1.0, 1.5, 2.0].map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={speed === s ? "default" : "outline"}
                        className="h-7 text-xs"
                        onClick={() => setSpeed(s)}
                      >
                        {s}x
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Text Captions */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Type className="h-3.5 w-3.5" /> Meme Text Overlay (Optional)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Top caption..."
                      value={topText}
                      onChange={(e) => setTopText(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder="Bottom caption..."
                      value={bottomText}
                      onChange={(e) => setBottomText(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleConvert}
                  className="w-full gap-2"
                  disabled={isConverting}
                >
                  {isConverting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> {statusMessage} ({progress}%)
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Generate Animated GIF
                    </>
                  )}
                </Button>

                {isConverting && (
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Hidden Canvas */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Generated Result */}
          {gifUrl && (
            <Card className="border-green-500/30 bg-green-500/5">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileVideo className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-semibold text-sm">Animated GIF Ready</h4>
                      <p className="text-xs text-muted-foreground">
                        {gifSize ? `${(gifSize / 1024).toFixed(1)} KB` : ""} • {fps} FPS • {width}px width
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleDownload} className="gap-2 bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4" /> Download .GIF
                  </Button>
                </div>

                <div className="flex justify-center bg-black/10 dark:bg-black/40 rounded-lg p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={gifUrl}
                    alt="Animated GIF output"
                    className="rounded-lg shadow-md max-h-[350px] object-contain"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            variant="outline"
            className="gap-2 w-full"
            onClick={() => {
              setVideoFile(null);
              setVideoUrl("");
              setGifUrl("");
              setGifSize(null);
            }}
          >
            <Upload className="h-4 w-4" /> Select Different Video
          </Button>
        </>
      )}

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-3">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}