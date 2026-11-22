"use client";

import { MediaJob, type MediaJobConfig } from "@/components/media/media-job";

const config: MediaJobConfig = {
  input: "audio",
  title: "Add an audio file to convert",
  hint: "Convert between MP3, M4A (AAC), WAV and Ogg (Opus). Trim the start and end if you need to.",
  formats: ["mp3", "m4a", "wav", "ogg"],
  action: "Convert audio",
  suffix: "converted",
  trim: true,
  audioBitrate: true,
};

export function AudioConverterEngine() {
  return <MediaJob config={config} />;
}
