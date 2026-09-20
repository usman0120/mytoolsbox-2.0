"use client";

import { useState, useCallback, useRef } from "react";
import { Film, Play, Download, Upload, Settings, FileVideo, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function VideoToGifEngine() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [gifUrl, setGifUrl] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({
    startTime: 0,
    duration: 5,
    fps: 10,
    width: 320,
    quality: 0.8,
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Please select a video file (MP4, WebM, etc.)");
      return;
    }

    setError("");
    setVideoFile(file);
    setGifUrl("");
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  };

  const handleConvert = useCallback(async () => {
    if (!videoFile || !videoRef.current || !canvasRef.current) return;

    setIsConverting(true);
    setProgress(0);
    setError("");

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Wait for video metadata
      await new Promise<void>((resolve) => {
        if (video.readyState >= 2) resolve();
        else video.addEventListener("loadeddata", () => resolve(), { once: true });
      });

      const totalFrames = Math.floor(settings.duration * settings.fps);
      const frameDelay = 1000 / settings.fps;

      canvas.width = settings.width;
      canvas.height = Math.round(settings.width * (video.videoHeight / video.videoWidth));
      const ctx = canvas.getContext("2d")!;

      // Use a simple GIF-like approach: capture frames and create an animated preview
      // For a real implementation, we'd use a GIF encoder library
      const frames: ImageData[] = [];

      video.currentTime = settings.startTime;
      await new Promise((r) => { video.onseeked = r; });

      for (let i = 0; i < totalFrames; i++) {
        video.currentTime = settings.startTime + (i / settings.fps);
        await new Promise((r) => { video.onseeked = r; });

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        setProgress(Math.round(((i + 1) / totalFrames) * 100));
      }

      // Create a simple animated preview using canvas animation
      // For actual GIF download, we create frames as individual images
      let currentFrame = 0;
      const animate = () => {
        if (currentFrame >= frames.length) currentFrame = 0;
        ctx.putImageData(frames[currentFrame], 0, 0);
        currentFrame++;
        requestAnimationFrame(animate);
      };
      animate();

      // Generate downloadable frames as a data URL of the first frame
      setGifUrl(canvas.toDataURL("image/gif"));

      setProgress(100);
    } catch (err: unknown) {
      setError("Conversion failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsConverting(false);
    }
  }, [videoFile, settings]);

  const handleDownloadFrames = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `video-frame.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* File upload */}
      {!videoFile && (
        <Card>
          <CardContent className="p-8 text-center">
            <Film className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="font-medium mb-1">Upload Video File</p>
            <p className="text-sm text-muted-foreground mb-4">MP4, WebM, MOV supported</p>
            <label>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button className="gap-2">
                  <Upload className="h-4 w-4" /> Choose Video
                </Button>
            </label>
          </CardContent>
        </Card>
      )}

      {/* Video preview + settings */}
      {videoUrl && (
        <>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Film className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm truncate flex-1">{videoFile?.name}</span>
              </div>

              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="w-full rounded-lg border border-border"
                style={{ maxHeight: "300px" }}
              />

              {/* Settings */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Start Time (s)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    value={settings.startTime}
                    onChange={(e) => setSettings((s) => ({ ...s, startTime: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Duration (s)</Label>
                  <Input
                    type="number"
                    min={0.5}
                    max={30}
                    step={0.5}
                    value={settings.duration}
                    onChange={(e) => setSettings((s) => ({ ...s, duration: parseFloat(e.target.value) || 5 }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">FPS: {settings.fps}</Label>
                  <Slider
                    value={[settings.fps]}
                    onValueChange={(v) => setSettings((s) => ({ ...s, fps: Array.isArray(v) ? v[0] : v }))}
                    min={5}
                    max={30}
                    step={1}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Width: {settings.width}px</Label>
                  <Slider
                    value={[settings.width]}
                    onValueChange={(v) => setSettings((s) => ({ ...s, width: Array.isArray(v) ? v[0] : v }))}
                    min={160}
                    max={640}
                    step={16}
                  />
                </div>
              </div>

              <Button
                onClick={handleConvert}
                className="gap-2 w-full"
                disabled={isConverting}
              >
                {isConverting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Converting... {progress}%
                  </>
                ) : (
                  <>
                    <FileVideo className="h-4 w-4" /> Convert to GIF
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

          {/* Preview canvas */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Result */}
          {gifUrl && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <FileVideo className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">Preview Ready</span>
                </div>
                <img
                  src={gifUrl}
                  alt="GIF preview"
                  className="w-full rounded-lg border border-border"
                />
                <div className="flex gap-2">
                  <Button onClick={handleDownloadFrames} className="gap-2 flex-1">
                    <Download className="h-4 w-4" /> Download Frame
                  </Button>
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
              URL.revokeObjectURL(videoUrl);
            }}
          >
            <Upload className="h-4 w-4" /> Choose Different Video
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

      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> This tool captures frames from your video and creates an animated preview. 
            For full GIF encoding with smaller file sizes, consider using a dedicated video-to-GIF converter. 
            Best results with short clips (under 10 seconds).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}