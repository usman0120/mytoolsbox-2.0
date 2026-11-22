"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { FileDrop, Segmented } from "@/components/tools/file-drop";
import { baseName, download, formatBytes } from "@/lib/image/canvas";
import { aspectFrame, capShortSide, formatTime, type Fit, type OutFormat } from "@/lib/media/plan";
import { FORMAT_INFO, probe, transcode, type MediaInfo, type TranscodeOptions } from "@/lib/media/transcode";

export interface MediaJobConfig {
  input: "video" | "audio" | "any";
  title: string;
  hint: string;
  formats: OutFormat[];
  action: string;
  suffix: string;
  trim?: boolean;
  /** Offer "Target size" as well as quality presets. */
  targetSize?: boolean;
  quality?: boolean;
  resolution?: boolean;
  aspect?: boolean;
  mute?: boolean | "always";
  audioBitrate?: boolean;
  defaults?: { quality?: "low" | "medium" | "high"; resolution?: number; mode?: "quality" | "size"; targetMb?: number };
}

const ACCEPT = {
  video: "video/mp4,video/quicktime,video/webm,video/x-matroska,.mkv,.mov",
  audio: "audio/*,.m4a,.mp3,.wav,.ogg,.opus,.flac,.aac",
  any: "video/mp4,video/quicktime,video/webm,video/x-matroska,.mkv,.mov,audio/*,.m4a,.mp3,.wav,.ogg,.opus,.flac,.aac",
};
const RESOLUTIONS = [0, 1080, 720, 480, 360];
const ASPECTS: { id: string; label: string; ratio?: [number, number] }[] = [
  { id: "original", label: "Original" },
  { id: "16:9", label: "16:9", ratio: [16, 9] },
  { id: "9:16", label: "9:16", ratio: [9, 16] },
  { id: "1:1", label: "1:1", ratio: [1, 1] },
  { id: "4:5", label: "4:5", ratio: [4, 5] },
];

type Result = { blob: Blob; url: string; name: string };

