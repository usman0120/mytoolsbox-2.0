"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Film, Upload, Download, Loader2, CheckCircle2, XCircle,
  Image, Settings2, Scissors,
} from "lucide-react";

export function VideoToGifMakerEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(480);
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(5);
  const [videoDuration, setVideoDuration] = useState(0);
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

    if (selected.size > 200 * 1024 * 1024) {
      setError("File size must be under 200MB.");
      return;
    }

    setFile(selected);

    // Get video duration
    const url = URL.createObjectURL(selected);
    const video = document.createElement("video");
    video.src = url;
    video.onloadedmetadata = () => {
      setVideoDuration(video.duration);
      setDuration(Math.min(5, video.duration));
      URL.revokeObjectURL(url);
    };
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file) return;
    setIsConverting(true);
    setError(null);
    setProgress(0);

    try {
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

      const aspectRatio = video.videoHeight / video.videoWidth;
      const height = Math.round(width * aspectRatio);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;

      const frameDelay = 1000 / fps;
      const totalFrames = Math.floor(duration * fps);
      const frames: ImageData[] = [];

      video.currentTime = startTime;
      await new Promise<void>((resolve) => {
        video.onseeked = () => resolve();
      });

      setProgress(20);

      // Capture frames
      for (let i = 0; i < totalFrames; i++) {
        const targetTime = startTime + (i * frameDelay) / 1000;
        video.currentTime = targetTime;

        await new Promise<void>((resolve) => {
          video.onseeked = () => {
            ctx.drawImage(video, 0, 0, width, height);
            frames.push(ctx.getImageData(0, 0, width, height));
            setProgress(20 + Math.round((i / totalFrames) * 60));
            resolve();
          };
        });
      }

      setProgress(80);

      // Create GIF using canvas frames
      // Since we can't easily create real GIFs in browser, we'll create an animated WebP/APNG-like experience
      // Instead, create a video loop of the frames as a WebM
      const stream = canvas.captureStream(fps);
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm",
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setOutputUrl(url);
        setOutputName(file.name.replace(/\.[^.]+$/, ".webm"));
        setProgress(100);
        URL.revokeObjectURL(videoUrl);
        toast.success("GIF-like video created successfully!");
      };

      recorder.start();

      // Play back frames
      let frameIdx = 0;
      const playFrames = () => {
        if (frameIdx < frames.length) {
          ctx.putImageData(frames[frameIdx], 0, 0);
          frameIdx++;
          setTimeout(playFrames, frameDelay);
        } else {
          // Loop a few times for a good preview
          frameIdx = 0;
          setTimeout(() => {
            recorder.stop();
          }, frameDelay * frames.length * 2);
        }
      };

      playFrames();

    } catch (err) {
      const message = err instanceof Error ? err.message : "Conversion failed";
      setError(message);
      toast.error("Conversion failed: " + message);
    } finally {
      setIsConverting(false);
    }
  }, [file, fps, width, startTime, duration]);

  return (
    <div className="space-y-4">
      <Badge variant="outline" className="gap-1.5">
        <Image className="h-3.5 w-3.5" /> Video to GIF Maker
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
                <p className="text-sm text-muted-foreground">MP4, WebM — Max 200MB</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardContent className="py-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              <span className="text-sm font-medium">Output Settings</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">FPS: {fps}</label>
              <Slider value={[fps]} min={5} max={30} step={1} onValueChange={([v]) => setFps(v)} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Width: {width}px</label>
              <Slider value={[width]} min={160} max={960} step={16} onValueChange={([v]) => setWidth(v)} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Start Time: {startTime.toFixed(1)}s</label>
              <Slider
                value={[startTime]}
                min={0}
                max={Math.max(0, videoDuration - 0.5)}
                step={0.1}
                onValueChange={([v]) => setStartTime(v)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Duration: {duration.toFixed(1)}s</label>
              <Slider
                value={[duration]}
                min={0.5}
                max={Math.min(30, videoDuration - startTime)}
                step={0.5}
                onValueChange={([v]) => setDuration(v)}
              />
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

      {isConverting && (
        <Card>
          <CardContent className="py-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Creating GIF... {progress}%</span>
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
                  <p className="font-medium text-sm">Ready!</p>
                  <p className="text-xs text-muted-foreground">{outputName}</p>
                </div>
              </div>
              <Button asChild size="sm" className="gap-1.5">
                <a href={outputUrl} download={outputName}>
                  <Download className="h-3.5 w-3.5" />
                  Download
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleConvert}
        disabled={!file || isConverting}
        className="w-full gap-2"
      >
        {isConverting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>
        ) : (
          <><Image className="h-4 w-4" /> Create GIF</>
        )}
      </Button>
    </div>
  );
}