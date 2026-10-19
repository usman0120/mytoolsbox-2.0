"use client";

import { useState, useRef, useEffect } from "react";
import {
  Music, Play, Pause, Square, Scissors, Download, Upload,
  SkipBack, CheckCircle2, XCircle, Loader2, Repeat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { audioBufferToWav, extractWaveformPeaks } from "@/lib/processing/client/audio-processor";

export function MP3CutterEngine() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [waveformPeaks, setWaveformPeaks] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState("");
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [outputDuration, setOutputDuration] = useState(0);
  const [outputMime, setOutputMime] = useState("");

  // Options
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [exportFormat, setExportFormat] = useState<"wav" | "webm">("wav");

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Redraw waveform on canvas when peaks or times change
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
      const barHeight = Math.max(4, peak * (height - 12));
      const x = i * barWidth;
      const progressNorm = i / waveformPeaks.length;

      // Color based on active selection region
      const isInSelection = progressNorm >= startNorm && progressNorm <= endNorm;
      ctx.fillStyle = isInSelection ? "#3b82f6" : "#64748b";

      ctx.beginPath();
      ctx.roundRect(x + 1, midY - barHeight / 2, barWidth - 2, barHeight, 2);
      ctx.fill();
    }

    // Playhead line
    const playheadX = currentNorm * width;
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(playheadX - 1, 0, 2, height);
  }, [waveformPeaks, startTime, endTime, currentTime, duration]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("audio/") && !file.name.match(/\.(mp3|wav|webm|ogg|m4a|aac|flac)$/i)) {
      setError("Please select an audio file (MP3, WAV, OGG, AAC, etc.)");
      return;
    }

    if (file.size > 200 * 1024 * 1024) {
      setError("File size exceeds 200MB limit.");
      return;
    }

    setError("");
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
    setAudioFile(file);
    setOutputUrl(null);

    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    let audioCtx: AudioContext | undefined;
    try {
      const arrayBuffer = await file.arrayBuffer();
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const decoded = await audioCtx.decodeAudioData(arrayBuffer);
      if (request !== requestRef.current) return;
      audioBufferRef.current = decoded;

      setDuration(decoded.duration);
      setStartTime(0);
      setEndTime(decoded.duration);
      setCurrentTime(0);

      // Generate 120 waveform peaks
      const peaks = extractWaveformPeaks(decoded, Math.min(120, decoded.length));
      setWaveformPeaks(peaks);
    } catch {
      if (request === requestRef.current) setError("This browser cannot decode this audio file. Try a supported file such as WAV.");
    } finally {
      await audioCtx?.close();
      if (request === requestRef.current) setIsLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const t = audioRef.current.currentTime;
    setCurrentTime(t);

    // Stop at end marker if playing
    if (t >= endTime) {
      audioRef.current.pause();
      setIsPlaying(false);
      audioRef.current.currentTime = startTime;
    }
  };

  const handlePlayPause = () => {
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
  };

  const playSelection = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = startTime;
    void audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setError("Audio preview could not start."));
  };

  const handleStop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = startTime;
    setIsPlaying(false);
    setCurrentTime(startTime);
  };

  const handleCut = async () => {
    if (!audioBufferRef.current || !Number.isFinite(startTime) || !Number.isFinite(endTime) || startTime < 0 || endTime > duration || startTime >= endTime) {
      setError("Please set a valid start and end interval.");
      return;
    }

    setIsProcessing(true);
    setError("");
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
      const trimmedLength = endSample - startSample;
      if (trimmedLength < 1) throw new Error("Select at least one audio sample.");

      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({
        sampleRate,
      });
      contextRef.current = audioCtx;

      const trimmedBuffer = audioCtx.createBuffer(numChannels, trimmedLength, sampleRate);

      // Copy samples with optional fade in / fade out
      const fadeDuration = Math.max(1, Math.min(0.05 * sampleRate, trimmedLength / 2));

      for (let ch = 0; ch < numChannels; ch++) {
        const srcData = originalBuffer.getChannelData(ch);
        const dstData = trimmedBuffer.getChannelData(ch);

        for (let i = 0; i < trimmedLength; i++) {
          let s = srcData[startSample + i];

          if (fadeIn && i < fadeDuration) {
            s *= i / fadeDuration;
          }
          if (fadeOut && i >= trimmedLength - fadeDuration) {
            s *= (trimmedLength - 1 - i) / fadeDuration;
          }

          dstData[i] = s;
        }
      }

      let result: Blob;
      if (exportFormat === "wav") {
        result = audioBufferToWav(trimmedBuffer);
      } else {
        if (!webmMime) throw new Error("WebM recording is unavailable in this browser. Choose WAV.");
        await audioCtx.resume();
        const sourceNode = audioCtx.createBufferSource();
        sourceNode.buffer = trimmedBuffer;
        const destNode = audioCtx.createMediaStreamDestination();
        stream = destNode.stream;
        sourceNode.connect(destNode);

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
            sourceNode.stop();
            reject(new Error("WebM recording timed out. Keep this tab active or choose WAV."));
          }, trimmedBuffer.duration * 1000 + 10000);
          recorder.onerror = () => {
            clearTimeout(timeout);
            if (recorder.state !== "inactive") recorder.stop();
            sourceNode.stop();
            reject(new Error("WebM recording failed. Choose WAV or retry."));
          };
          recorder.onstop = () => {
            clearTimeout(timeout);
            const blob = new Blob(chunks, { type: recorder.mimeType });
            if (!blob.size) reject(new Error("The browser produced no WebM audio. Choose WAV."));
            else resolve(blob);
          };
          sourceNode.onended = () => { if (recorder.state !== "inactive") recorder.stop(); };
          try {
            recorder.start();
            sourceNode.start();
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
      setOutputDuration(trimmedBuffer.duration);
      setOutputName(`${(audioFile?.name ?? "audio").replace(/\.[^.]+$/, "")}_cut.${exportFormat}`);
      toast.success(`${exportFormat === "wav" ? "WAV" : "WebM"} audio ready for download.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Audio cutting failed";
      setError(msg);
      toast.error(msg);
    } finally {
      stream?.getTracks().forEach((track) => track.stop());
      if (audioCtx && audioCtx.state !== "closed") await audioCtx.close();
      contextRef.current = null;
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
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
        <span className="flex items-center gap-2 text-sm font-medium"><Scissors className="h-4 w-4" /> MP3 / Audio Cutter</span>
        <input ref={fileInputRef} type="file" aria-label="Audio file" accept="audio/*,.mp3,.wav,.webm,.ogg,.m4a,.aac,.flac" onChange={handleFileSelect} disabled={isLoading || isProcessing} className="sr-only" tabIndex={-1} />
        <Button size="sm" variant="outline" disabled={isLoading || isProcessing} onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4" /> {audioFile ? "Replace audio" : "Choose audio"}</Button>
      </div>
      <p className="text-xs text-muted-foreground">WAV (PCM) .wav | WebM .webm. Native MP3 export is unavailable.</p>

      {!audioFile ? (
        <div className="flex min-h-28 items-center gap-3 border-b py-6 text-sm text-muted-foreground"><Music className="h-6 w-6 shrink-0" /><span>MP3, WAV, WebM, OGG, M4A, AAC, FLAC | Up to 200MB | Browser decoding required</span></div>
      ) : (
        <section className="min-w-0 space-y-3" aria-label="Audio workspace">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-medium flex min-w-0 flex-1 items-center gap-2">
                <Music className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">{audioFile.name}</span>
              </div>
              <Badge variant="secondary">{formatTime(duration)}</Badge>
            </div>
          </div>
          {isLoading && <p role="status" className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Decoding audio...</p>}
          <fieldset disabled={isLoading || isProcessing || duration <= 0} className="min-w-0 space-y-4">
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

            {/* Interactive Waveform Canvas */}
            <div className="space-y-1">
              <div className="relative rounded-md border bg-muted p-2 overflow-hidden">
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
                <span className="text-primary font-semibold">
                  Selection: {formatTime(endTime - startTime)}
                </span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (audioRef.current) audioRef.current.currentTime = startTime;
                }}
                title="Rewind to start"
                aria-label="Rewind to start"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                onClick={handlePlayPause}
                size="icon"
                className="h-10 w-10 rounded-full"
                aria-label={isPlaying ? "Pause" : "Play"}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button variant="outline" size="sm" onClick={handleStop} title="Stop" aria-label="Stop">
                <Square className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={playSelection}
              >
                <Repeat className="h-3.5 w-3.5" /> Preview selection
              </Button>
            </div>

            {/* Interval Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">Start Marker: {formatTime(startTime)}</span>
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
                  onValueChange={(v) => changeStart(Array.isArray(v) ? v[0] : v)}
                />
                <label className="flex items-center gap-2 text-xs">Start (seconds)<input aria-label="Start seconds" type="number" min={0} max={endTime} step={0.01} value={startTime} onChange={(event) => changeStart(Number(event.target.value))} className="h-9 w-28 rounded-md border bg-background px-2 text-sm" /></label>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">End Marker: {formatTime(endTime)}</span>
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
                  onValueChange={(v) => changeEnd(Array.isArray(v) ? v[0] : v)}
                />
                <label className="flex items-center gap-2 text-xs">End (seconds)<input aria-label="End seconds" type="number" min={startTime} max={duration} step={0.01} value={endTime} onChange={(event) => changeEnd(Number(event.target.value))} className="h-9 w-28 rounded-md border bg-background px-2 text-sm" /></label>
              </div>
            </div>

            {/* Fades & Export Format */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
              <div className="flex items-center gap-4 text-xs font-medium">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fadeIn}
                    onChange={(e) => { setFadeIn(e.target.checked); setOutputUrl(null); }}
                    className="rounded text-primary"
                  />
                  <span>Fade in (50ms)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fadeOut}
                    onChange={(e) => { setFadeOut(e.target.checked); setOutputUrl(null); }}
                    className="rounded text-primary"
                  />
                  <span>Fade out (50ms)</span>
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">Output Format:</span>
                {(["wav", "webm"] as const).map((fmt) => (
                  <Button
                    key={fmt}
                    size="sm"
                    variant={exportFormat === fmt ? "default" : "outline"}
                    className="text-xs"
                    aria-pressed={exportFormat === fmt}
                    disabled={isProcessing || (fmt === "webm" && !webmMime)}
                    onClick={() => { setExportFormat(fmt); setOutputUrl(null); }}
                  >
                    {fmt === "wav" ? "WAV (PCM)" : "WebM"}
                  </Button>
                ))}
              </div>
            </div>
            {!webmMime && <p className="text-xs text-muted-foreground">WebM recording is unavailable in this browser. WAV export remains available.</p>}
            {exportFormat === "webm" && <p role="status" className="text-xs text-muted-foreground">WebM records in real time at a target 192 kbps; container timing may include encoder padding.</p>}

            <Button
              onClick={handleCut}
              disabled={isProcessing || isLoading || duration <= 0 || startTime >= endTime}
              className="w-full gap-2 font-semibold"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Exporting {exportFormat === "wav" ? "WAV" : "WebM"}...
                </>
              ) : (
                <>
                  <Scissors className="h-4 w-4" /> Export {exportFormat === "wav" ? "WAV" : "WebM"}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => {
                handleStop();
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
                <Download className="h-4 w-4" /> Download Audio
              </Button>
            </div>

            <audio src={outputUrl} controls className="w-full" />
        </section>
      )}
    </div>
  );
}