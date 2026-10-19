"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Music, Upload, Download, Play, Pause, Scissors,
  Loader2, CheckCircle2, XCircle, SkipBack, Repeat,
} from "lucide-react";
import { audioBufferToWav, extractWaveformPeaks } from "@/lib/processing/client/audio-processor";

export function AudioCutterEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [waveformPeaks, setWaveformPeaks] = useState<number[]>([]);
  const [isCutting, setIsCutting] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState("");
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [format, setFormat] = useState<"wav" | "webm">("wav");
  const [isLoading, setIsLoading] = useState(false);
  const [outputDuration, setOutputDuration] = useState(0);
  const [outputMime, setOutputMime] = useState("");

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const requestRef = useRef(0);
  const contextRef = useRef<AudioContext | null>(null);

  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);
  useEffect(() => () => { if (outputUrl) URL.revokeObjectURL(outputUrl); }, [outputUrl]);
  useEffect(() => () => {
    requestRef.current += 1;
    void contextRef.current?.close();
  }, []);

  const webmMime = typeof MediaRecorder !== "undefined"
    ? ["audio/webm;codecs=opus", "audio/webm"].find((mime) => MediaRecorder.isTypeSupported(mime))
    : undefined;

  // Draw interactive waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformPeaks.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const barWidth = width / waveformPeaks.length;
    const midY = height / 2;

    const startNorm = duration > 0 ? startTime / duration : 0;
    const endNorm = duration > 0 ? endTime / duration : 1;
    const currentNorm = duration > 0 ? currentTime / duration : 0;

    for (let i = 0; i < waveformPeaks.length; i++) {
      const peak = waveformPeaks[i];
      const barHeight = Math.max(3, peak * (height - 12));
      const x = i * barWidth;
      const progressNorm = i / waveformPeaks.length;

      const isInSelection = progressNorm >= startNorm && progressNorm <= endNorm;
      ctx.fillStyle = isInSelection ? "#10b981" : "#475569";

      ctx.beginPath();
      ctx.roundRect(x + 1, midY - barHeight / 2, barWidth - 2, barHeight, 2);
      ctx.fill();
    }

    // Playhead
    const playheadX = currentNorm * width;
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(playheadX - 1, 0, 2, height);
  }, [waveformPeaks, startTime, endTime, currentTime, duration]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    e.target.value = "";
    if (!selected) return;
    setError(null);
    setOutputUrl(null);

    const validTypes = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm", "audio/mp4", "audio/aac", "audio/flac"];
    const validExts = [".mp3", ".wav", ".ogg", ".webm", ".m4a", ".aac", ".flac"];
    const isValid = validTypes.includes(selected.type) || validExts.some((ext) => selected.name.toLowerCase().endsWith(ext));

    if (!isValid) {
      setError("Please select a valid audio file (MP3, WAV, OGG, M4A, AAC, FLAC).");
      return;
    }

    if (selected.size > 200 * 1024 * 1024) {
      setError("File size must be under 200MB.");
      return;
    }

    const request = ++requestRef.current;
    audioRef.current?.pause();
    setIsPlaying(false);
    audioBufferRef.current = null;
    setDuration(0);
    setStartTime(0);
    setEndTime(0);
    setCurrentTime(0);
    setWaveformPeaks([]);
    setIsLoading(true);
    const url = URL.createObjectURL(selected);
    setFile(selected);
    setAudioUrl(url);

    let audioCtx: AudioContext | undefined;
    try {
      const arrayBuffer = await selected.arrayBuffer();
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const decoded = await audioCtx.decodeAudioData(arrayBuffer);
      if (request !== requestRef.current) return;
      audioBufferRef.current = decoded;

      setDuration(decoded.duration);
      setStartTime(0);
      setEndTime(decoded.duration);
      setCurrentTime(0);

      const peaks = extractWaveformPeaks(decoded, Math.min(120, decoded.length));
      setWaveformPeaks(peaks);
    } catch {
      if (request === requestRef.current) setError("This browser cannot decode this audio file. Try a supported file such as WAV.");
    } finally {
      await audioCtx?.close();
      if (request === requestRef.current) setIsLoading(false);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return;
    const t = audioRef.current.currentTime;
    setCurrentTime(t);
    if (t >= endTime) {
      audioRef.current.pause();
      setIsPlaying(false);
      audioRef.current.currentTime = startTime;
    }
  }, [endTime, startTime]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (currentTime < startTime || currentTime >= endTime) {
        audioRef.current.currentTime = startTime;
      }
      void audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setError("Audio preview could not start."));
    }
  }, [isPlaying, startTime, endTime, currentTime]);

  const handleCut = useCallback(async () => {
    if (!file || !audioBufferRef.current || !Number.isFinite(startTime) || !Number.isFinite(endTime) || startTime < 0 || endTime > duration || startTime >= endTime) {
      setError("Please set a valid start and end interval.");
      return;
    }
    setIsCutting(true);
    setError(null);
    setOutputUrl(null);
    const request = requestRef.current;
    let audioCtx: AudioContext | undefined;
    let stream: MediaStream | undefined;

    try {
      const originalBuffer = audioBufferRef.current;
      const sampleRate = originalBuffer.sampleRate;
      const numChannels = originalBuffer.numberOfChannels;

      const startSample = Math.floor(startTime * sampleRate);
      const endSample = Math.floor(endTime * sampleRate);
      const newLength = endSample - startSample;
      if (newLength < 1) throw new Error("Select at least one audio sample.");

      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({
        sampleRate,
      });
      contextRef.current = audioCtx;

      const newBuffer = audioCtx.createBuffer(numChannels, newLength, sampleRate);
      const fadeDuration = Math.max(1, Math.min(sampleRate * 0.05, newLength / 2));

      for (let ch = 0; ch < numChannels; ch++) {
        const oldData = originalBuffer.getChannelData(ch);
        const newData = newBuffer.getChannelData(ch);
        for (let i = 0; i < newLength; i++) {
          let s = oldData[startSample + i];
          if (fadeIn && i < fadeDuration) {
            s *= i / fadeDuration;
          }
          if (fadeOut && i >= newLength - fadeDuration) {
            s *= (newLength - 1 - i) / fadeDuration;
          }
          newData[i] = s;
        }
      }

      let result: Blob;
      if (format === "wav") {
        result = audioBufferToWav(newBuffer);
      } else {
        if (!webmMime) throw new Error("WebM recording is unavailable in this browser. Choose WAV.");
        await audioCtx.resume();
        const srcNode = audioCtx.createBufferSource();
        srcNode.buffer = newBuffer;
        const destNode = audioCtx.createMediaStreamDestination();
        stream = destNode.stream;
        srcNode.connect(destNode);

        const recorder = new MediaRecorder(destNode.stream, {
          mimeType: webmMime,
          audioBitsPerSecond: 192000,
        });
        if (!/^audio\/webm(?:;|$)/i.test(recorder.mimeType)) throw new Error("The browser did not provide a WebM audio encoder. Choose WAV.");

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        result = await new Promise<Blob>((resolve, reject) => {
          const timeout = setTimeout(() => {
            if (recorder.state !== "inactive") recorder.stop();
            srcNode.stop();
            reject(new Error("WebM recording timed out. Keep this tab active or choose WAV."));
          }, newBuffer.duration * 1000 + 10000);
          recorder.onerror = () => {
            clearTimeout(timeout);
            if (recorder.state !== "inactive") recorder.stop();
            srcNode.stop();
            reject(new Error("WebM recording failed. Choose WAV or retry."));
          };
          recorder.onstop = () => {
            clearTimeout(timeout);
            const blob = new Blob(chunks, { type: recorder.mimeType });
            if (!blob.size) reject(new Error("The browser produced no WebM audio. Choose WAV."));
            else resolve(blob);
          };
          srcNode.onended = () => { if (recorder.state !== "inactive") recorder.stop(); };
          try {
            recorder.start();
            srcNode.start();
          } catch (error) {
            clearTimeout(timeout);
            if (recorder.state !== "inactive") recorder.stop();
            reject(error);
          }
        });
      }
      if (request !== requestRef.current) return;
      setOutputUrl(URL.createObjectURL(result));
      setOutputSize(result.size);
      setOutputMime(result.type);
      setOutputDuration(newBuffer.duration);
      setOutputName(`${file.name.replace(/\.[^.]+$/, "")}_cut.${format}`);
      toast.success(`${format === "wav" ? "WAV" : "WebM"} audio ready for download.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Cutting failed";
      setError(message);
      toast.error(message);
    } finally {
      stream?.getTracks().forEach((track) => track.stop());
      if (audioCtx && audioCtx.state !== "closed") await audioCtx.close();
      contextRef.current = null;
      setIsCutting(false);
    }
  }, [file, startTime, endTime, fadeIn, fadeOut, format, duration, webmMime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${m}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  const changeStart = (value: number) => {
    setStartTime(Math.max(0, Math.min(value, endTime - 1 / (audioBufferRef.current?.sampleRate || 44100))));
    setOutputUrl(null);
  };
  const changeEnd = (value: number) => {
    setEndTime(Math.min(duration, Math.max(value, startTime + 1 / (audioBufferRef.current?.sampleRate || 44100))));
    setOutputUrl(null);
  };

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
        <span className="flex items-center gap-2 text-sm font-medium"><Scissors className="h-4 w-4" /> Audio Cutter</span>
        <input ref={fileInputRef} type="file" aria-label="Audio file" accept="audio/*,.mp3,.wav,.webm,.ogg,.m4a,.aac,.flac" onChange={handleFileSelect} disabled={isLoading || isCutting} className="sr-only" tabIndex={-1} />
        <Button size="sm" variant="outline" disabled={isLoading || isCutting} onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4" /> {file ? "Replace audio" : "Choose audio"}</Button>
      </div>
      <p className="text-xs text-muted-foreground">WAV (PCM) .wav | WebM .webm. Native MP3 export is unavailable.</p>

      {!file ? (
        <div className="flex min-h-28 items-center gap-3 border-b py-6 text-sm text-muted-foreground"><Music className="h-6 w-6 shrink-0" /><span>MP3, WAV, WebM, OGG, M4A, AAC, FLAC | Up to 200MB | Browser decoding required</span></div>
      ) : (
        <section className="min-w-0 space-y-3" aria-label="Audio workspace">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-medium flex min-w-0 flex-1 items-center gap-2">
                <Music className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">{file.name}</span>
              </div>
              <Badge variant="secondary">{formatTime(duration)}</Badge>
            </div>
          </div>
          {isLoading && <p role="status" className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Decoding audio...</p>}
          <fieldset disabled={isLoading || isCutting || duration <= 0} className="min-w-0 space-y-4">
            {audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                onError={() => { setIsPlaying(false); setError("This browser cannot play this audio preview."); }}
                className="hidden"
              />
            )}

            {/* Waveform Canvas */}
            <div className="space-y-1">
              <div className="rounded-md border bg-muted p-2 overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={90}
                  className="w-full h-[90px] block"
                  role="img"
                  aria-label="Audio waveform and selected interval"
                />
              </div>
              <input type="range" aria-label="Seek audio" min={0} max={duration} step={0.01} value={currentTime} className="w-full accent-primary" onChange={(event) => {
                const time = Number(event.target.value);
                if (audioRef.current) audioRef.current.currentTime = time;
                setCurrentTime(time);
              }} />
              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>{formatTime(currentTime)}</span>
                <span className="text-emerald-500 font-semibold">
                  Interval: {formatTime(endTime - startTime)}
                </span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                aria-label="Rewind to start"
                title="Rewind to start"
                onClick={() => {
                  if (audioRef.current) audioRef.current.currentTime = startTime;
                }}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button size="icon" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"} title={isPlaying ? "Pause" : "Play"} className="h-10 w-10 rounded-full">
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = startTime;
                    void audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setError("Audio preview could not start."));
                  }
                }}
              >
                <Repeat className="h-3.5 w-3.5" /> Preview selection
              </Button>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">Start: {formatTime(startTime)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={() => changeStart(currentTime)}
                  >
                    Set to Current
                  </Button>
                </div>
                <Slider
                  aria-label="Start time"
                  value={[startTime]}
                  min={0}
                  max={Math.max(0.01, endTime - 0.01)}
                  step={0.01}
                  onValueChange={(v) => {
                    const arr = v as number[];
                    if (arr.length > 0) changeStart(arr[0]);
                  }}
                />
                <label className="flex items-center gap-2 text-xs">Start (seconds)<input aria-label="Start seconds" type="number" min={0} max={endTime} step={0.01} value={startTime} onChange={(event) => changeStart(Number(event.target.value))} className="h-9 w-28 rounded-md border bg-background px-2 text-sm" /></label>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">End: {formatTime(endTime)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={() => changeEnd(currentTime)}
                  >
                    Set to Current
                  </Button>
                </div>
                <Slider
                  aria-label="End time"
                  value={[endTime]}
                  min={Math.min(Math.max(0, duration - 0.01), startTime + 0.01)}
                  max={Math.max(0.01, duration)}
                  step={0.01}
                  onValueChange={(v) => {
                    const arr = v as number[];
                    if (arr.length > 0) changeEnd(arr[0]);
                  }}
                />
                <label className="flex items-center gap-2 text-xs">End (seconds)<input aria-label="End seconds" type="number" min={startTime} max={duration} step={0.01} value={endTime} onChange={(event) => changeEnd(Number(event.target.value))} className="h-9 w-28 rounded-md border bg-background px-2 text-sm" /></label>
              </div>
            </div>

            {/* Fades & Format Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
              <div className="flex gap-4 text-xs font-medium items-center">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fadeIn}
                    onChange={(e) => { setFadeIn(e.target.checked); setOutputUrl(null); }}
                    className="rounded text-primary"
                  />
                  Fade in (50ms)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fadeOut}
                    onChange={(e) => { setFadeOut(e.target.checked); setOutputUrl(null); }}
                    className="rounded text-primary"
                  />
                  Fade out (50ms)
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">Format:</span>
                {(["wav", "webm"] as const).map((fmt) => (
                  <Button
                    key={fmt}
                    size="sm"
                    variant={format === fmt ? "default" : "outline"}
                    className="text-xs"
                    aria-pressed={format === fmt}
                    disabled={isCutting || (fmt === "webm" && !webmMime)}
                    onClick={() => { setFormat(fmt); setOutputUrl(null); }}
                  >
                    {fmt === "wav" ? "WAV (PCM)" : "WebM"}
                  </Button>
                ))}
              </div>
            </div>
            {!webmMime && <p className="text-xs text-muted-foreground">WebM recording is unavailable in this browser. WAV export remains available.</p>}
            {format === "webm" && <p role="status" className="text-xs text-muted-foreground">WebM records in real time at a target 192 kbps; container timing may include encoder padding.</p>}

            <Button
              onClick={handleCut}
              disabled={isCutting || isLoading || duration <= 0 || startTime >= endTime}
              className="w-full gap-2 font-semibold"
              size="lg"
            >
              {isCutting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Exporting {format === "wav" ? "WAV" : "WebM"}...
                </>
              ) : (
                <>
                  <Scissors className="h-4 w-4" /> Export {format === "wav" ? "WAV" : "WebM"}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => {
                audioRef.current?.pause();
                setIsPlaying(false);
                if (audioRef.current) audioRef.current.currentTime = 0;
                setCurrentTime(0);
                setStartTime(0);
                setEndTime(duration);
                setFadeIn(false);
                setFadeOut(false);
                setOutputUrl(null);
              }}
            >
              <Repeat className="h-4 w-4" /> Reset selection
            </Button>
          </fieldset>
        </section>
      )}

      {error && (
        <div role="alert" className="border-t border-destructive/50 py-3">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
        </div>
      )}

      {outputUrl && (
        <section aria-label="Exported audio" className="min-w-0 border-t pt-3 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm break-all">{outputName}</h4>
                  <p className="text-xs text-muted-foreground">
                    {outputMime} | {formatTime(outputDuration)} |{" "}
                    {outputSize ? `${(outputSize / 1024).toFixed(1)} KB` : ""}
                  </p>
                </div>
              </div>
              <Button
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = outputUrl;
                  a.download = outputName;
                  a.click();
                }}
              >
                <Download className="h-4 w-4" /> Download Audio File
              </Button>
            </div>

            <audio src={outputUrl} controls className="w-full" />
        </section>
      )}
    </div>
  );
}