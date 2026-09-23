"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Music, Upload, Download, Play, Pause, Scissors,
  Loader2, CheckCircle2, XCircle, SkipBack, SkipForward,
  Repeat, Sliders, Volume2, Sparkles,
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
  const [format, setFormat] = useState<"wav" | "mp3">("wav");

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

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

    const url = URL.createObjectURL(selected);
    setFile(selected);
    setAudioUrl(url);

    try {
      const arrayBuffer = await selected.arrayBuffer();
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const decoded = await audioCtx.decodeAudioData(arrayBuffer);
      audioBufferRef.current = decoded;

      setDuration(decoded.duration);
      setStartTime(0);
      setEndTime(decoded.duration);
      setCurrentTime(0);

      const peaks = extractWaveformPeaks(decoded, 120);
      setWaveformPeaks(peaks);
      audioCtx.close();
    } catch {
      setError("Failed to decode audio file.");
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
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying, startTime, endTime, currentTime]);

  const handleCut = useCallback(async () => {
    if (!file || !audioBufferRef.current || startTime >= endTime) return;
    setIsCutting(true);
    setError(null);

    try {
      const originalBuffer = audioBufferRef.current;
      const sampleRate = originalBuffer.sampleRate;
      const numChannels = originalBuffer.numberOfChannels;

      const startSample = Math.floor(startTime * sampleRate);
      const endSample = Math.floor(endTime * sampleRate);
      const newLength = endSample - startSample;

      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({
        sampleRate,
      });

      const newBuffer = audioCtx.createBuffer(numChannels, newLength, sampleRate);
      const fadeDuration = sampleRate * 0.05; // 50ms fade

      for (let ch = 0; ch < numChannels; ch++) {
        const oldData = originalBuffer.getChannelData(ch);
        const newData = newBuffer.getChannelData(ch);
        for (let i = 0; i < newLength; i++) {
          let s = oldData[startSample + i];
          if (fadeIn && i < fadeDuration) {
            s *= i / fadeDuration;
          }
          if (fadeOut && i > newLength - fadeDuration) {
            s *= (newLength - i) / fadeDuration;
          }
          newData[i] = s;
        }
      }

      const wavBlob = audioBufferToWav(newBuffer);

      if (format === "wav") {
        const url = URL.createObjectURL(wavBlob);
        setOutputUrl(url);
        setOutputSize(wavBlob.size);
        setOutputName(file.name.replace(/\.[^.]+$/, "_cut.wav"));
        audioCtx.close();
        toast.success("Audio cut successfully!");
      } else {
        // Encode via MediaRecorder
        const srcNode = audioCtx.createBufferSource();
        srcNode.buffer = newBuffer;
        const destNode = audioCtx.createMediaStreamDestination();
        srcNode.connect(destNode);

        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm";

        const recorder = new MediaRecorder(destNode.stream, {
          mimeType,
          audioBitsPerSecond: 192000,
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        const recPromise = new Promise<Blob>((resolve) => {
          recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
        });

        recorder.start();
        srcNode.start(0);

        setTimeout(() => {
          recorder.stop();
          srcNode.stop();
          audioCtx.close();
        }, newBuffer.duration * 1000 + 100);

        const compressed = await recPromise;
        const url = URL.createObjectURL(compressed);
        setOutputUrl(url);
        setOutputSize(compressed.size);
        setOutputName(file.name.replace(/\.[^.]+$/, "_cut.mp3"));
        toast.success("Audio cut successfully!");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Cutting failed";
      setError(message);
      toast.error(message);
    } finally {
      setIsCutting(false);
    }
  }, [file, startTime, endTime, fadeIn, fadeOut, format]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${m}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <Badge variant="outline" className="gap-1.5">
        <Scissors className="h-3.5 w-3.5" /> Audio Cutter & Trimmer
      </Badge>

      {!file ? (
        <Card className="border-2 border-dashed">
          <CardContent className="p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer space-y-3"
            >
              <Music className="h-12 w-12 text-primary opacity-80 mx-auto" />
              <h3 className="font-semibold text-lg">Upload Audio to Cut</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Trim audio files with live waveform visualization, stereo sample accuracy, and fade envelopes.
              </p>
              <Button className="gap-2">
                <Upload className="h-4 w-4" /> Browse Audio File
              </Button>
              <p className="text-xs text-muted-foreground mt-2">MP3, WAV, OGG, M4A, AAC, FLAC up to 200MB</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2 truncate max-w-[300px]">
                <Music className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">{file.name}</span>
              </CardTitle>
              <Badge variant="secondary">{formatTime(duration)}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            )}

            {/* Waveform Canvas */}
            <div className="space-y-1">
              <div className="rounded-lg border bg-slate-950 p-2 overflow-hidden shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={90}
                  className="w-full h-[90px] block"
                />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>{formatTime(currentTime)}</span>
                <span className="text-emerald-500 font-semibold">
                  Interval: {formatTime(endTime - startTime)}
                </span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (audioRef.current) audioRef.current.currentTime = startTime;
                }}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button size="icon" onClick={togglePlay} className="h-10 w-10 rounded-full">
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = startTime;
                    audioRef.current.play();
                    setIsPlaying(true);
                  }
                }}
              >
                <Repeat className="h-3.5 w-3.5" /> Loop Cut
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
                    onClick={() => setStartTime(currentTime)}
                  >
                    Set to Current
                  </Button>
                </div>
                <Slider
                  value={[startTime]}
                  min={0}
                  max={Math.max(0, endTime - 0.1)}
                  step={0.01}
                  onValueChange={(v) => {
                    const arr = v as number[];
                    if (arr.length > 0) setStartTime(arr[0]);
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">End: {formatTime(endTime)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={() => setEndTime(currentTime)}
                  >
                    Set to Current
                  </Button>
                </div>
                <Slider
                  value={[endTime]}
                  min={Math.min(duration, startTime + 0.1)}
                  max={duration}
                  step={0.01}
                  onValueChange={(v) => {
                    const arr = v as number[];
                    if (arr.length > 0) setEndTime(arr[0]);
                  }}
                />
              </div>
            </div>

            {/* Fades & Format Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
              <div className="flex gap-4 text-xs font-medium items-center">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fadeIn}
                    onChange={(e) => setFadeIn(e.target.checked)}
                    className="rounded text-primary"
                  />
                  Fade In
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fadeOut}
                    onChange={(e) => setFadeOut(e.target.checked)}
                    className="rounded text-primary"
                  />
                  Fade Out
                </label>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <span className="text-xs text-muted-foreground">Format:</span>
                {(["wav", "mp3"] as const).map((fmt) => (
                  <Button
                    key={fmt}
                    size="sm"
                    variant={format === fmt ? "default" : "outline"}
                    className="h-7 text-xs uppercase"
                    onClick={() => setFormat(fmt)}
                  >
                    {fmt}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleCut}
              disabled={isCutting || startTime >= endTime}
              className="w-full gap-2 font-semibold"
              size="lg"
            >
              {isCutting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Slicing Audio...
                </>
              ) : (
                <>
                  <Scissors className="h-4 w-4" /> Cut & Save Audio
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => {
                setFile(null);
                setAudioUrl(null);
                setOutputUrl(null);
                audioBufferRef.current = null;
              }}
            >
              <Upload className="h-4 w-4" /> Choose Different File
            </Button>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {outputUrl && (
        <Card className="border-green-500/40 bg-green-500/5">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <h4 className="font-semibold text-sm">{outputName}</h4>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(endTime - startTime)} •{" "}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}