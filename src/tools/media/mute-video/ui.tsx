"use client";

import { MediaJob, type MediaJobConfig } from "@/components/media/media-job";

const config: MediaJobConfig = {
  input: "video",
  title: "Add a video to mute",
  hint: "Remove the sound from a video. The picture is kept at full quality.",
  formats: ["mp4", "webm"],
  action: "Remove sound",
  suffix: "muted",
  trim: true,
  mute: "always",
  defaults: {
    quality: "high",
  },
};

export function MuteVideo() {
  return <MediaJob config={config} />;
}
