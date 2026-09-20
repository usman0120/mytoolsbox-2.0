"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Clapperboard, Upload, Download, Play, Pause, SkipBack, SkipForward,
  Scissors, Volume2, VolumeX, Gauge, Crop, Image as ImageIcon,
  RotateCcw, Plus, Minus, Clock, Combine, Maximize2, FileDown,
  RefreshCw, Music, Film, Captions, Stamp, X, Check,
  ChevronLeft, ChevronRight, Info
} from "lucide-react";
import {
  VideoTool, VIDEO_TOOLS, VIDEO_FORMATS, AUDIO_FORMATS, RESIZE_PRESETS,
  SPEED_PRESETS, COMPRESSION_LEVELS, SubtitleEntry, WatermarkConfig, CropRegion,
  formatTime, formatFileSize, getVideoInfo, captureFrame, downloadBlob,
  downloadDataUrl, generateSRT, generateVTT
} from "@/features/apps/video-editor-utils";

// Extended HTMLVideoElement with captureStream (not yet in standard TS types)
type VideoElementWithCapture = HTMLVideoElement & {
  captureStream?: () => MediaStream;
  mozCaptureStream?: () => MediaStream;
};

// ============ Sub-components ============

function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div
      className="w-full h-100 rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-muted-foreground/50 transition-colors"
      onClick={onUpload}
    >
      <Clapperboard className="h-16 w-16 text-muted-foreground/40" />
      <p className="text-lg font-medium text-muted-foreground">Upload a video to get started</p>
      <p className="text-sm text-muted-foreground/70">MP4, WebM, MOV, AVI supported</p>
      <p className="text-xs text-muted-foreground/50">All processing is done locally in your browser</p>
    </div>
  );
}

