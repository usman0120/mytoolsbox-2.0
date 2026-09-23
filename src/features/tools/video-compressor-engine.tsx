"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Film, Upload, Download, Loader2, CheckCircle2, XCircle,
  FileDown, Settings2, Sparkles, Volume2, VolumeX, BarChart3,
} from "lucide-react";

type CompressionPreset = "target-10mb" | "target-25mb" | "balanced" | "max-reduction" | "custom";

export function VideoCompressorEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  // Compression Options
  const [preset, setPreset] = useState<CompressionPreset>("balanced");
  const [resolutionScale, setResolutionScale] = useState(0.75); // 75%
  const [targetBitrateKbps, setTargetBitrateKbps] = useState(1500); // 1.5 Mbps
  const [includeAudio, setIncludeAudio] = useState(true);
  const [videoDuration, setVideoDuration] = useState(0);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setError(null);
    setOutputUrl(null);
    setCompressedSize(0);

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

    const url = URL.createObjectURL(selected);
    setVideoUrl(url);

    const temp = document.createElement("video");
    temp.src = url;
    temp.onloadedmetadata = () => {
      setVideoDuration(temp.duration);
      setOriginalWidth(temp.videoWidth);
      setOriginalHeight(temp.videoHeight);

      // Auto-compute bitrate for presets
      if (temp.duration > 0) {
        // For 10MB: (10 * 8 * 1024) / duration in seconds
        const tenMbBitrate = Math.max(300, Math.floor((9.5 * 8 * 1024) / temp.duration));
        if (preset === "target-10mb") setTargetBitrateKbps(tenMbBitrate);
      }
    };
  }, [preset]);

  const applyPreset = (p: CompressionPreset) => {
    setPreset(p);
    if (!videoDuration) return;

    if (p === "target-10mb") {
      const kbps = Math.max(250, Math.floor((9.2 * 8 * 1024) / videoDuration));
      setTargetBitrateKbps(kbps);
      setResolutionScale(0.6);
    } else if (p === "target-25mb") {
      const kbps = Math.max(500, Math.floor((24 * 8 * 1024) / videoDuration));
      setTargetBitrateKbps(kbps);
      setResolutionScale(0.75);
    } else if (p === "balanced") {
      setTargetBitrateKbps(1600);
      setResolutionScale(0.75);
    } else if (p === "max-reduction") {
      setTargetBitrateKbps(600);
      setResolutionScale(0.5);
    }
  };

  const handleCompress = useCallback(async () => {
    if (!file || !videoUrl) return;
    setIsCompressing(true);
    setError(null);
    setProgress(0);
    setStatusMessage("Preparing video decoder...");

    try {
      const video = document.createElement("video");
      video.src = videoUrl;
      video.muted = true;
      video.playsInline = true;

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("Unable to decode video."));
        video.load();
      });

      const width = Math.max(160, Math.round((video.videoWidth * resolutionScale) / 2) * 2);
      const height = Math.max(120, Math.round((video.videoHeight * resolutionScale) / 2) * 2);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

      const canvasStream = canvas.captureStream(30);
      const tracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];

      let audioContext: AudioContext | null = null;

      if (includeAudio) {
        try {
          audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          const source = audioContext.createMediaElementSource(video);
          const dest = audioContext.createMediaStreamDestination();
          source.connect(dest);
          tracks.push(...dest.stream.getAudioTracks());
        } catch {
          // If audio context fails, proceed with video stream
        }
      }

      const combinedStream = new MediaStream(tracks);

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
        ? "video/webm;codecs=vp8,opus"
        : "video/webm";

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: targetBitrateKbps * 1000,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const completionPromise = new Promise<Blob>((resolve) => {
        mediaRecorder.onstop = () => {
          resolve(new Blob(chunks, { type: mimeType }));
        };
      });

      video.currentTime = 0;
      await video.play();
      mediaRecorder.start(250);

      setStatusMessage("Compressing and re-encoding video...");

      let isDrawing = true;
      const drawFrame = () => {
        if (!isDrawing) return;
        if (!video.paused && !video.ended) {
          ctx.drawImage(video, 0, 0, width, height);
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

        // Safety fallback timeout
        setTimeout(() => {
          if (mediaRecorder.state === "recording") {
            isDrawing = false;
            mediaRecorder.stop();
            resolve();
          }
        }, (video.duration + 4) * 1000);
      });

      const compressedBlob = await completionPromise;
      if (audioContext) audioContext.close().catch(() => {});

      const url = URL.createObjectURL(compressedBlob);
      setOutputUrl(url);
      setCompressedSize(compressedBlob.size);
      setOutputName(file.name.replace(/\.[^.]+$/, "_compressed.webm"));
      setProgress(100);
      setStatusMessage("Complete!");
      toast.success("Video compressed successfully!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Compression failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsCompressing(false);
    }
  }, [file, videoUrl, resolutionScale, targetBitrateKbps, includeAudio]);

  const reductionPercent =
    originalSize > 0 && compressedSize > 0
      ? Math.max(0, Math.round((1 - compressedSize / originalSize) * 100))
      : 0;

  return (
    <div className="space-y-6">
      <Badge variant="outline" className="gap-1.5">
        <FileDown className="h-3.5 w-3.5" /> Video Compressor
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
              <h3 className="font-semibold text-lg">Compress Video File Size</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Reduce video size for Discord, email, WhatsApp, and social media without significant quality loss.
              </p>
              <Button className="gap-2">
                <Upload className="h-4 w-4" /> Select Video
              </Button>
              <p className="text-xs text-muted-foreground mt-2">MP4, WebM, MOV up to 500MB</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Video Preview & Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span className="truncate max-w-[200px]">{file.name}</span>
                <Badge variant="secondary">{(originalSize / (1024 * 1024)).toFixed(1)} MB</Badge>
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
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Original: {originalWidth}×{originalHeight}</span>
                <span>Duration: {videoDuration.toFixed(1)}s</span>
              </div>
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

          {/* Right: Compression Presets & Sliders */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" /> Target Size & Quality Presets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset("target-10mb")}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                    preset === "target-10mb" ? "border-primary bg-primary/5 font-semibold text-primary" : "border-border"
                  }`}
                >
                  <div>Discord / Email</div>
                  <div className="text-[10px] text-muted-foreground font-normal">Under 10MB limit</div>
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset("target-25mb")}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                    preset === "target-25mb" ? "border-primary bg-primary/5 font-semibold text-primary" : "border-border"
                  }`}
                >
                  <div>Social Media</div>
                  <div className="text-[10px] text-muted-foreground font-normal">Under 25MB target</div>
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset("balanced")}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                    preset === "balanced" ? "border-primary bg-primary/5 font-semibold text-primary" : "border-border"
                  }`}
                >
                  <div>Balanced (Recommended)</div>
                  <div className="text-[10px] text-muted-foreground font-normal">~50% size reduction</div>
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset("max-reduction")}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                    preset === "max-reduction" ? "border-primary bg-primary/5 font-semibold text-primary" : "border-border"
                  }`}
                >
                  <div>Max Compression</div>
                  <div className="text-[10px] text-muted-foreground font-normal">Smallest file size</div>
                </button>
              </div>

              {/* Bitrate & Resolution Sliders */}
              <div className="space-y-3 pt-2 border-t">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Target Bitrate</span>
                    <span>{targetBitrateKbps} kbps</span>
                  </div>
                  <Slider
                    value={[targetBitrateKbps]}
                    min={300}
                    max={5000}
                    step={100}
                    onValueChange={(v) => {
                      setPreset("custom");
                      setTargetBitrateKbps(Array.isArray(v) ? v[0] : v);
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Resolution Downscale</span>
                    <span>{Math.round(resolutionScale * 100)}% ({Math.round(originalWidth * resolutionScale)}×{Math.round(originalHeight * resolutionScale)})</span>
                  </div>
                  <Slider
                    value={[Math.round(resolutionScale * 100)]}
                    min={30}
                    max={100}
                    step={5}
                    onValueChange={(v) => {
                      setPreset("custom");
                      const val = Array.isArray(v) ? v[0] : v;
                      setResolutionScale(val / 100);
                    }}
                  />
                </div>

                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={includeAudio}
                    onChange={(e) => setIncludeAudio(e.target.checked)}
                    className="rounded"
                  />
                  {includeAudio ? <Volume2 className="h-3.5 w-3.5 text-primary" /> : <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />}
                  <span>Include Audio Track</span>
                </label>
              </div>

              <Button
                onClick={handleCompress}
                disabled={isCompressing}
                className="w-full gap-2"
              >
                {isCompressing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> {statusMessage} ({progress}%)
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4" /> Start Compression
                  </>
                )}
              </Button>

              {isCompressing && (
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

      {/* Output Result */}
      {outputUrl && (
        <Card className="border-green-500/40 bg-green-500/5">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <h4 className="font-semibold text-sm">Compression Complete</h4>
                  <p className="text-xs text-muted-foreground">{outputName}</p>
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
                <Download className="h-4 w-4" /> Download Compressed Video
              </Button>
            </div>

            {/* Before vs After stats */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-muted/40 rounded-lg text-center">
              <div>
                <div className="text-xs text-muted-foreground">Original Size</div>
                <div className="font-semibold text-sm">{(originalSize / (1024 * 1024)).toFixed(1)} MB</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Compressed Size</div>
                <div className="font-semibold text-sm text-green-600">{(compressedSize / (1024 * 1024)).toFixed(1)} MB</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Space Saved</div>
                <div className="font-semibold text-sm text-green-600">Saved {reductionPercent}%</div>
              </div>
            </div>

            <video
              src={outputUrl}
              controls
              className="w-full rounded-lg border border-border bg-black max-h-[350px] object-contain"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}