"use client";

import { MediaJob, type MediaJobConfig } from "@/components/media/media-job";

const config: MediaJobConfig = {
  input: "video",
  title: "Add a video to resize",
  hint: "Change the resolution, or reframe for social media: 9:16 for stories and reels, 1:1 or 4:5 for feeds, 16:9 for video sites.",
  formats: ["mp4", "webm"],
  action: "Resize video",
  suffix: "resized",
  trim: true,
  resolution: true,
  aspect: true,
  mute: true,
  defaults: {
    quality: "high",
  },
};

export function VideoResizerEngine() {
  return <MediaJob config={config} />;
}
