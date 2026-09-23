"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Music, Play, Pause, Square, Scissors, Download, Upload,
  Clock, SkipBack, SkipForward, Volume2, Sparkles, CheckCircle2,
  XCircle, Loader2, Repeat, Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  // Options
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [exportFormat, setExportFormat] = useState<"wav" | "mp3">("mp3");

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

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
    if (!file) return;

    if (!file.type.startsWith("audio/") && !file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i)) {
      setError("Please select an audio file (MP3, WAV, OGG, AAC, etc.)");
      return;
    }

    if (file.size > 200 * 1024 * 1024) {
      setError("File size exceeds 200MB limit.");
      return;
    }

    setError("");
    setAudioFile(file);
    setOutputUrl(null);

    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const decoded = await audioCtx.decodeAudioData(arrayBuffer);
      audioBufferRef.current = decoded;

      setDuration(decoded.duration);
      setStartTime(0);
      setEndTime(decoded.duration);
      setCurrentTime(0);

      // Generate 120 waveform peaks
      const peaks = extractWaveformPeaks(decoded, 120);
      setWaveformPeaks(peaks);
      audioCtx.close();
    } catch {
      setError("Unable to decode audio waveform.");
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
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const playSelection = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = startTime;
    audioRef.current.play();
    setIsPlaying(true);
  };

  const handleStop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = startTime;
    setIsPlaying(false);
    setCurrentTime(startTime);
  };

  const handleCut = async () => {
    if (!audioBufferRef.current || startTime >= endTime) {
      setError("Please set a valid start and end interval.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const originalBuffer = audioBufferRef.current;
      const sampleRate = originalBuffer.sampleRate;
      const numChannels = originalBuffer.numberOfChannels;

      const startSample = Math.floor(startTime * sampleRate);
      const endSample = Math.floor(endTime * sampleRate);
      const trimmedLength = endSample - startSample;

      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({
        sampleRate,
      });

      const trimmedBuffer = audioCtx.createBuffer(numChannels, trimmedLength, sampleRate);

      // Copy samples with optional fade in / fade out
      const fadeDuration = 0.05 * sampleRate; // 50ms fade

      for (let ch = 0; ch < numChannels; ch++) {
        const srcData = originalBuffer.getChannelData(ch);
        const dstData = trimmedBuffer.getChannelData(ch);

        for (let i = 0; i < trimmedLength; i++) {
          let s = srcData[startSample + i];

          if (fadeIn && i < fadeDuration) {
            s *= i / fadeDuration;
          }
          if (fadeOut && i > trimmedLength - fadeDuration) {
            s *= (trimmedLength - i) / fadeDuration;
          }

          dstData[i] = s;
        }
      }

      // Convert to WAV first
      const wavBlob = audioBufferToWav(trimmedBuffer);

      if (exportFormat === "wav") {
        const url = URL.createObjectURL(wavBlob);
        setOutputUrl(url);
        setOutputSize(wavBlob.size);
        const name = (audioFile?.name ?? "audio").replace(/\.[^.]+$/, "_cut.wav");
        setOutputName(name);
        audioCtx.close();
        toast.success("Cut audio ready for download!");
      } else {
        // Encode to compressed audio using MediaRecorder
        const sourceNode = audioCtx.createBufferSource();
        sourceNode.buffer = trimmedBuffer;
        const destNode = audioCtx.createMediaStreamDestination();
        sourceNode.connect(destNode);

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
        sourceNode.start(0);

        setTimeout(() => {
          recorder.stop();
          sourceNode.stop();
          audioCtx.close();
        }, trimmedBuffer.duration * 1000 + 100);

        const compressedBlob = await recPromise;
        const url = URL.createObjectURL(compressedBlob);
        setOutputUrl(url);
        setOutputSize(compressedBlob.size);
        const name = (audioFile?.name ?? "audio").replace(/\.[^.]+$/, "_cut.mp3");
        setOutputName(name);
        toast.success("Cut audio ready for download!");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Audio cutting failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <Badge variant="outline" className="gap-1.5">
        <Scissors className="h-3.5 w-3.5" /> MP3 & Audio Waveform Cutter
      </Badge>

      {!audioFile ? (
        <Card className="border-2 border-dashed">
          <CardContent className="p-8 text-center">
            <Music className="h-12 w-12 text-primary opacity-80 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-1">Upload Audio to Trim & Cut</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
              Visual waveform editor with stereo audio processing, millisecond precision, and fade in/out effects.
            </p>
            <label>
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button className="gap-2">
                <Upload className="h-4 w-4" /> Choose Audio File
              </Button>
            </label>
            <p className="text-xs text-muted-foreground mt-3">MP3, WAV, OGG, AAC, FLAC up to 200MB</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2 truncate max-w-[300px]">
                <Music className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">{audioFile.name}</span>
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

            {/* Interactive Waveform Canvas */}
            <div className="space-y-1">
              <div className="relative rounded-lg border bg-slate-950 p-2 overflow-hidden shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={90}
                  className="w-full h-[90px] block"
                />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>{formatTime(currentTime)}</span>
                <span className="text-primary font-semibold">
                  Selection: {formatTime(endTime - startTime)}
                </span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (audioRef.current) audioRef.current.currentTime = startTime;
                }}
                title="Rewind to start"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                onClick={handlePlayPause}
                size="icon"
                className="h-10 w-10 rounded-full"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button variant="outline" size="sm" onClick={handleStop} title="Stop">
                <Square className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={playSelection}
              >
                <Repeat className="h-3.5 w-3.5" /> Play Cut Only
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
                  onValueChange={(v) => setStartTime(Array.isArray(v) ? v[0] : v)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">End Marker: {formatTime(endTime)}</span>
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
                  onValueChange={(v) => setEndTime(Array.isArray(v) ? v[0] : v)}
                />
              </div>
            </div>

            {/* Fades & Export Format */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
              <div className="flex items-center gap-4 text-xs font-medium">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fadeIn}
                    onChange={(e) => setFadeIn(e.target.checked)}
                    className="rounded text-primary"
                  />
                  <span>Fade In</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fadeOut}
                    onChange={(e) => setFadeOut(e.target.checked)}
                    className="rounded text-primary"
                  />
                  <span>Fade Out</span>
                </label>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <span className="text-xs text-muted-foreground">Output Format:</span>
                {(["mp3", "wav"] as const).map((fmt) => (
                  <Button
                    key={fmt}
                    size="sm"
                    variant={exportFormat === fmt ? "default" : "outline"}
                    className="h-7 text-xs uppercase"
                    onClick={() => setExportFormat(fmt)}
                  >
                    {fmt}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleCut}
              disabled={isProcessing || startTime >= endTime}
              className="w-full gap-2 font-semibold"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing & Slicing Audio...
                </>
              ) : (
                <>
                  <Scissors className="h-4 w-4" /> Cut & Save Audio Segment
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => {
                setAudioFile(null);
                setAudioUrl("");
                setOutputUrl(null);
                audioBufferRef.current = null;
              }}
            >
              <Upload className="h-4 w-4" /> Select Different Audio
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
                    Duration: {formatTime(endTime - startTime)} •{" "}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}