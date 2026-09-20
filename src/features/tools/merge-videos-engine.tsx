"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Film, Upload, Download, Loader2, CheckCircle2, XCircle,
  Plus, Trash2, GripVertical, Play, ArrowUp, ArrowDown,
} from "lucide-react";

interface VideoFile {
  id: string;
  file: File;
  name: string;
  size: number;
}

export function MergeVideosEngine() {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddVideos = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError(null);
    setOutputUrl(null);

    const newVideos: VideoFile[] = [];
    for (const file of files) {
      if (!file.type.startsWith("video/")) {
        setError(`"${file.name}" is not a valid video file.`);
        continue;
      }
      if (file.size > 500 * 1024 * 1024) {
        setError(`"${file.name}" exceeds 500MB limit.`);
        continue;
      }
      newVideos.push({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
      });
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
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
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

    try {
      // We'll merge by recording each video sequentially onto a canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      let maxWidth = 640;
      let maxHeight = 360;

      // Determine max dimensions from first video
      const firstVideo = document.createElement("video");
      const firstUrl = URL.createObjectURL(videos[0].file);
      firstVideo.src = firstUrl;
      firstVideo.muted = true;

      await new Promise<void>((resolve, reject) => {
        firstVideo.onloadedmetadata = () => {
          maxWidth = firstVideo.videoWidth || 640;
          maxHeight = firstVideo.videoHeight || 360;
          resolve();
        };
        firstVideo.onerror = () => reject(new Error("Failed to load video"));
        firstVideo.load();
      });

      canvas.width = maxWidth;
      canvas.height = maxHeight;

      const stream = canvas.captureStream(30);
      const audioContext = new AudioContext();
      const audioDest = audioContext.createMediaStreamDestination();

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

      const mediaRecorder = new MediaRecorder(
        new MediaStream([...stream.getVideoTracks(), ...audioDest.stream.getAudioTracks()]),
        { mimeType, videoBitsPerSecond: 5000000 }
      );

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setOutputUrl(url);
        setProgress(100);
        audioContext.close();
        toast.success("Videos merged successfully!");
      };

      mediaRecorder.start();
      setProgress(5);

      // Process each video sequentially
      for (let i = 0; i < videos.length; i++) {
        const videoFile = videos[i];
        const videoUrl = URL.createObjectURL(videoFile.file);
        const video = document.createElement("video");
        video.src = videoUrl;
        video.muted = true;

        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => resolve();
          video.onerror = () => reject(new Error(`Failed to load: ${videoFile.name}`));
          video.load();
        });

        const source = audioContext.createMediaElementSource(video);
        source.connect(audioDest);
        source.connect(audioContext.destination);

        await video.play();

        const drawFrame = () => {
          if (!video.ended && !video.paused) {
            ctx.drawImage(video, 0, 0, maxWidth, maxHeight);
            requestAnimationFrame(drawFrame);
          }
        };
        drawFrame();

        await new Promise<void>((resolve) => {
          video.onended = () => {
            source.disconnect();
            URL.revokeObjectURL(videoUrl);
            resolve();
          };
        });

        const baseProgress = 5 + (i / videos.length) * 85;
        setProgress(Math.round(baseProgress));
      }

      mediaRecorder.stop();

    } catch (err) {
      const message = err instanceof Error ? err.message : "Merge failed";
      setError(message);
      toast.error("Merge failed: " + message);
    } finally {
      setIsMerging(false);
    }
  }, [videos]);

  const totalSize = videos.reduce((sum, v) => sum + v.size, 0);

  return (
    <div className="space-y-4">
      <Badge variant="outline" className="gap-1.5">
        <Film className="h-3.5 w-3.5" /> Merge Videos
      </Badge>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Videos</CardTitle>
        </CardHeader>
        <CardContent>
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
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="font-medium">Add videos to merge</p>
            <p className="text-sm text-muted-foreground">Click to browse or drop files — Max 500MB each</p>
          </div>
        </CardContent>
      </Card>

      {/* Video list */}
      {videos.length > 0 && (
        <Card>
          <CardContent className="py-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{videos.length} video{videos.length !== 1 ? "s" : ""}</span>
                <span className="text-muted-foreground">
                  Total: {(totalSize / (1024 * 1024)).toFixed(1)} MB
                </span>
              </div>
              <div className="space-y-1">
                {videos.map((video, idx) => (
                  <div
                    key={video.id}
                    className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground w-6">{idx + 1}.</span>
                    <span className="text-sm flex-1 truncate">{video.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(video.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveVideo(video.id, "up")}
                      disabled={idx === 0}
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveVideo(video.id, "down")}
                      disabled={idx === videos.length - 1}
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => removeVideo(video.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
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

      {isMerging && (
        <Card>
          <CardContent className="py-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Merging videos... {progress}%</span>
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
                  <p className="font-medium text-sm">Merged!</p>
                  <p className="text-xs text-muted-foreground">merged_video.webm</p>
                </div>
              </div>
              <Button size="sm" className="gap-1.5" onClick={() => { const a = document.createElement("a"); a.href = outputUrl; a.download = "merged_video.webm"; a.click(); }}>
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleMerge}
        disabled={videos.length < 2 || isMerging}
        className="w-full gap-2"
      >
        {isMerging ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Merging...</>
        ) : (
          <><Play className="h-4 w-4" /> Merge {videos.length} Videos</>
        )}
      </Button>
    </div>
  );
}