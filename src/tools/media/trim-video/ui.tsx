"use client";

import { MediaJob, type MediaJobConfig } from "@/components/media/media-job";

const config: MediaJobConfig = {
  input: "video",
  title: "Add a video to trim",
  hint: "Cut the start and end of a video. Drag the handles or set them at the playhead.",
  formats: ["mp4", "webm"],
  action: "Trim video",
  suffix: "trimmed",
  trim: true,
  mute: true,
  defaults: {
    quality: "high",
  },
};

export function TrimVideo() {
  return <MediaJob config={config} />;
}
