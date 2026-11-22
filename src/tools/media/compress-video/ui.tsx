"use client";

import { MediaJob, type MediaJobConfig } from "@/components/media/media-job";

const config: MediaJobConfig = {
  input: "video",
  title: "Add a video to compress",
  hint: "MP4, MOV, WebM or MKV. Pick a quality, or a target size such as 10 MB for email or messaging apps.",
  formats: ["mp4", "webm"],
  action: "Compress video",
  suffix: "compressed",
  trim: true,
  targetSize: true,
  resolution: true,
  mute: true,
  defaults: {
    quality: "medium",
    resolution: 720,
    mode: "quality",
    targetMb: 10,
  },
};

export function VideoCompressorEngine() {
  return <MediaJob config={config} />;
}