export function MediaJob({ config }: { config: MediaJobConfig }) {
  const [file, setFile] = useState<File | null>(null);
  const [info, setInfo] = useState<MediaInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<[number, number]>([0, 0]);
  const [format, setFormat] = useState<OutFormat>(config.formats[0]);
  const [mode, setMode] = useState<"quality" | "size">(config.defaults?.mode ?? "quality");
  const [quality, setQuality] = useState<"low" | "medium" | "high">(config.defaults?.quality ?? "medium");
  const [targetMb, setTargetMb] = useState(String(config.defaults?.targetMb ?? 10));
  const [resolution, setResolution] = useState(config.defaults?.resolution ?? 0);
  const [aspect, setAspect] = useState("original");
  const [fit, setFit] = useState<Fit>("cover");
  const [mute, setMute] = useState(config.mute === "always");
  const [kbps, setKbps] = useState(192);
  const [progress, setProgress] = useState<number | null>(null);
  const [pass, setPass] = useState(1);
  const [result, setResult] = useState<Result | null>(null);
  const player = useRef<HTMLVideoElement & HTMLAudioElement>(null);
  const abort = useRef<AbortController | null>(null);
  const supported = typeof window === "undefined" || "VideoEncoder" in window || "AudioEncoder" in window;

  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url]);
  useEffect(() => () => void (result && URL.revokeObjectURL(result.url)), [result]);

  const open = async (f: File) => {
    abort.current?.abort();
    setFile(f);
    setInfo(null);
    setResult(null);
    setError(null);
    try {
      const i = await probe(f);
      if (config.input === "video" && !i.hasVideo) throw new Error("This file has no video track. Choose a video file.");
      if (FORMAT_INFO[format].audioOnly && !i.hasAudio) throw new Error("This file has no audio track.");
      setInfo(i);
      setRange([0, i.duration]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "This file couldn't be read.");
    }
  };

  const audioOnly = FORMAT_INFO[format].audioOnly;
  const isVideo = !!info?.hasVideo && !audioOnly;

  const options = (): TranscodeOptions => {
    const o: TranscodeOptions = { format, mute: isVideo && mute };
    if (config.trim && info && (range[0] > 0.05 || range[1] < info.duration - 0.05)) {
      o.start = range[0];
      o.end = range[1];
    }
    if (isVideo && info) {
      const a = ASPECTS.find((x) => x.id === aspect);
      if (config.aspect && a?.ratio) Object.assign(o, aspectFrame(info.width, info.height, a.ratio), { fit });
      else if (resolution) Object.assign(o, capShortSide(info.width, info.height, resolution) ?? {});
    }
    if (mode === "size" && config.targetSize) o.targetBytes = Math.max(0.05, Number(targetMb) || 1) * 1024 * 1024;
    else if (config.quality !== false) o.quality = quality;
    if (audioOnly && format !== "wav") o.audioBitrate = kbps * 1000;
    return o;
  };

  const run = async () => {
    if (!file || !info) return;
    abort.current?.abort();
    const ctl = new AbortController();
    abort.current = ctl;
    setResult(null);
    setError(null);
    setProgress(0);
    try {
      const blob = await transcode(file, options(), (p, n) => (setProgress(p), setPass(n)), ctl.signal);
      if (ctl.signal.aborted) return;
      const name = `${baseName(file.name)}-${config.suffix}.${FORMAT_INFO[format].ext}`;
      setResult({ blob, url: URL.createObjectURL(blob), name });
    } catch (e) {
      if (!ctl.signal.aborted) setError(e instanceof Error ? e.message : "Conversion failed.");
    } finally {
      setProgress(null);
    }
  };

  const outDuration = info ? range[1] - range[0] : 0;

  if (!file) {
    return (
      <div className="space-y-3">
        <FileDrop accept={ACCEPT[config.input]} onFile={open} title={config.title} hint={config.hint} button="Choose file" />
        {!supported && <p className="text-sm text-destructive">This browser can&apos;t convert media on the device. Use a recent Chrome, Edge, Safari or Firefox.</p>}
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-3">
        <div className="overflow-hidden rounded-xl border bg-black/90">
          {url && (info?.hasVideo ? <video ref={player} src={url} controls playsInline className="mx-auto max-h-[60vh] w-full" /> : <audio ref={player} src={url} controls className="w-full p-4" />)}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <span className="min-w-0 truncate">
            {file.name} · {formatBytes(file.size)}
            {info && ` · ${formatTime(info.duration)}`}
            {info?.hasVideo && ` · ${info.width}×${info.height}`}
          </span>
          <FileDrop compact accept={ACCEPT[config.input]} onFile={open} title="" button="Replace" />
        </div>

        {config.trim && info && (
          <div className="space-y-3 rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between text-sm">
              <Label>Trim</Label>
              <span className="tabular text-muted-foreground">
                {formatTime(range[0])} – {formatTime(range[1])} ({formatTime(outDuration)})
              </span>
            </div>
            <Slider aria-label="Trim range" value={range} min={0} max={info.duration} step={0.1} onValueChange={(v) => Array.isArray(v) && v.length === 2 && setRange([v[0], v[1]] as [number, number])} />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => player.current && setRange([Math.min(player.current.currentTime, range[1] - 0.1), range[1]])}>
                Start at playhead
              </Button>
              <Button variant="outline" size="sm" onClick={() => player.current && setRange([range[0], Math.max(player.current.currentTime, range[0] + 0.1)])}>
                End at playhead
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setRange([0, info.duration])}>
                Reset
              </Button>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-3 rounded-xl border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm">
                <span className="font-medium">{formatBytes(result.blob.size)}</span>
                <span className="text-muted-foreground">
                  {" "}
                  · {result.blob.size < file.size ? `${Math.round((1 - result.blob.size / file.size) * 100)}% smaller` : `${Math.round((result.blob.size / file.size - 1) * 100)}% larger`} than the original
                </span>
              </p>
              <Button onClick={() => download(result.blob, result.name)}>Download {FORMAT_INFO[format].label.split(" ")[0]}</Button>
            </div>
            {FORMAT_INFO[format].audioOnly ? <audio src={result.url} controls className="w-full" /> : <video src={result.url} controls playsInline className="max-h-[40vh] w-full rounded-lg bg-black" />}
          </div>
        )}
      </div>

      <aside className="space-y-5 self-start rounded-xl border bg-card p-4" aria-label="Options">
        {config.formats.length > 1 && (
          <div className="space-y-2">
            <Label>Format</Label>
            <Segmented label="Format" value={format} onChange={(f) => (setFormat(f), setResult(null))} options={config.formats.map((f) => ({ value: f, label: FORMAT_INFO[f].label.split(" ")[0] }))} />
          </div>
        )}

        {isVideo && config.aspect && (
          <div className="space-y-2">
            <Label>Aspect ratio</Label>
            <div className="flex flex-wrap gap-1.5">
              {ASPECTS.map((a) => (
                <button key={a.id} type="button" aria-pressed={aspect === a.id} onClick={() => setAspect(a.id)} className={`rounded-lg border px-2.5 py-1.5 text-sm ${aspect === a.id ? "border-foreground bg-muted" : "hover:border-foreground/30"}`}>
                  {a.label}
                </button>
              ))}
            </div>
            {aspect !== "original" && (
              <Segmented
                label="Fit"
                value={fit}
                onChange={setFit}
                options={[
                  { value: "cover", label: "Crop to fill" },
                  { value: "contain", label: "Fit with bars" },
                ]}
              />
            )}
          </div>
        )}

        {isVideo && config.resolution && (aspect === "original" || !config.aspect) && (
          <div className="space-y-2">
            <Label htmlFor="res">Resolution</Label>
            <select id="res" value={resolution} onChange={(e) => setResolution(Number(e.target.value))} className="h-9 w-full rounded-lg border bg-background px-2 text-sm">
              {RESOLUTIONS.map((r) => (
                <option key={r} value={r} disabled={!!r && !!info && Math.min(info.width, info.height) <= r && r !== 0}>
                  {r ? `${r}p` : "Keep original"}
                </option>
              ))}
            </select>
          </div>
        )}

        {config.targetSize && (
          <div className="space-y-2">
            <Segmented
              label="Size mode"
              value={mode}
              onChange={setMode}
              options={[
                { value: "quality", label: "Quality" },
                { value: "size", label: "Target size" },
              ]}
            />
            {mode === "size" && (
              <div className="flex items-center gap-2">
                <Input type="number" inputMode="decimal" min={0.1} step={0.5} aria-label="Target size in MB" value={targetMb} onChange={(e) => setTargetMb(e.target.value)} className="w-28" />
                <span className="text-sm text-muted-foreground">MB</span>
              </div>
            )}
          </div>
        )}

        {(mode === "quality" || !config.targetSize) && config.quality !== false && !(audioOnly && config.audioBitrate) && (
          <div className="space-y-2">
            <Label>Quality</Label>
            <Segmented
              label="Quality"
              value={quality}
              onChange={setQuality}
              options={[
                { value: "low", label: "Smaller" },
                { value: "medium", label: "Balanced" },
                { value: "high", label: "Best" },
              ]}
            />
          </div>
        )}

        {audioOnly && config.audioBitrate && format !== "wav" && (
          <div className="space-y-2">
            <Label htmlFor="kbps">Audio quality</Label>
            <select id="kbps" value={kbps} onChange={(e) => setKbps(Number(e.target.value))} className="h-9 w-full rounded-lg border bg-background px-2 text-sm">
              {[64, 128, 192, 256, 320].map((k) => (
                <option key={k} value={k}>
                  {k} kbps{k === 128 ? " (speech, podcasts)" : k === 192 ? " (music)" : k === 320 ? " (highest)" : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {isVideo && config.mute === true && info?.hasAudio && (
          <div className="flex items-center justify-between">
            <Label htmlFor="mute">Remove sound</Label>
            <Switch id="mute" checked={mute} onCheckedChange={setMute} />
          </div>
        )}

        <div className="space-y-2 border-t pt-4">
          {progress === null ? (
            <Button className="w-full" disabled={!info} onClick={run}>
              {config.action}
            </Button>
          ) : (
            <div role="status" className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{pass > 1 ? `Adjusting to hit the size (pass ${pass})…` : "Working…"}</span>
                <span className="tabular text-muted-foreground">{Math.round(progress * 100)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-foreground transition-[width]" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => abort.current?.abort()}>
                Cancel
              </Button>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <p className="text-xs text-muted-foreground">Runs on your device using its media hardware. Long or 4K videos take longer on phones.</p>
        </div>
      </aside>
    </div>
  );
}
