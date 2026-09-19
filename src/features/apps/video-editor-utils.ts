// Video Editor Utilities
// All processing is client-side using browser APIs (Canvas, MediaRecorder, Web Audio API)

export type VideoTool =
  | "trim"
  | "merge"
  | "resize"
  | "compress"
  | "convert"
  | "extract-audio"
  | "mute"
  | "speed"
  | "gif"
  | "thumbnail"
  | "subtitle"
  | "watermark"
  | "crop";

export interface VideoToolInfo {
  id: VideoTool;
  name: string;
  icon: string;
  description: string;
}

export const VIDEO_TOOLS: VideoToolInfo[] = [
  { id: "trim", name: "Trim", icon: "Scissors", description: "Cut start and end of video" },
  { id: "merge", name: "Merge", icon: "Combine", description: "Combine multiple videos into one" },
  { id: "resize", name: "Resize", icon: "Maximize2", description: "Change video dimensions" },
  { id: "compress", name: "Compress", icon: "FileDown", description: "Reduce file size" },
  { id: "convert", name: "Convert", icon: "RefreshCw", description: "Convert between formats" },
  { id: "extract-audio", name: "Extract Audio", icon: "Music", description: "Extract audio as MP3/WAV" },
  { id: "mute", name: "Mute", icon: "VolumeX", description: "Remove audio from video" },
  { id: "speed", name: "Speed", icon: "Gauge", description: "Speed up or slow down" },
  { id: "gif", name: "GIF Maker", icon: "Film", description: "Convert clip to animated GIF" },
  { id: "thumbnail", name: "Thumbnail", icon: "Image", description: "Extract thumbnail frames" },
  { id: "subtitle", name: "Subtitles", icon: "Captions", description: "Add subtitle tracks" },
  { id: "watermark", name: "Watermark", icon: "Stamp", description: "Add image/text watermark" },
  { id: "crop", name: "Crop", icon: "Crop", description: "Crop video to region" },
];

export const VIDEO_FORMATS = [
  { value: "video/mp4", label: "MP4" },
  { value: "video/webm", label: "WebM" },
  { value: "video/ogg", label: "OGG" },
  { value: "video/avi", label: "AVI" },
  { value: "video/quicktime", label: "MOV" },
];

export const AUDIO_FORMATS = [
  { value: "audio/mp3", label: "MP3" },
  { value: "audio/wav", label: "WAV" },
  { value: "audio/ogg", label: "OGG" },
  { value: "audio/webm", label: "WebM Audio" },
];

export const RESIZE_PRESETS = [
  { label: "4K (3840×2160)", width: 3840, height: 2160 },
  { label: "1080p (1920×1080)", width: 1920, height: 1080 },
  { label: "720p (1280×720)", width: 1280, height: 720 },
  { label: "480p (854×480)", width: 854, height: 480 },
  { label: "360p (640×360)", width: 640, height: 360 },
  { label: "Square (1080×1080)", width: 1080, height: 1080 },
  { label: "Portrait (1080×1920)", width: 1080, height: 1920 },
];

export const SPEED_PRESETS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];

export const COMPRESSION_LEVELS = [
  { value: 0.9, label: "High Quality (larger file)" },
  { value: 0.7, label: "Balanced" },
  { value: 0.5, label: "Good Compression" },
  { value: 0.3, label: "Maximum Compression (smaller file)" },
];

export interface SubtitleEntry {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

export interface WatermarkConfig {
  type: "text" | "image";
  text?: string;
  imageUrl?: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  opacity: number; // 0-1
  fontSize?: number;
  color?: string;
}

export interface CropRegion {
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage
  height: number; // percentage
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function getVideoInfo(file: File): Promise<{ duration: number; width: number; height: number; size: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        size: file.size,
      });
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Failed to load video metadata"));
    };
    video.src = URL.createObjectURL(file);
  });
}

export function captureFrame(
  video: HTMLVideoElement,
  time: number,
  width?: number,
  height?: number
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = width || video.videoWidth;
    canvas.height = height || video.videoHeight;
    const ctx = canvas.getContext("2d")!;

    const seekHandler = () => {
      video.removeEventListener("seeked", seekHandler);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/png"));
    };

    video.addEventListener("seeked", seekHandler);
    video.currentTime = time;
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

// Generate a simple SRT subtitle file content
export function generateSRT(subtitles: SubtitleEntry[]): string {
  return subtitles
    .map((sub, i) => {
      const startStr = formatSRTTime(sub.startTime);
      const endStr = formatSRTTime(sub.endTime);
      return `${i + 1}\n${startStr} --> ${endStr}\n${sub.text}\n`;
    })
    .join("\n");
}

function formatSRTTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`;
}

// Generate a simple VTT subtitle file content
export function generateVTT(subtitles: SubtitleEntry[]): string {
  return (
    "WEBVTT\n\n" +
    subtitles
      .map((sub, i) => {
        const startStr = formatVTTTime(sub.startTime);
        const endStr = formatVTTTime(sub.endTime);
        return `${i + 1}\n${startStr} --> ${endStr}\n${sub.text}\n`;
      })
      .join("\n")
  );
}

function formatVTTTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
}