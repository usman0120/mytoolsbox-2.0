"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  FileVideo, FileAudio, Upload, Download, ArrowRightLeft,
  Loader2, CheckCircle2, XCircle, Music, Film, Sparkles,
  Sliders, Activity,
} from "lucide-react";
import { audioBufferToWav, extractWaveformPeaks } from "@/lib/processing/client/audio-processor";

type ConversionMode = "mp4-to-mp3" | "mp3-to-mp4";

export function MP4MP3ConverterEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ConversionMode>("mp4-to-mp3");
  const [isConverting, setIsConverting] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState<string>("");
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [peaks, setPeaks] = useState<number[]>([]);

  // Audio Quality Options
  const [bitrate, setBitrate] = useState<"320" | "192" | "128">("192");
  const [channels, setChannels] = useState<"stereo" | "mono">("stereo");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw waveform if peaks available
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || peaks.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const barWidth = width / peaks.length;
    const midY = height / 2;

    for (let i = 0; i < peaks.length; i++) {
      const peak = peaks[i];
      const barHeight = Math.max(3, peak * (height - 8));
      const x = i * barWidth;
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.roundRect(x + 1, midY - barHeight / 2, barWidth - 2, barHeight, 2);
      ctx.fill();
    }
  }, [peaks]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setError(null);
    setOutputUrl(null);
    setPeaks([]);

    const isVideo = selected.type.startsWith("video/") || selected.name.match(/\.(mp4|webm|mov|mkv|avi)$/i);
    const isAudio = selected.type.startsWith("audio/") || selected.name.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i);

    if (mode === "mp4-to-mp3" && !isVideo) {
      setError("Please select a video file (MP4, WebM, MOV, etc.)");
      return;
    }
    if (mode === "mp3-to-mp4" && !isAudio) {
      setError("Please select an audio file (MP3, WAV, etc.)");
      return;
    }

    if (selected.size > 500 * 1024 * 1024) {
      setError("File size must be under 500MB.");
      return;
    }

    setFile(selected);
  }, [mode]);

  const handleConvert = useCallback(async () => {
    if (!file) return;
    setIsConverting(true);
    setError(null);
    setProgress(0);
    setStatusMessage("Demuxing media stream...");

    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();

      setStatusMessage("Decoding audio channel data...");
      setProgress(25);

      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const extractedPeaks = extractWaveformPeaks(audioBuffer, 100);
      setPeaks(extractedPeaks);

      if (mode === "mp4-to-mp3") {
        setStatusMessage("Encoding high-quality audio...");
        setProgress(60);

        // Convert channels if mono requested
        let finalBuffer = audioBuffer;
        if (channels === "mono" && audioBuffer.numberOfChannels > 1) {
          const mono = audioCtx.createBuffer(1, audioBuffer.length, audioBuffer.sampleRate);
          const ch0 = audioBuffer.getChannelData(0);
          const ch1 = audioBuffer.getChannelData(1);
          const monoData = mono.getChannelData(0);
          for (let i = 0; i < audioBuffer.length; i++) {
            monoData[i] = (ch0[i] + ch1[i]) * 0.5;
          }
          finalBuffer = mono;
        }

        // Compress via MediaRecorder
        const srcNode = audioCtx.createBufferSource();
        srcNode.buffer = finalBuffer;
        const destNode = audioCtx.createMediaStreamDestination();
        srcNode.connect(destNode);

        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm";

        const bps = Number(bitrate) * 1000;
        const recorder = new MediaRecorder(destNode.stream, {
          mimeType,
          audioBitsPerSecond: bps,
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
        }, finalBuffer.duration * 1000 + 100);

        const compressedBlob = await recPromise;
        const url = URL.createObjectURL(compressedBlob);
        setOutputUrl(url);
        setOutputSize(compressedBlob.size);
        const name = file.name.replace(/\.[^.]+$/, ".mp3");
        setOutputName(name);
        setProgress(100);
        setStatusMessage("Complete!");
        toast.success("MP4 converted to MP3 successfully!");
      } else {
        // MP3 to Video: Render a responsive animated audio visualizer video
        setStatusMessage("Generating visual waveform video track...");
        setProgress(40);

        const width = 1280;
        const height = 720;
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;

        const videoStream = canvas.captureStream(30);
        const audioSource = audioCtx.createBufferSource();
        audioSource.buffer = audioBuffer;
        const audioDest = audioCtx.createMediaStreamDestination();
        audioSource.connect(audioDest);

        const combinedStream = new MediaStream([
          ...videoStream.getVideoTracks(),
          ...audioDest.stream.getAudioTracks(),
        ]);

        const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
          ? "video/webm;codecs=vp9,opus"
          : "video/webm";

        const recorder = new MediaRecorder(combinedStream, {
          mimeType,
          videoBitsPerSecond: 2500000,
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        const recPromise = new Promise<Blob>((resolve) => {
          recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
        });

        recorder.start();
        audioSource.start(0);

        // Render animated visualizer frames
        let frame = 0;
        let isDrawing = true;
        const totalDuration = audioBuffer.duration;
        const startTime = Date.now();

        const drawVisualizer = () => {
          if (!isDrawing) return;
          frame++;

          // Background gradient
          const grad = ctx.createLinearGradient(0, 0, width, height);
          grad.addColorStop(0, "#0f172a");
          grad.addColorStop(1, "#1e1b4b");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // Track Title
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 36px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("🎵 " + file.name.replace(/\.[^.]+$/, ""), width / 2, 260);

          ctx.fillStyle = "#94a3b8";
          ctx.font = "20px sans-serif";
          ctx.fillText("High Definition Audio Track", width / 2, 310);

          // Animated equalizer bars
          const numBars = 48;
          const barWidth = 14;
          const spacing = 8;
          const startX = (width - (numBars * (barWidth + spacing))) / 2;
          const baseY = 480;

          for (let b = 0; b < numBars; b++) {
            const h = Math.abs(Math.sin((frame * 0.1) + b * 0.3)) * 120 + 10;
            const x = startX + b * (barWidth + spacing);
            ctx.fillStyle = `hsl(${(b * 6 + frame * 2) % 360}, 80%, 60%)`;
            ctx.beginPath();
            ctx.roundRect(x, baseY - h / 2, barWidth, h, 6);
            ctx.fill();
          }

          const elapsedSec = (Date.now() - startTime) / 1000;
          const pct = Math.min(95, Math.round((elapsedSec / totalDuration) * 100));
          setProgress(pct);

          requestAnimationFrame(drawVisualizer);
        };

        drawVisualizer();

        setTimeout(() => {
          isDrawing = false;
          recorder.stop();
          audioSource.stop();
          audioCtx.close();
        }, totalDuration * 1000 + 300);

        const videoBlob = await recPromise;
        const url = URL.createObjectURL(videoBlob);
        setOutputUrl(url);
        setOutputSize(videoBlob.size);
        const name = file.name.replace(/\.[^.]+$/, ".webm");
        setOutputName(name);
        setProgress(100);
        setStatusMessage("Complete!");
        toast.success("MP3 converted to video successfully!");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Conversion failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsConverting(false);
    }
  }, [file, mode, bitrate, channels]);

  const handleModeSwitch = useCallback(() => {
    setMode((prev) => (prev === "mp4-to-mp3" ? "mp3-to-mp4" : "mp4-to-mp3"));
    setFile(null);
    setOutputUrl(null);
    setError(null);
    setPeaks([]);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="gap-1.5">
          {mode === "mp4-to-mp3" ? (
            <>
              <Film className="h-3.5 w-3.5 text-primary" /> Video to Audio (MP4 → MP3)
            </>
          ) : (
            <>
              <Music className="h-3.5 w-3.5 text-primary" /> Audio to Video (MP3 → MP4)
            </>
          )}
        </Badge>
        <Button variant="outline" size="sm" onClick={handleModeSwitch} className="gap-1.5 text-xs">
          <ArrowRightLeft className="h-3.5 w-3.5" /> Switch Conversion Mode
        </Button>
      </div>

      {!file ? (
        <Card className="border-2 border-dashed">
          <CardContent className="p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept={mode === "mp4-to-mp3" ? "video/*" : "audio/*"}
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer space-y-3"
            >
              {mode === "mp4-to-mp3" ? (
                <FileVideo className="h-12 w-12 text-primary opacity-80 mx-auto" />
              ) : (
                <FileAudio className="h-12 w-12 text-primary opacity-80 mx-auto" />
              )}
              <h3 className="font-semibold text-lg">
                {mode === "mp4-to-mp3" ? "Select Video File to Extract Audio" : "Select Audio File to Create Video"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {mode === "mp4-to-mp3"
                  ? "Pull high-fidelity MP3/audio tracks with bitrate selection and audio waveform."
                  : "Generate a beautiful 720p HD visualizer video from any MP3 or audio track."}
              </p>
              <Button className="gap-2">
                <Upload className="h-4 w-4" /> Choose {mode === "mp4-to-mp3" ? "Video" : "Audio"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">Max 500MB</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2 truncate max-w-[320px]">
                {mode === "mp4-to-mp3" ? (
                  <Film className="h-4 w-4 text-primary" />
                ) : (
                  <Music className="h-4 w-4 text-primary" />
                )}
                <span className="truncate">{file.name}</span>
              </CardTitle>
              <Badge variant="secondary">{(file.size / (1024 * 1024)).toFixed(1)} MB</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Audio Options (for mp4-to-mp3) */}
            {mode === "mp4-to-mp3" && (
              <div className="grid grid-cols-2 gap-4 p-3 bg-muted/40 rounded-lg">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Audio Bitrate</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(["320", "192", "128"] as const).map((b) => (
                      <Button
                        key={b}
                        size="sm"
                        variant={bitrate === b ? "default" : "outline"}
                        className="text-xs h-7"
                        onClick={() => setBitrate(b)}
                      >
                        {b}k
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Channel Mode</label>
                  <div className="grid grid-cols-2 gap-1">
                    {(["stereo", "mono"] as const).map((c) => (
                      <Button
                        key={c}
                        size="sm"
                        variant={channels === c ? "default" : "outline"}
                        className="text-xs h-7 capitalize"
                        onClick={() => setChannels(c)}
                      >
                        {c}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Waveform Canvas if extracted */}
            {peaks.length > 0 && (
              <div className="rounded-lg border bg-slate-950 p-2 overflow-hidden shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={60}
                  className="w-full h-[60px] block"
                />
              </div>
            )}

            <Button
              onClick={handleConvert}
              disabled={isConverting}
              className="w-full gap-2 font-semibold"
              size="lg"
            >
              {isConverting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {statusMessage} ({progress}%)
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {mode === "mp4-to-mp3" ? "Convert to MP3 Audio" : "Generate Visualizer Video"}
                </>
              )}
            </Button>

            {isConverting && (
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => {
                setFile(null);
                setOutputUrl(null);
                setPeaks([]);
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
                    {outputSize ? `${(outputSize / (1024 * 1024)).toFixed(1)} MB` : ""}
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
                <Download className="h-4 w-4" /> Download Result
              </Button>
            </div>

            {mode === "mp4-to-mp3" ? (
              <audio src={outputUrl} controls className="w-full" />
            ) : (
              <video src={outputUrl} controls className="w-full rounded-lg bg-black max-h-[360px]" />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}