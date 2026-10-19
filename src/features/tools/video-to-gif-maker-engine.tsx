"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Film, Upload, Download, Loader2, CheckCircle2, XCircle,
  Image as ImageIcon, Settings2, Repeat, ArrowLeftRight, Sparkles,
} from "lucide-react";
import { GifEncoder } from "@/lib/processing/client/gif-encoder";
import { planGifFrames } from "./video-to-gif-sampling";

export function VideoToGifMakerEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState("");
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  // Settings
  const [fps, setFps] = useState(12);
  const [width, setWidth] = useState(440);
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(4);
  const [videoDuration, setVideoDuration] = useState(0);
  const [bounceLoop, setBounceLoop] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setError(null);
    setOutputUrl(null);
    setOutputSize(null);

    if (!selected.type.startsWith("video/")) {
      setError("Please select a valid video file.");
      return;
    }

    if (selected.size > 200 * 1024 * 1024) {
      setError("File size must be under 200MB.");
      return;
    }

    setFile(selected);
    const url = URL.createObjectURL(selected);
    setVideoUrl(url);

    const temp = document.createElement("video");
    temp.src = url;
    temp.onloadedmetadata = () => {
      setVideoDuration(temp.duration);
      setDuration(Math.min(5, Math.max(1, temp.duration)));
    };
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file || !videoUrl) return;
    setIsConverting(true);
    setError(null);
    setProgress(0);
    setStatusMessage("Initializing video extraction...");

    try {
      const video = document.createElement("video");
      video.src = videoUrl;
      video.muted = true;

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("Failed to load video stream"));
        video.load();
      });

      const aspectRatio = video.videoHeight / video.videoWidth;
      const height = Math.round(width * aspectRatio);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

      const { frameTimes, frameDelay } = planGifFrames(video.duration, startTime, duration, fps);
      const totalFrames = frameTimes.length;
      const frames: ImageData[] = [];

      setStatusMessage("Extracting video frames...");

      for (let i = 0; i < totalFrames; i++) {
        const targetTime = frameTimes[i];
        await new Promise<void>((resolve, reject) => {
          if (video.error) {
            reject(new Error("Unable to decode video frame."));
            return;
          }
          if (video.currentTime === targetTime && !video.seeking && video.readyState >= 2) {
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
            video.currentTime = targetTime;
          } catch {
            onFailure();
          }
        });

        ctx.drawImage(video, 0, 0, width, height);
        frames.push(ctx.getImageData(0, 0, width, height));

        const pct = Math.round(((i + 1) / totalFrames) * 70);
        setProgress(pct);
        setStatusMessage(`Captured frame ${i + 1} of ${totalFrames}...`);
      }

      // If bounce loop is active, add reversed frames
      const finalFrames = [...frames];
      if (bounceLoop && frames.length > 2) {
        for (let j = frames.length - 2; j > 0; j--) {
          finalFrames.push(frames[j]);
        }
      }

      setStatusMessage("Generating 256-color palette and LZW compressed GIF...");
      setProgress(75);

      const encoder = new GifEncoder({
        width,
        height,
        repeat: 0,
      });

      for (let k = 0; k < finalFrames.length; k++) {
        encoder.addFrame(finalFrames[k], { delay: frameDelay });
      }

      const gifBlob = encoder.render();
      const url = URL.createObjectURL(gifBlob);
      const gifName = file.name.replace(/\.[^.]+$/, ".gif");

      setOutputUrl(url);
      setOutputName(gifName);
      setOutputSize(gifBlob.size);
      setProgress(100);
      setStatusMessage("Complete!");
      toast.success(`GIF created! ${(gifBlob.size / 1024).toFixed(1)} KB`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Conversion failed";
      setError(message);
      toast.error("Conversion failed: " + message);
    } finally {
      setIsConverting(false);
    }
  }, [file, videoUrl, fps, width, startTime, duration, bounceLoop]);

  return (
    <div className="space-y-6">
      <Badge variant="outline" className="gap-1.5">
        <ImageIcon className="h-3.5 w-3.5" /> Video to GIF Maker
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
              <h3 className="font-semibold text-lg">Upload Video to Convert</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Turn MP4, WebM, or MOV clips into high-quality, looping animated GIFs with custom speed and resolution.
              </p>
              <Button className="gap-2">
                <Upload className="h-4 w-4" /> Browse Video
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Video Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span className="truncate max-w-[200px]">{file.name}</span>
                <Badge variant="secondary">{(file.size / (1024 * 1024)).toFixed(1)} MB</Badge>
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

          {/* Right: GIF Controls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" /> Output & Animation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Start: {startTime.toFixed(1)}s</label>
                  <Slider
                    value={[startTime]}
                    min={0}
                    max={Math.max(0, videoDuration - 0.5)}
                    step={0.1}
                    onValueChange={(v) => setStartTime(Array.isArray(v) ? v[0] : v)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Duration: {duration.toFixed(1)}s</label>
                  <Slider
                    value={[duration]}
                    min={0.5}
                    max={Math.min(15, Math.max(1, videoDuration - startTime))}
                    step={0.5}
                    onValueChange={(v) => setDuration(Array.isArray(v) ? v[0] : v)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Frame Rate: {fps} FPS</label>
                  <Slider
                    value={[fps]}
                    min={5}
                    max={25}
                    step={1}
                    onValueChange={(v) => setFps(Array.isArray(v) ? v[0] : v)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Width: {width}px</label>
                  <Slider
                    value={[width]}
                    min={200}
                    max={640}
                    step={20}
                    onValueChange={(v) => setWidth(Array.isArray(v) ? v[0] : v)}
                  />
                </div>
              </div>

              {/* Loop style */}
              <div className="pt-2 border-t">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bounceLoop}
                    onChange={(e) => setBounceLoop(e.target.checked)}
                    className="rounded"
                  />
                  <ArrowLeftRight className="h-3.5 w-3.5 text-primary" />
                  <span>Bounce Loop (play forward then backwards)</span>
                </label>
              </div>

              <Button
                onClick={handleConvert}
                disabled={isConverting}
                className="w-full gap-2"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> {statusMessage} ({progress}%)
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Create Animated GIF
                  </>
                )}
              </Button>

              {isConverting && (
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
                  <h4 className="font-semibold text-sm">{outputName}</h4>
                  <p className="text-xs text-muted-foreground">
                    {outputSize ? `${(outputSize / 1024).toFixed(1)} KB • ` : ""}
                    Animated GIF89a
                  </p>
                </div>
              </div>
              <Button
                className="gap-2 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = outputUrl;
                  a.download = outputName;
                  a.click();
                }}
              >
                <Download className="h-4 w-4" /> Download .GIF
              </Button>
            </div>

            <div className="flex justify-center bg-black/20 rounded-lg p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={outputUrl}
                alt="Generated GIF"
                className="max-h-[350px] rounded-lg shadow-md object-contain"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}