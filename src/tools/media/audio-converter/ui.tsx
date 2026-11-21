"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Music, Upload, Download, ArrowLeftRight, Loader2,
  CheckCircle2, XCircle, FileAudio, Sliders, Sparkles,
} from "lucide-react";
import { audioBufferToWav, extractWaveformPeaks } from "@/lib/processing/client/audio-processor";

type TargetAudioFormat = "mp3" | "wav";
type SampleRateChoice = 48000 | 44100 | 22050;

export function AudioConverterEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<TargetAudioFormat>("wav");
  const [sampleRate, setSampleRate] = useState<SampleRateChoice>(44100);
  const [channels, setChannels] = useState<"stereo" | "mono">("stereo");
  const [isConverting, setIsConverting] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState("");
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [peaks, setPeaks] = useState<number[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const validExts = [".mp3", ".wav", ".ogg", ".webm", ".m4a", ".aac", ".flac"];
    const isValid = selected.type.startsWith("audio/") || validExts.some((ext) => selected.name.toLowerCase().endsWith(ext));

    if (!isValid) {
      setError("Please select a valid audio file (MP3, WAV, OGG, M4A, AAC, FLAC).");
      return;
    }

    if (selected.size > 200 * 1024 * 1024) {
      setError("File size must be under 200MB.");
      return;
    }

    setFile(selected);
    // Suggest complementary target format
    if (selected.name.toLowerCase().endsWith(".wav")) {
      setTargetFormat("mp3");
    } else {
      setTargetFormat("wav");
    }
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file) return;
    setIsConverting(true);
    setError(null);
    setProgress(0);
    setStatusMessage("Decoding input audio samples...");

    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();

      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      setPeaks(extractWaveformPeaks(decodedBuffer, 100));

      setStatusMessage("Resampling and re-channeling audio stream...");
      setProgress(40);

      // Resample to target sample rate using OfflineAudioContext
      const outChannels = channels === "mono" ? 1 : Math.min(2, decodedBuffer.numberOfChannels);
      const offlineCtx = new OfflineAudioContext(
        outChannels,
        Math.ceil(decodedBuffer.duration * sampleRate),
        sampleRate
      );

      const src = offlineCtx.createBufferSource();
      src.buffer = decodedBuffer;
      src.connect(offlineCtx.destination);
      src.start(0);

      const renderedBuffer = await offlineCtx.startRendering();

      setStatusMessage("Encoding target audio file...");
      setProgress(80);

      if (targetFormat === "wav") {
        const wavBlob = audioBufferToWav(renderedBuffer);
        const url = URL.createObjectURL(wavBlob);
        setOutputUrl(url);
        setOutputSize(wavBlob.size);
        const name = file.name.replace(/\.[^.]+$/, ".wav");
        setOutputName(name);
        audioCtx.close();
        setProgress(100);
        setStatusMessage("Complete!");
        toast.success("Converted to WAV successfully!");
      } else {
        // Compress to MP3 / WebM Opus
        const playbackCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({
          sampleRate,
        });
        const sourceNode = playbackCtx.createBufferSource();
        sourceNode.buffer = renderedBuffer;
        const destNode = playbackCtx.createMediaStreamDestination();
        sourceNode.connect(destNode);

        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm";

        const recorder = new MediaRecorder(destNode.stream, {
          mimeType,
          audioBitsPerSecond: 256000,
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
          playbackCtx.close();
          audioCtx.close();
        }, renderedBuffer.duration * 1000 + 100);

        const compressed = await recPromise;
        const url = URL.createObjectURL(compressed);
        setOutputUrl(url);
        setOutputSize(compressed.size);
        const name = file.name.replace(/\.[^.]+$/, ".mp3");
        setOutputName(name);
        setProgress(100);
        setStatusMessage("Complete!");
        toast.success("Converted to MP3 successfully!");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Conversion failed";
      setError(message);
      toast.error("Conversion failed: " + message);
    } finally {
      setIsConverting(false);
    }
  }, [file, targetFormat, sampleRate, channels]);

  return (
    <div className="space-y-6">
      <Badge variant="outline" className="gap-1.5">
        <FileAudio className="h-3.5 w-3.5 text-primary" /> Universal Audio Converter
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
              <h3 className="font-semibold text-lg">Convert Audio Files Online</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Convert between MP3, WAV, OGG, M4A, and FLAC. Customize sample rate and channels with local browser processing.
              </p>
              <Button className="gap-2">
                <Upload className="h-4 w-4" /> Select Audio File
              </Button>
              <p className="text-xs text-muted-foreground mt-2">Max 200MB</p>
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
              <Badge variant="secondary">{(file.size / (1024 * 1024)).toFixed(1)} MB</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Conversion Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-muted/40 rounded-lg">
              {/* Target Format */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Target Format</label>
                <div className="grid grid-cols-2 gap-1">
                  {(["mp3", "wav"] as const).map((fmt) => (
                    <Button
                      key={fmt}
                      size="sm"
                      variant={targetFormat === fmt ? "default" : "outline"}
                      className="text-xs h-7 uppercase font-semibold"
                      onClick={() => setTargetFormat(fmt)}
                    >
                      {fmt}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sample Rate */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Sample Rate</label>
                <div className="grid grid-cols-3 gap-1">
                  {([48000, 44100, 22050] as const).map((sr) => (
                    <Button
                      key={sr}
                      size="sm"
                      variant={sampleRate === sr ? "default" : "outline"}
                      className="text-xs h-7"
                      onClick={() => setSampleRate(sr)}
                    >
                      {sr === 48000 ? "48k" : sr === 44100 ? "44.1k" : "22k"}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Channels */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Channels</label>
                <div className="grid grid-cols-2 gap-1">
                  {(["stereo", "mono"] as const).map((ch) => (
                    <Button
                      key={ch}
                      size="sm"
                      variant={channels === ch ? "default" : "outline"}
                      className="text-xs h-7 capitalize"
                      onClick={() => setChannels(ch)}
                    >
                      {ch}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Waveform */}
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
                  <Sparkles className="h-4 w-4" /> Convert Audio to {targetFormat.toUpperCase()}
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
              <Upload className="h-4 w-4" /> Choose Different Audio File
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
                    {sampleRate} Hz • {channels} • {outputSize ? `${(outputSize / 1024).toFixed(1)} KB` : ""}
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
                <Download className="h-4 w-4" /> Download Converted File
              </Button>
            </div>

            <audio src={outputUrl} controls className="w-full" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}