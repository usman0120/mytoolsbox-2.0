export function planGifFrames(
  videoDuration: number,
  startTime: number,
  duration: number,
  fps: number,
  speed = 1,
) {
  if (![videoDuration, startTime, duration, fps, speed].every(Number.isFinite) ||
      videoDuration <= 0 || startTime < 0 || startTime >= videoDuration ||
      duration <= 0 || fps <= 0 || speed <= 0) {
    throw new Error("Invalid video clip or animation settings.");
  }

  const clipDuration = Math.min(duration, videoDuration - startTime);
  const clipEnd = startTime + clipDuration;
  const frameCount = Math.max(1, Math.floor((clipDuration / speed) * fps));
  const frameTimes = Array.from({ length: frameCount }, (_, index) => startTime + index * speed / fps)
    .filter((time, index, times) => time < clipEnd && (index === 0 || time > times[index - 1]));

  return { frameTimes, frameDelay: Math.round(1000 / fps) };
}