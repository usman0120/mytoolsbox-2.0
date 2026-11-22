"use client";

import { MediaJob, type MediaJobConfig } from "@/components/media/media-job";

const config: MediaJobConfig = {
  input: "video",
  title: "Add a video to convert",
  hint: "Convert MOV, MKV, WebM or MP4 to MP4 (plays everywhere) or WebM (smaller, for the web).",
  formats: ["mp4", "webm"],
  action: "Convert video",
  suffix: "converted",
  trim: true,
  resolution: true,
  defaults: {
    quality: "high",
  },
};

export function ConvertVideo() {
  return <MediaJob config={config} />;
}
