"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Clapperboard, Upload, Download, Play, Pause, SkipBack, SkipForward,
  Scissors, Type, Volume2, VolumeX, Gauge, Crop, Image as ImageIcon,
  RotateCcw, Plus, Minus, Clock
} from "lucide-react";

interface TrimRange {
  start: number;
  end: number;
}

interface TextOverlay {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  x: number;
  y: number;
  color: string;
  fontSize: number;
}

export function VideoEditorEngine() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimRange, setTrimRange] = useState<TrimRange>({ start: 0, end: 100 });
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [newOverlayText, setNewOverlayText] = useState("");
  const [showTrimMode, setShowTrimMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setTrimRange({ start: 0, end: 100 });
    setTextOverlays([]);
    setSpeed(1);
    setCurrentTime(0);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      setDuration(video.duration);
      setTrimRange({ start: 0, end: video.duration });
    };
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onEnded = () => setIsPlaying(false);

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
    };
  }, [videoSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    video.volume = isMuted ? 0 : volume;
  }, [speed, volume, isMuted]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seekTo = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(trimRange.start, Math.min(trimRange.end, time));
    setCurrentTime(video.currentTime);
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(trimRange.start, Math.min(trimRange.end, video.currentTime + seconds));
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const addTextOverlay = () => {
    if (!newOverlayText.trim()) return;
    const overlay: TextOverlay = {
      id: Date.now().toString(),
      text: newOverlayText.trim(),
      startTime: currentTime,
      endTime: Math.min(currentTime + 5, duration),
      x: 50,
      y: 50,
      color: "#ffffff",
      fontSize: 24,
    };
    setTextOverlays((prev) => [...prev, overlay]);
    setNewOverlayText("");
  };

  const removeOverlay = (id: string) => {
    setTextOverlays((prev) => prev.filter((o) => o.id !== id));
  };

  const getActiveOverlays = (): TextOverlay[] => {
    return textOverlays.filter((o) => currentTime >= o.startTime && currentTime <= o.endTime);
  };

  const exportFrame = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    // Draw active text overlays
    const activeOverlays = getActiveOverlays();
    activeOverlays.forEach((overlay) => {
      ctx.font = `${overlay.fontSize}px Inter, sans-serif`;
      ctx.fillStyle = overlay.color;
      ctx.fillText(overlay.text, (overlay.x / 100) * canvas.width, (overlay.y / 100) * canvas.height);
    });

    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `frame-${formatTime(currentTime)}.png`;
    a.click();
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const trimStartPercent = duration > 0 ? (trimRange.start / duration) * 100 : 0;
  const trimEndPercent = duration > 0 ? (trimRange.end / duration) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-1.5">
          <Upload className="h-4 w-4" /> Open Video
        </Button>
        <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />

        <Separator orientation="vertical" className="h-8" />

        <Button variant="outline" size="sm" onClick={() => setShowTrimMode(!showTrimMode)} className="gap-1.5">
          <Scissors className="h-4 w-4" /> {showTrimMode ? "Done Trimming" : "Trim"}
        </Button>

        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          {[0.5, 0.75, 1, 1.5, 2].map((s) => (
            <Badge
              key={s}
              variant={speed === s ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSpeed(s)}
            >
              {s}x
            </Badge>
          ))}
        </div>

        <div className="flex-1" />

        <Button variant="outline" size="sm" onClick={exportFrame} className="gap-1.5">
          <ImageIcon className="h-4 w-4" /> Export Frame
        </Button>
      </div>

      {/* Text overlay input */}
      <div className="flex gap-2">
        <Input
          placeholder="Add text overlay..."
          value={newOverlayText}
          onChange={(e) => setNewOverlayText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTextOverlay()}
          className="max-w-xs"
        />
        <Button variant="outline" size="sm" onClick={addTextOverlay}>
          <Plus className="h-4 w-4 mr-1" /> Add Text
        </Button>
        <span className="text-xs text-muted-foreground self-center">
          Text appears at current position for 5 seconds
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Video Player */}
        <div className="lg:col-span-2 space-y-3">
          {videoSrc ? (
            <>
              <div className="relative bg-black rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  src={videoSrc}
                  className="w-full max-h-[400px] object-contain"
                  onClick={togglePlay}
                />

                {/* Text overlays on video */}
                {getActiveOverlays().map((overlay) => (
                  <div
                    key={overlay.id}
                    className="absolute pointer-events-none"
                    style={{
                      left: `${overlay.x}%`,
                      top: `${overlay.y}%`,
                      color: overlay.color,
                      fontSize: `${overlay.fontSize}px`,
                      fontWeight: "bold",
                      textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {overlay.text}
                  </div>
                ))}

                {/* Play overlay */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer" onClick={togglePlay}>
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="h-8 w-8 text-black ml-1" />
                    </div>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                {showTrimMode && (
                  <div className="relative h-6 mb-1">
                    <div className="absolute inset-0 bg-muted rounded" />
                    <div
                      className="absolute top-0 bottom-0 bg-cyan-500/30 rounded border-l-2 border-r-2 border-cyan-500"
                      style={{ left: `${trimStartPercent}%`, right: `${100 - trimEndPercent}%` }}
                    />
                    {/* Trim handles */}
                    <input
                      type="range"
                      min={0}
                      max={duration}
                      step={0.1}
                      value={trimRange.start}
                      onChange={(e) => setTrimRange((prev) => ({ ...prev, start: Math.min(parseFloat(e.target.value), prev.end - 0.5) }))}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    />
                  </div>
                )}
                <div className="relative h-2 bg-muted rounded-full cursor-pointer group" onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = (e.clientX - rect.left) / rect.width;
                  seekTo(pct * duration);
                }}>
                  <div className="absolute h-full bg-cyan-500 rounded-full" style={{ width: `${progressPercent}%` }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `calc(${progressPercent}% - 6px)` }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => skipTime(-10)}>
                  <SkipBack className="h-5 w-5" />
                </Button>
                <Button size="lg" onClick={togglePlay} className="h-12 w-12 rounded-full">
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => skipTime(10)}>
                  <SkipForward className="h-5 w-5" />
                </Button>

                <Separator orientation="vertical" className="h-8 mx-2" />

                <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)}>
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
                  className="w-24"
                />
              </div>
            </>
          ) : (
            <div
              className="w-full h-[400px] rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-muted-foreground/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Clapperboard className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">Click to upload a video</p>
              <p className="text-xs text-muted-foreground/70">MP4, WebM supported</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Trim Info */}
          {showTrimMode && videoSrc && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <Scissors className="h-4 w-4" /> Trim Range
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Start: <strong>{formatTime(trimRange.start)}</strong></span>
                  <span>End: <strong>{formatTime(trimRange.end)}</strong></span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Duration: {formatTime(trimRange.end - trimRange.start)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Speed */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Gauge className="h-4 w-4" /> Speed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{speed}x</span>
                <Slider value={[speed * 50]} onValueChange={([v]) => setSpeed(v / 50)} min={25} max={100} step={12.5} className="flex-1" />
              </div>
            </CardContent>
          </Card>

          {/* Text Overlays */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Type className="h-4 w-4" /> Text Overlays ({textOverlays.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 max-h-[200px] overflow-y-auto">
              {textOverlays.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No text overlays added</p>
              ) : (
                textOverlays.map((overlay) => {
                  const isActive = currentTime >= overlay.startTime && currentTime <= overlay.endTime;
                  return (
                    <div key={overlay.id} className={`flex items-center gap-2 text-xs p-1.5 rounded ${isActive ? "bg-cyan-500/10" : "hover:bg-muted/50"}`}>
                      <span className="truncate flex-1">{overlay.text}</span>
                      <span className="text-muted-foreground shrink-0">
                        {formatTime(overlay.startTime)}-{formatTime(overlay.endTime)}
                      </span>
                      <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive shrink-0" onClick={() => removeOverlay(overlay.id)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-muted-foreground">
              <p>All processing is done locally in your browser.</p>
              <p>No video data is ever uploaded.</p>
              {videoSrc && (
                <p className="mt-2">Duration: {formatTime(duration)}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}