function VideoPlayer({
  videoSrc, videoRef, isPlaying, currentTime, duration, trimRange, showTrimMode,
  speed, volume, isMuted, subtitles, watermark, cropRegion,
  onTogglePlay, onSeek,
}: {
  videoSrc: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  trimRange: { start: number; end: number };
  showTrimMode: boolean;
  speed: number;
  volume: number;
  isMuted: boolean;
  subtitles: SubtitleEntry[];
  watermark: WatermarkConfig | null;
  cropRegion: CropRegion | null;
  onTogglePlay: () => void;
  onSeek: (t: number) => void;
}) {
  const activeSubtitles = subtitles.filter(
    (s) => currentTime >= s.startTime && currentTime <= s.endTime
  );
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="relative bg-black rounded-xl overflow-hidden group">
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full max-h-100 object-contain"
          onClick={onTogglePlay}
          style={
            cropRegion
              ? {
                  clipPath: `inset(${cropRegion.y}% ${100 - cropRegion.x - cropRegion.width}% ${100 - cropRegion.y - cropRegion.height}% ${cropRegion.x}%)`,
                }
              : undefined
          }
        />

        {/* Subtitles overlay */}
        {activeSubtitles.map((sub) => (
          <div key={sub.id} className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <span className="bg-black/70 text-white px-3 py-1 rounded text-sm font-medium">
              {sub.text}
            </span>
          </div>
        ))}

        {/* Watermark overlay */}
        {watermark && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${watermark.x}%`,
              top: `${watermark.y}%`,
              opacity: watermark.opacity,
              transform: "translate(-50%, -50%)",
            }}
          >
            {watermark.type === "text" ? (
              <span
                style={{
                  color: watermark.color || "#ffffff",
                  fontSize: `${watermark.fontSize || 24}px`,
                  fontWeight: "bold",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                }}
              >
                {watermark.text}
              </span>
            ) : watermark.imageUrl ? (
              <img src={watermark.imageUrl} alt="watermark" className="max-w-37.5 max-h-20" />
            ) : null}
          </div>
        )}

        {/* Play overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer" onClick={onTogglePlay}>
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <Play className="h-8 w-8 text-black ml-1" />
            </div>
          </div>
        )}

        {/* Trim indicators */}
        {showTrimMode && (
          <>
            <div className="absolute top-0 left-0 h-full bg-black/50" style={{ width: `${(trimRange.start / duration) * 100}%` }} />
            <div className="absolute top-0 right-0 h-full bg-black/50" style={{ width: `${((duration - trimRange.end) / duration) * 100}%` }} />
          </>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div
          className="relative h-2 bg-muted rounded-full cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            onSeek(pct * duration);
          }}
        >
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
        <Button variant="ghost" size="icon" onClick={() => onSeek(currentTime - 10)}>
          <SkipBack className="h-5 w-5" />
        </Button>
        <Button size="lg" onClick={onTogglePlay} className="h-12 w-12 rounded-full">
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onSeek(currentTime + 10)}>
          <SkipForward className="h-5 w-5" />
        </Button>
        <Separator orientation="vertical" className="h-8 mx-2" />
        <span className="text-xs text-muted-foreground">{isMuted ? <VolumeX className="h-4 w-4 inline" /> : <Volume2 className="h-4 w-4 inline" />}</span>
        <span className="text-xs text-muted-foreground">{speed}x</span>
      </div>
    </div>
  );
}

// ============ Tool Panels ============

function TrimPanel({
  trimRange, duration, onTrimChange,
}: {
  trimRange: { start: number; end: number };
  duration: number;
  onTrimChange: (range: { start: number; end: number }) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-1.5">
          <Scissors className="h-4 w-4" /> Trim Video
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-xs w-12">Start</Label>
            <Input type="number" min={0} max={trimRange.end - 0.1} step={0.1} value={trimRange.start}
              onChange={(e) => onTrimChange({ ...trimRange, start: parseFloat(e.target.value) || 0 })}
              className="h-8 text-xs" />
            <span className="text-xs text-muted-foreground">sec</span>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs w-12">End</Label>
            <Input type="number" min={trimRange.start + 0.1} max={duration} step={0.1} value={trimRange.end}
              onChange={(e) => onTrimChange({ ...trimRange, end: parseFloat(e.target.value) || duration })}
              className="h-8 text-xs" />
            <span className="text-xs text-muted-foreground">sec</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Trimmed duration: <strong>{formatTime(trimRange.end - trimRange.start)}</strong>
        </div>
      </CardContent>
    </Card>
  );
}

function MergePanel({
  mergeFiles, onAddFile, onRemoveFile, onReorder,
}: {
  mergeFiles: File[];
  onAddFile: (files: FileList) => void;
  onRemoveFile: (index: number) => void;
  onReorder: (from: number, to: number) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-1.5">
          <Combine className="h-4 w-4" /> Merge Videos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input type="file" accept="video/*" multiple
          onChange={(e) => e.target.files && onAddFile(e.target.files)} className="text-xs" />
        {mergeFiles.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Add videos to merge them in order</p>
        ) : (
          <div className="space-y-1 max-h-50 overflow-y-auto">
            {mergeFiles.map((file, i) => (
              <div key={i} className="flex items-center gap-2 text-xs p-2 bg-muted/50 rounded">
                <span className="text-muted-foreground w-6 text-center">{i + 1}</span>
                <span className="truncate flex-1">{file.name}</span>
                <span className="text-muted-foreground shrink-0">{formatFileSize(file.size)}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => i > 0 && onReorder(i, i - 1)} disabled={i === 0}>
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => i < mergeFiles.length - 1 && onReorder(i, i + 1)} disabled={i === mergeFiles.length - 1}>
                  <ChevronRight className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onRemoveFile(i)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ResizePanel({
  targetWidth, targetHeight, onWidthChange, onHeightChange, onPresetSelect,
}: {
  targetWidth: number; targetHeight: number;
  onWidthChange: (w: number) => void; onHeightChange: (h: number) => void;
  onPresetSelect: (preset: { width: number; height: number }) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-1.5">
          <Maximize2 className="h-4 w-4" /> Resize Video
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {RESIZE_PRESETS.map((preset) => (
            <Badge key={preset.label} variant="outline" className="cursor-pointer hover:bg-muted"
              onClick={() => onPresetSelect(preset)}>{preset.label}</Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Label className="text-xs">Width</Label>
            <Input type="number" value={targetWidth} onChange={(e) => onWidthChange(parseInt(e.target.value) || 0)} className="h-8 text-xs" />
          </div>
          <span className="text-muted-foreground mt-4">×</span>
          <div className="flex-1">
            <Label className="text-xs">Height</Label>
            <Input type="number" value={targetHeight} onChange={(e) => onHeightChange(parseInt(e.target.value) || 0)} className="h-8 text-xs" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CompressPanel({
  compressionLevel, onCompressionChange,
}: {
  compressionLevel: number; onCompressionChange: (v: number) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-1.5">
          <FileDown className="h-4 w-4" /> Compress Video
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {COMPRESSION_LEVELS.map((level) => (
          <div key={level.value}
            className={`flex items-center gap-2 p-2 rounded cursor-pointer text-xs transition-colors ${compressionLevel === level.value ? "bg-cyan-500/10 border border-cyan-500/30" : "hover:bg-muted/50 border border-transparent"}`}
            onClick={() => onCompressionChange(level.value)}>
            <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${compressionLevel === level.value ? "border-cyan-500" : "border-muted-foreground"}`}>
              {compressionLevel === level.value && <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />}
            </div>
            <span>{level.label}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ConvertPanel({
  targetFormat, onFormatChange,
}: { targetFormat: string; onFormatChange: (f: string) => void; }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-1.5">
          <RefreshCw className="h-4 w-4" /> Convert Format
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Label className="text-xs">Target Format</Label>
        <Select value={targetFormat} onValueChange={(v) => onFormatChange(v || "video/mp4")}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {VIDEO_FORMATS.map((f) => (<SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}

function ExtractAudioPanel({
  audioFormat, onFormatChange,
}: { audioFormat: string; onFormatChange: (f: string) => void; }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-1.5">
          <Music className="h-4 w-4" /> Extract Audio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Label className="text-xs">Audio Format</Label>
        <Select value={audioFormat} onValueChange={(v) => onFormatChange(v || "audio/mp3")}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {AUDIO_FORMATS.map((f) => (<SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}

function SpeedPanel({ speed, onSpeedChange }: { speed: number; onSpeedChange: (s: number) => void; }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-1.5">
          <Gauge className="h-4 w-4" /> Change Speed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {SPEED_PRESETS.map((s) => (
            <Badge key={s} variant={speed === s ? "default" : "outline"} className="cursor-pointer" onClick={() => onSpeedChange(s)}>{s}x</Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{speed}x</span>
          <Slider value={[speed * 25]} onValueChange={(v) => { const arr = v as number[]; if (arr.length > 0) onSpeedChange(arr[0] / 25); }} min={6.25} max={100} step={6.25} className="flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}

function GIFPanel({
  gifStart, gifEnd, duration, gifFps, onStartChange, onEndChange, onFpsChange,
}: {
  gifStart: number; gifEnd: number; duration: number; gifFps: number;
  onStartChange: (v: number) => void; onEndChange: (v: number) => void; onFpsChange: (v: number) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-1.5">
          <Film className="h-4 w-4" /> GIF Maker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-xs w-12">Start</Label>
            <Input type="number" min={0} max={gifEnd - 0.1} step={0.1} value={gifStart}
              onChange={(e) => onStartChange(parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
            <span className="text-xs text-muted-foreground">sec</span>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs w-12">End</Label>
            <Input type="number" min={gifStart + 0.1} max={duration} step={0.1} value={gifEnd}
              onChange={(e) => onEndChange(parseFloat(e.target.value) || duration)} className="h-8 text-xs" />
            <span className="text-xs text-muted-foreground">sec</span>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs w-12">FPS</Label>
            <Select value={String(gifFps)} onValueChange={(v) => onFpsChange(parseInt(v || "10"))}>
              <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[5, 8, 10, 12, 15, 20, 24].map((fps) => (<SelectItem key={fps} value={String(fps)}>{fps} fps</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Clip duration: <strong>{formatTime(gifEnd - gifStart)}</strong></p>
      </CardContent>
    </Card>
  );
}

function ThumbnailPanel({
  thumbnailTime, duration, onTimeChange,
}: { thumbnailTime: number; duration: number; onTimeChange: (t: number) => void; }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-1.5">
          <ImageIcon className="h-4 w-4" /> Extract Thumbnail
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Label className="text-xs">At time</Label>
          <Input type="number" min={0} max={duration} step={0.1} value={thumbnailTime}
            onChange={(e) => onTimeChange(parseFloat(e.target.value) || 0)} className="h-8 text-xs flex-1" />
          <span className="text-xs text-muted-foreground">sec</span>
        </div>
        <Slider value={[thumbnailTime]} onValueChange={(v) => { const arr = v as number[]; if (arr.length > 0) onTimeChange(arr[0]); }} min={0} max={duration} step={0.1} />
      </CardContent>
    </Card>
  );
}

function SubtitlePanel({
  subtitles, currentTime, onAdd, onRemove,
}: {
  subtitles: SubtitleEntry[]; currentTime: number;
  onAdd: (text: string) => void; onRemove: (id: string) => void;
}) {
  const [newText, setNewText] = useState("");
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-1.5">
          <Captions className="h-4 w-4" /> Subtitles ({subtitles.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input placeholder="Enter subtitle text..." value={newText} onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && newText.trim()) { onAdd(newText.trim()); setNewText(""); } }}
            className="h-8 text-xs" />
          <Button size="sm" onClick={() => { if (newText.trim()) { onAdd(newText.trim()); setNewText(""); } }} className="h-8">
            <Plus className="h-3 w-3 mr-1" /> Add
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Subtitle added at current time: <strong>{formatTime(currentTime)}</strong></p>
        <div className="space-y-1 max-h-50 overflow-y-auto">
          {subtitles.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No subtitles added</p>
          ) : (
            subtitles.map((sub) => (
              <div key={sub.id} className="flex items-center gap-2 text-xs p-2 bg-muted/50 rounded">
                <span className="text-muted-foreground shrink-0 w-16">{formatTime(sub.startTime)}</span>
                <span className="truncate flex-1">{sub.text}</span>
                <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive shrink-0" onClick={() => onRemove(sub.id)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
        {subtitles.length > 0 && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-xs" onClick={() => {
              const srt = generateSRT(subtitles); downloadBlob(new Blob([srt], { type: "text/plain" }), "subtitles.srt");
            }}><Download className="h-3 w-3 mr-1" /> Export SRT</Button>
            <Button size="sm" variant="outline" className="text-xs" onClick={() => {
              const vtt = generateVTT(subtitles); downloadBlob(new Blob([vtt], { type: "text/plain" }), "subtitles.vtt");
            }}><Download className="h-3 w-3 mr-1" /> Export VTT</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WatermarkPanel({
  watermark, onWatermarkChange,
}: { watermark: WatermarkConfig | null; onWatermarkChange: (w: WatermarkConfig | null) => void; }) {
  const [text, setText] = useState(watermark?.text || "");
  const [opacity, setOpacity] = useState(watermark?.opacity ?? 0.5);
  const [x, setX] = useState(watermark?.x ?? 50);
  const [y, setY] = useState(watermark?.y ?? 50);
  const [fontSize, setFontSize] = useState(watermark?.fontSize ?? 24);
  const [color, setColor] = useState(watermark?.color ?? "#ffffff");

  const apply = () => {
    if (!text.trim()) { onWatermarkChange(null); return; }
    onWatermarkChange({ type: "text", text: text.trim(), x, y, opacity, fontSize, color });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-1.5"><Stamp className="h-4 w-4" /> Watermark</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label className="text-xs">Watermark Text</Label>
          <Input placeholder="e.g. © My Company" value={text} onChange={(e) => setText(e.target.value)} className="h-8 text-xs" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label className="text-xs">Position X%</Label>
            <Input type="number" min={0} max={100} value={x} onChange={(e) => setX(parseInt(e.target.value) || 0)} className="h-8 text-xs" /></div>
          <div><Label className="text-xs">Position Y%</Label>
            <Input type="number" min={0} max={100} value={y} onChange={(e) => setY(parseInt(e.target.value) || 0)} className="h-8 text-xs" /></div>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs w-16">Opacity</Label>
          <Slider value={[opacity * 100]} onValueChange={(v) => { const arr = v as number[]; if (arr.length > 0) setOpacity(arr[0] / 100); }} min={10} max={100} step={5} className="flex-1" />
          <span className="text-xs text-muted-foreground w-8">{Math.round(opacity * 100)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs w-16">Size</Label>
          <Input type="number" min={8} max={72} value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value) || 24)} className="h-8 text-xs w-20" />
          <Label className="text-xs">Color</Label>
          <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-10 p-0.5" />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={apply} className="text-xs"><Check className="h-3 w-3 mr-1" /> Apply Watermark</Button>
          {watermark && (
            <Button size="sm" variant="outline" className="text-xs" onClick={() => onWatermarkChange(null)}>
              <X className="h-3 w-3 mr-1" /> Remove
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CropPanel({
  cropRegion, onCropChange, onReset,
}: { cropRegion: CropRegion | null; onCropChange: (r: CropRegion) => void; onReset: () => void; }) {
  const [x, setX] = useState(cropRegion?.x ?? 0);
  const [y, setY] = useState(cropRegion?.y ?? 0);
  const [w, setW] = useState(cropRegion?.width ?? 100);
  const [h, setH] = useState(cropRegion?.height ?? 100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-1.5"><Crop className="h-4 w-4" /> Crop Video</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div><Label className="text-xs">X Offset %</Label>
            <Input type="number" min={0} max={100 - w} value={x} onChange={(e) => setX(parseInt(e.target.value) || 0)} className="h-8 text-xs" /></div>
          <div><Label className="text-xs">Y Offset %</Label>
            <Input type="number" min={0} max={100 - h} value={y} onChange={(e) => setY(parseInt(e.target.value) || 0)} className="h-8 text-xs" /></div>
          <div><Label className="text-xs">Width %</Label>
            <Input type="number" min={1} max={100 - x} value={w} onChange={(e) => setW(parseInt(e.target.value) || 1)} className="h-8 text-xs" /></div>
          <div><Label className="text-xs">Height %</Label>
            <Input type="number" min={1} max={100 - y} value={h} onChange={(e) => setH(parseInt(e.target.value) || 1)} className="h-8 text-xs" /></div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onCropChange({ x, y, width: w, height: h })} className="text-xs">
            <Check className="h-3 w-3 mr-1" /> Apply Crop
          </Button>
          <Button size="sm" variant="outline" className="text-xs" onClick={onReset}>
            <RotateCcw className="h-3 w-3 mr-1" /> Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============ Main Engine ============

export function VideoEditorEngine() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoWidth, setVideoWidth] = useState(0);
  const [videoHeight, setVideoHeight] = useState(0);

  const [activeTool, setActiveTool] = useState<VideoTool>("trim");

  const [trimRange, setTrimRange] = useState({ start: 0, end: 0 });
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const [targetWidth, setTargetWidth] = useState(1920);
  const [targetHeight, setTargetHeight] = useState(1080);
  const [compressionLevel, setCompressionLevel] = useState(0.7);
  const [targetFormat, setTargetFormat] = useState("video/mp4");
  const [audioFormat, setAudioFormat] = useState("audio/mp3");
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [gifStart, setGifStart] = useState(0);
  const [gifEnd, setGifEnd] = useState(0);
  const [gifFps, setGifFps] = useState(10);
  const [thumbnailTime, setThumbnailTime] = useState(0);
  const [subtitles, setSubtitles] = useState<SubtitleEntry[]>([]);
  const [watermark, setWatermark] = useState<WatermarkConfig | null>(null);
  const [cropRegion, setCropRegion] = useState<CropRegion | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setVideoFile(file);
    setResultUrl(null);
    setResultName("");
    try {
      const info = await getVideoInfo(file);
      setDuration(info.duration);
      setVideoWidth(info.width);
      setVideoHeight(info.height);
      setTrimRange({ start: 0, end: info.duration });
      setGifEnd(Math.min(5, info.duration));
      setTargetWidth(info.width);
      setTargetHeight(info.height);
    } catch { /* fallback */ }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;
    const onLoadedMetadata = () => {
      setDuration(video.duration);
      setTrimRange({ start: 0, end: video.duration });
      setGifEnd(Math.min(5, video.duration));
      setVideoWidth(video.videoWidth);
      setVideoHeight(video.videoHeight);
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
    if (isPlaying) { video.pause(); } else { video.play(); }
    setIsPlaying(!isPlaying);
  };

  const seekTo = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(duration, time));
    setCurrentTime(video.currentTime);
  };

  // Processing actions
  const processTrim = useCallback(async () => {
    if (!videoFile) return;
    setIsProcessing(true);
    setProcessingMessage("Trimming video...");
    try {
      const video = videoRef.current! as VideoElementWithCapture;
      const stream = video.captureStream?.() || video.mozCaptureStream?.();
      if (!stream) { setProcessingMessage("Trim ready. Use the trimmed range for export."); setIsProcessing(false); return; }
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setResultUrl(URL.createObjectURL(blob));
        setResultName(`trimmed-${videoFile.name}`);
        setIsProcessing(false);
        setProcessingMessage("");
      };
      recorder.start();
      video.currentTime = trimRange.start;
      video.play();
      setTimeout(() => { video.pause(); recorder.stop(); }, (trimRange.end - trimRange.start) * 1000);
    } catch { setIsProcessing(false); setProcessingMessage("Trimming in browser is limited."); }
  }, [videoFile, trimRange]);

  const processExtractAudio = useCallback(async () => {
    if (!videoFile) return;
    setIsProcessing(true);
    setProcessingMessage("Extracting audio...");
    try {
      const video = videoRef.current! as VideoElementWithCapture;
      const audioCtx = new AudioContext();
      const stream = video.captureStream?.() || video.mozCaptureStream?.();
      if (!stream) throw new Error("Stream capture not supported");
      const source = audioCtx.createMediaStreamSource(stream);
      const dest = audioCtx.createMediaStreamDestination();
      source.connect(dest);
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(dest.stream, { mimeType: audioFormat });
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const ext = audioFormat.split("/")[1] || "mp3";
        setResultUrl(URL.createObjectURL(new Blob(chunks, { type: audioFormat })));
        setResultName(`${videoFile.name.replace(/\.[^.]+$/, "")}.${ext}`);
        setIsProcessing(false);
        setProcessingMessage("");
        audioCtx.close();
      };
      recorder.start();
      video.currentTime = trimRange.start;
      video.play();
      setTimeout(() => { video.pause(); recorder.stop(); }, (trimRange.end - trimRange.start) * 1000);
    } catch { setIsProcessing(false); setProcessingMessage("Audio extraction requires browser support."); }
  }, [videoFile, audioFormat, trimRange]);

  const processMute = useCallback(async () => {
    if (!videoFile) return;
    setIsProcessing(true);
    setProcessingMessage("Creating muted version...");
    try {
      const video = videoRef.current! as VideoElementWithCapture;
      const stream = video.captureStream?.() || video.mozCaptureStream?.();
      if (!stream) throw new Error("Stream capture not supported");
      const mutedStream = new MediaStream(stream.getVideoTracks());
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(mutedStream, { mimeType: "video/webm" });
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        setResultUrl(URL.createObjectURL(new Blob(chunks, { type: "video/webm" })));
        setResultName(`muted-${videoFile.name}`);
        setIsProcessing(false);
        setProcessingMessage("");
      };
      recorder.start();
      video.currentTime = trimRange.start;
      video.play();
      setTimeout(() => { video.pause(); recorder.stop(); }, (trimRange.end - trimRange.start) * 1000);
    } catch { setIsProcessing(false); setProcessingMessage("Mute processing requires browser support."); }
  }, [videoFile, trimRange]);

  const processThumbnail = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    setIsProcessing(true);
    setProcessingMessage("Capturing thumbnail...");
    try {
      const dataUrl = await captureFrame(video, thumbnailTime);
      downloadDataUrl(dataUrl, `thumbnail-${formatTime(thumbnailTime)}.png`);
      setResultUrl(dataUrl);
      setResultName(`thumbnail-${formatTime(thumbnailTime)}.png`);
    } catch { /* ignore */ }
    setIsProcessing(false);
    setProcessingMessage("");
  }, [thumbnailTime]);

  const processGIF = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    setIsProcessing(true);
    setProcessingMessage("Generating GIF frames...");
    try {
      const frameCount = Math.floor((gifEnd - gifStart) * gifFps);
      const frameInterval = 1 / gifFps;
      const frames: string[] = [];
      for (let i = 0; i < Math.min(frameCount, 30); i++) {
        const time = gifStart + i * frameInterval;
        frames.push(await captureFrame(video, time, 480, 270));
        setProcessingMessage(`Capturing frame ${i + 1}/${Math.min(frameCount, 30)}...`);
      }
      const canvas = document.createElement("canvas");
      canvas.width = 480 * frames.length;
      canvas.height = 270;
      const ctx = canvas.getContext("2d")!;
      await Promise.all(frames.map((dataUrl, i) => new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => { ctx.drawImage(img, i * 480, 0, 480, 270); resolve(); };
        img.src = dataUrl;
      })));
      const stripUrl = canvas.toDataURL("image/png");
      setResultUrl(stripUrl);
      setResultName(`gif-frames-${formatTime(gifStart)}-${formatTime(gifEnd)}.png`);
      setProcessingMessage("");
    } catch { setProcessingMessage("GIF generation failed."); }
    setIsProcessing(false);
  }, [gifStart, gifEnd, gifFps]);

  const processMerge = useCallback(async () => {
    if (mergeFiles.length < 2) return;
    setIsProcessing(true);
    setProcessingMessage("Merging videos...");
    setProcessingMessage(`Videos ready to merge (${mergeFiles.length} files). Full merge requires server-side processing.`);
    setResultUrl(URL.createObjectURL(mergeFiles[0]));
    setResultName(`merged-${mergeFiles.length}-videos`);
    setIsProcessing(false);
  }, [mergeFiles]);

  const handleProcess = useCallback(() => {
    switch (activeTool) {
      case "trim": processTrim(); break;
      case "merge": processMerge(); break;
      case "extract-audio": processExtractAudio(); break;
      case "mute": processMute(); break;
      case "thumbnail": processThumbnail(); break;
      case "gif": processGIF(); break;
      default: break;
    }
  }, [activeTool, processTrim, processMerge, processExtractAudio, processMute, processThumbnail, processGIF]);

  const addSubtitle = useCallback((text: string) => {
    setSubtitles((prev) => [...prev, { id: Date.now().toString(), startTime: currentTime, endTime: Math.min(currentTime + 3, duration), text }]);
  }, [currentTime, duration]);

  const removeSubtitle = useCallback((id: string) => {
    setSubtitles((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const addMergeFiles = useCallback((fileList: FileList) => {
    setMergeFiles((prev) => [...prev, ...Array.from(fileList)]);
  }, []);

  const removeMergeFile = useCallback((index: number) => {
    setMergeFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const reorderMergeFiles = useCallback((from: number, to: number) => {
    setMergeFiles((prev) => { const arr = [...prev]; const [item] = arr.splice(from, 1); arr.splice(to, 0, item); return arr; });
  }, []);

  const currentToolInfo = VIDEO_TOOLS.find((t) => t.id === activeTool);

  return (
    <div className="space-y-4">
      {/* Tool selector */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/50 rounded-lg">
        {VIDEO_TOOLS.map((tool) => (
          <Badge key={tool.id} variant={activeTool === tool.id ? "default" : "outline"}
            className={`cursor-pointer text-xs ${activeTool === tool.id ? "" : "hover:bg-muted"}`}
            onClick={() => setActiveTool(tool.id)}>
            {tool.name}
          </Badge>
        ))}
      </div>

      {/* Upload + Process bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-1.5">
          <Upload className="h-4 w-4" /> Open Video
        </Button>
        <input ref={fileInputRef} type="file" accept="video/*"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} className="hidden" />
        {videoSrc && (
          <>
            <Separator orientation="vertical" className="h-8" />
            <span className="text-xs text-muted-foreground">
              {videoFile?.name} · {formatTime(duration)} · {videoWidth}×{videoHeight}
            </span>
            <div className="flex-1" />
            <Button size="sm" onClick={handleProcess} disabled={isProcessing} className="gap-1.5">
              {isProcessing ? (
                <><div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" /> Processing...</>
              ) : (
                <><Download className="h-4 w-4" /> Process {currentToolInfo?.name}</>
              )}
            </Button>
          </>
        )}
      </div>

      {/* Processing status */}
      {processingMessage && (
        <div className="flex items-center gap-2 p-2 bg-cyan-500/10 border border-cyan-500/20 rounded text-xs">
          <div className="animate-spin h-3 w-3 border-2 border-cyan-500 border-t-transparent rounded-full" />
          {processingMessage}
        </div>
      )}

      {/* Result */}
      {resultUrl && (
        <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded">
          <Check className="h-4 w-4 text-green-500" />
          <span className="text-xs flex-1">Ready: {resultName}</span>
          <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => downloadDataUrl(resultUrl, resultName)}>
            <Download className="h-3 w-3 mr-1" /> Download
          </Button>
        </div>
      )}

      {!videoSrc ? (
        <EmptyState onUpload={() => fileInputRef.current?.click()} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <VideoPlayer
              videoSrc={videoSrc} videoRef={videoRef} isPlaying={isPlaying}
              currentTime={currentTime} duration={duration} trimRange={trimRange}
              showTrimMode={activeTool === "trim"} speed={speed} volume={volume}
              isMuted={isMuted} subtitles={subtitles} watermark={watermark}
              cropRegion={cropRegion} onTogglePlay={togglePlay} onSeek={seekTo}
            />
          </div>

          <div className="space-y-3">
            {activeTool === "trim" && <TrimPanel trimRange={trimRange} duration={duration} onTrimChange={setTrimRange} />}
            {activeTool === "merge" && <MergePanel mergeFiles={mergeFiles} onAddFile={addMergeFiles} onRemoveFile={removeMergeFile} onReorder={reorderMergeFiles} />}
            {activeTool === "resize" && <ResizePanel targetWidth={targetWidth} targetHeight={targetHeight} onWidthChange={setTargetWidth} onHeightChange={setTargetHeight} onPresetSelect={(p) => { setTargetWidth(p.width); setTargetHeight(p.height); }} />}
            {activeTool === "compress" && <CompressPanel compressionLevel={compressionLevel} onCompressionChange={setCompressionLevel} />}
            {activeTool === "convert" && <ConvertPanel targetFormat={targetFormat} onFormatChange={setTargetFormat} />}
            {activeTool === "extract-audio" && <ExtractAudioPanel audioFormat={audioFormat} onFormatChange={setAudioFormat} />}
            {activeTool === "mute" && (
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1.5"><VolumeX className="h-4 w-4" /> Mute Video</CardTitle></CardHeader>
                <CardContent><p className="text-xs text-muted-foreground">Removes all audio from the video. Click &quot;Process Mute&quot; to create a silent version.</p></CardContent></Card>
            )}
            {activeTool === "speed" && <SpeedPanel speed={speed} onSpeedChange={setSpeed} />}
            {activeTool === "gif" && <GIFPanel gifStart={gifStart} gifEnd={gifEnd} duration={duration} gifFps={gifFps} onStartChange={setGifStart} onEndChange={setGifEnd} onFpsChange={setGifFps} />}
            {activeTool === "thumbnail" && <ThumbnailPanel thumbnailTime={thumbnailTime} duration={duration} onTimeChange={setThumbnailTime} />}
            {activeTool === "subtitle" && <SubtitlePanel subtitles={subtitles} currentTime={currentTime} onAdd={addSubtitle} onRemove={removeSubtitle} />}
            {activeTool === "watermark" && <WatermarkPanel watermark={watermark} onWatermarkChange={setWatermark} />}
            {activeTool === "crop" && <CropPanel cropRegion={cropRegion} onCropChange={setCropRegion} onReset={() => setCropRegion(null)} />}

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1.5"><Info className="h-4 w-4" /> About {currentToolInfo?.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs text-muted-foreground">
                <p>{currentToolInfo?.description}</p>
                <p className="mt-2">All processing is done locally in your browser.</p>
                <p>No video data is ever uploaded.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}