"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Film, Upload, Download, Loader2, CheckCircle2, XCircle,
  Plus, Trash2, ArrowUp, ArrowDown, Play, Settings2, Sparkles,
  Layers, Clapperboard,
} from "lucide-react";

interface QueuedVideo {
  id: string;
  file: File;
  name: string;
  size: number;
  duration: number;
  width: number;
  height: number;
  thumbnailUrl?: string;
}

type FitMode = "letterbox" | "cover" | "blur-bg";

export function MergeVideosEngine() {
  const [videos, setVideos] = useState<QueuedVideo[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  // Settings
  const [fitMode, setFitMode] = useState<FitMode>("letterbox");
  const [outputQuality, setOutputQuality] = useState<"1080p" | "720p">("1080p");
  const [fadeTransition, setFadeTransition] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddVideos = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError(null);
    setOutputUrl(null);

    const newVideos: QueuedVideo[] = [];

    for (const file of files) {
      if (!file.type.startsWith("video/")) {
        setError(`"${file.name}" is not a valid video file.`);
        continue;
      }
      if (file.size > 500 * 1024 * 1024) {
        setError(`"${file.name}" exceeds 500MB limit.`);
        continue;
      }

      // Read metadata & generate thumbnail
      const url = URL.createObjectURL(file);
      const v = document.createElement("video");
      v.src = url;
      v.muted = true;

      await new Promise<void>((resolve) => {
        v.onloadedmetadata = () => resolve();
        v.onerror = () => resolve();
      });

      // Quick canvas snapshot for thumbnail
      let thumb = "";
      try {
        v.currentTime = Math.min(1, v.duration / 2);
        await new Promise<void>((r) => { v.onseeked = () => r(); setTimeout(r, 400); });
        const canvas = document.createElement("canvas");
        canvas.width = 160;
        canvas.height = 90;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(v, 0, 0, 160, 90);
          thumb = canvas.toDataURL("image/jpeg", 0.6);
        }
      } catch {
        // Thumbnail generation optional
      }

      newVideos.push({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        duration: v.duration || 0,
        width: v.videoWidth || 1280,
        height: v.videoHeight || 720,
        thumbnailUrl: thumb,
      });

      URL.revokeObjectURL(url);
    }

    setVideos((prev) => [...prev, ...newVideos]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const removeVideo = useCallback((id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
    setOutputUrl(null);
  }, []);

  const moveVideo = useCallback((id: string, direction: "up" | "down") => {
    setVideos((prev) => {
      const idx = prev.findIndex((v) => v.id === id);
      if (idx === -1) return prev;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[targetIdx]] = [copy[targetIdx], copy[idx]];
      return copy;
    });
  }, []);

  const handleMerge = useCallback(async () => {
    if (videos.length < 2) {
      setError("Please add at least 2 videos to merge.");
      return;
    }

    setIsMerging(true);
    setError(null);
    setProgress(0);
    setStatusMessage("Initializing video canvas & audio mixer...");

    try {
      const targetWidth = outputQuality === "1080p" ? 1920 : 1280;
      const targetHeight = outputQuality === "1080p" ? 1080 : 720;
      const targetFps = 30;

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

      const canvasStream = canvas.captureStream(targetFps);

      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const audioDest = audioCtx.createMediaStreamDestination();

      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioDest.stream.getAudioTracks(),
      ]);

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : "video/webm";

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: outputQuality === "1080p" ? 6000000 : 3500000,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const completionPromise = new Promise<Blob>((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
      });

      recorder.start(250);

      const totalVideosDuration = videos.reduce((acc, v) => acc + (v.duration || 5), 0);
      let elapsedRecorded = 0;

      // Sequentially play and draw each video
      for (let i = 0; i < videos.length; i++) {
        const item = videos[i];
        setStatusMessage(`Rendering clip ${i + 1} of ${videos.length}: "${item.name}"...`);

        const videoEl = document.createElement("video");
        const videoUrl = URL.createObjectURL(item.file);
        videoEl.src = videoUrl;
        videoEl.muted = true;
        videoEl.playsInline = true;

        await new Promise<void>((resolve, reject) => {
          videoEl.onloadedmetadata = () => resolve();
          videoEl.onerror = () => reject(new Error(`Failed to load ${item.name}`));
          videoEl.load();
        });

        // Connect audio
        let sourceNode: MediaElementAudioSourceNode | null = null;
        try {
          sourceNode = audioCtx.createMediaElementSource(videoEl);
          sourceNode.connect(audioDest);
        } catch {
          // Audio source may fail if video has no audio track
        }

        videoEl.currentTime = 0;
        await videoEl.play();

        const clipDuration = videoEl.duration || item.duration || 1;
        let isClipActive = true;

        const drawFrame = () => {
          if (!isClipActive) return;

          // Clear canvas with black
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, targetWidth, targetHeight);

          const vw = videoEl.videoWidth || targetWidth;
          const vh = videoEl.videoHeight || targetHeight;

          if (fitMode === "blur-bg") {
            // Blurred background
            ctx.save();
            ctx.filter = "blur(20px) brightness(0.6)";
            ctx.drawImage(videoEl, -20, -20, targetWidth + 40, targetHeight + 40);
            ctx.restore();
          }

          if (fitMode === "cover") {
            const scale = Math.max(targetWidth / vw, targetHeight / vh);
            const w = vw * scale;
            const h = vh * scale;
            const x = (targetWidth - w) / 2;
            const y = (targetHeight - h) / 2;
            ctx.drawImage(videoEl, x, y, w, h);
          } else {
            // Letterbox
            const scale = Math.min(targetWidth / vw, targetHeight / vh);
            const w = vw * scale;
            const h = vh * scale;
            const x = (targetWidth - w) / 2;
            const y = (targetHeight - h) / 2;
            ctx.drawImage(videoEl, x, y, w, h);
          }

          // Optional fade in/out effect at clip boundary
          if (fadeTransition) {
            const curTime = videoEl.currentTime;
            if (curTime < 0.4) {
              ctx.fillStyle = `rgba(0, 0, 0, ${1 - curTime / 0.4})`;
              ctx.fillRect(0, 0, targetWidth, targetHeight);
            } else if (clipDuration - curTime < 0.4) {
              ctx.fillStyle = `rgba(0, 0, 0, ${1 - (clipDuration - curTime) / 0.4})`;
              ctx.fillRect(0, 0, targetWidth, targetHeight);
            }
          }

          const currentTotalElapsed = elapsedRecorded + videoEl.currentTime;
          const pct = Math.min(95, Math.round((currentTotalElapsed / totalVideosDuration) * 100));
          setProgress(pct);

          requestAnimationFrame(drawFrame);
        };

        drawFrame();

        await new Promise<void>((resolve) => {
          videoEl.onended = () => {
            isClipActive = false;
            resolve();
          };
          setTimeout(() => {
            if (isClipActive) {
              isClipActive = false;
              resolve();
            }
          }, (clipDuration + 2) * 1000);
        });

        elapsedRecorded += clipDuration;
        if (sourceNode) sourceNode.disconnect();
        URL.revokeObjectURL(videoUrl);
      }

      recorder.stop();
      setStatusMessage("Finalizing merged output...");
      const finalBlob = await completionPromise;
      audioCtx.close().catch(() => {});

      const url = URL.createObjectURL(finalBlob);
      setOutputUrl(url);
      setOutputSize(finalBlob.size);
      setProgress(100);
      setStatusMessage("Done!");
      toast.success("Videos merged successfully!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Merge operation failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsMerging(false);
    }
  }, [videos, fitMode, outputQuality, fadeTransition]);

  const totalSize = videos.reduce((acc, v) => acc + v.size, 0);
  const totalDuration = videos.reduce((acc, v) => acc + v.duration, 0);

  return (
    <div className="space-y-6">
      <Badge variant="outline" className="gap-1.5">
        <Clapperboard className="h-3.5 w-3.5" /> Video Merger & Stitcher
      </Badge>

      {/* Upload Zone */}
      <Card className="border-2 border-dashed">
        <CardContent className="p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            multiple
            onChange={handleAddVideos}
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer space-y-2"
          >
            <Plus className="h-10 w-10 text-primary opacity-80 mx-auto" />
            <h3 className="font-semibold text-base">Add Videos to Combine</h3>
            <p className="text-xs text-muted-foreground">
              Select multiple videos in any order. MP4, WebM, MOV supported up to 500MB each.
            </p>
            <Button size="sm" className="gap-1.5 mt-1">
              <Upload className="h-3.5 w-3.5" /> Add Video Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Video Queue List */}
      {videos.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between text-sm">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" /> Playlist Sequence ({videos.length} videos)
              </CardTitle>
              <div className="text-xs text-muted-foreground">
                Total: {(totalSize / (1024 * 1024)).toFixed(1)} MB • ~{Math.round(totalDuration)}s
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {videos.map((v, idx) => (
              <div
                key={v.id}
                className="flex items-center gap-3 p-2.5 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
              >
                <span className="text-xs font-mono font-bold text-muted-foreground w-5 text-center">
                  #{idx + 1}
                </span>

                {/* Thumbnail */}
                <div className="w-16 h-10 rounded bg-black/40 overflow-hidden flex items-center justify-center shrink-0 border">
                  {v.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  ) : (
                    <Film className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{v.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {v.width}×{v.height} • {v.duration.toFixed(1)}s • {(v.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={idx === 0}
                    onClick={() => moveVideo(v.id, "up")}
                    title="Move up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={idx === videos.length - 1}
                    onClick={() => moveVideo(v.id, "down")}
                    title="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                    onClick={() => removeVideo(v.id)}
                    title="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Settings Bar */}
      {videos.length >= 2 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-primary" /> Merge Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Aspect Ratio / Fit Style</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: "letterbox", label: "Letterbox" },
                      { id: "cover", label: "Fill / Crop" },
                      { id: "blur-bg", label: "Blur Padding" },
                    ] as const
                  ).map((m) => (
                    <Button
                      key={m.id}
                      size="sm"
                      variant={fitMode === m.id ? "default" : "outline"}
                      className="text-xs h-8"
                      onClick={() => setFitMode(m.id)}
                    >
                      {m.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Output Quality</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: "1080p", label: "1080p Full HD" },
                      { id: "720p", label: "720p Fast" },
                    ] as const
                  ).map((q) => (
                    <Button
                      key={q.id}
                      size="sm"
                      variant={outputQuality === q.id ? "default" : "outline"}
                      className="text-xs h-8"
                      onClick={() => setOutputQuality(q.id)}
                    >
                      {q.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pt-1 border-t">
              <input
                type="checkbox"
                checked={fadeTransition}
                onChange={(e) => setFadeTransition(e.target.checked)}
                className="rounded"
              />
              <span>Add smooth fade transition between video clips</span>
            </label>

            <Button
              onClick={handleMerge}
              disabled={isMerging}
              className="w-full gap-2 font-semibold"
              size="lg"
            >
              {isMerging ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {statusMessage} ({progress}%)
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Merge {videos.length} Videos Together
                </>
              )}
            </Button>

            {isMerging && (
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
                  <h4 className="font-semibold text-sm">Videos Merged Successfully!</h4>
                  <p className="text-xs text-muted-foreground">
                    {outputSize ? `${(outputSize / (1024 * 1024)).toFixed(1)} MB` : ""} • merged_video.webm
                  </p>
                </div>
              </div>
              <Button
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = outputUrl;
                  a.download = "merged_video.webm";
                  a.click();
                }}
              >
                <Download className="h-4 w-4" /> Download Merged Video
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