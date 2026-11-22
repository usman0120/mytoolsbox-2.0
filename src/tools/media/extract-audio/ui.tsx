"use client";

import { MediaJob, type MediaJobConfig } from "@/components/media/media-job";

const config: MediaJobConfig = {
  input: "any",
  title: "Add a video to extract its audio",
  hint: "Save the soundtrack of an MP4, MOV, WebM or MKV video as MP3, M4A, WAV or Ogg.",
  formats: ["mp3", "m4a", "wav", "ogg"],
  action: "Extract audio",
  suffix: "audio",
  trim: true,
  audioBitrate: true,
};

export function ExtractAudioFromVideoEngine() {
  return <MediaJob config={config} />;
}
