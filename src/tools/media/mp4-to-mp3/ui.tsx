"use client";

import { MediaJob, type MediaJobConfig } from "@/components/media/media-job";

const config: MediaJobConfig = {
  input: "any",
  title: "Add an MP4 to convert to MP3",
  hint: "Works with MP4, MOV, WebM and MKV videos, and with M4A audio.",
  formats: ["mp3"],
  action: "Convert to MP3",
  suffix: "audio",
  trim: true,
  audioBitrate: true,
};

export function MP4MP3ConverterEngine() {
  return <MediaJob config={config} />;
}
