"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Film, Music, Upload, Download, Loader2, CheckCircle2, XCircle,
  Volume2, VolumeX, Sparkles, Scissors, Settings2,
} from "lucide-react";
import { audioBufferToWav, extractWaveformPeaks } from "@/lib/processing/client/audio-processor";

export function ExtractAudioFromVideoEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState("");
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [peaks, setPeaks] = useState<number[]>([]);

  // Extraction Settings
  const [exportFormat, setExportFormat] = useState<"mp3" | "wav">("mp3");
  const [volumeGain, setVolumeGain] = useState(1.0); // 1.0 = 100%, 1.5 = 150%, 2.0 = 200%
  const [enableTrim, setEnableTrim] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

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
      ctx.fillStyle = "#8b5cf6";
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

    if (!selected.type.startsWith("video/") && !selected.name.match(/\.(mp4|webm|mov|mkv|avi|wmv)$/i)) {
      setError("Please select a valid video file (MP4, WebM, MOV, MKV, etc.)");
      return;
    }

    if (selected.size > 500 * 1024 * 1024) {
      setError("File size must be under 500MB.");
      return;
    }

    setFile(selected);

    // Read duration
    const url = URL.createObjectURL(selected);
    const v = document.createElement("video");
    v.src = url;
    v.onloadedmetadata = () => {
      setTotalDuration(v.duration);
      setStartTime(0);
      setEndTime(v.duration);
      URL.revokeObjectURL(url);
    };
  }, []);

  const handleExtract = useCallback(async () => {
    if (!file) return;
    setIsExtracting(true);
    setError(null);
    setProgress(0);
    setStatusMessage("Demuxing audio track from video container...");

    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();

      setStatusMessage("Decoding PCM audio samples...");
      setProgress(30);

      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      setPeaks(extractWaveformPeaks(decodedBuffer, 100));

      const sampleRate = decodedBuffer.sampleRate;
      const numChannels = decodedBuffer.numberOfChannels;

      const sliceStart = enableTrim ? Math.floor(startTime * sampleRate) : 0;
      const sliceEnd = enableTrim ? Math.floor(endTime * sampleRate) : decodedBuffer.length;
      const outputLength = Math.max(1, sliceEnd - sliceStart);

      const finalBuffer = audioCtx.createBuffer(numChannels, outputLength, sampleRate);

      // Copy samples with volume gain
      for (let ch = 0; ch < numChannels; ch++) {
        const srcData = decodedBuffer.getChannelData(ch);
        const dstData = finalBuffer.getChannelData(ch);
        for (let i = 0; i < outputLength; i++) {
          const sample = srcData[sliceStart + i] * volumeGain;
          dstData[i] = Math.max(-1, Math.min(1, sample)); // hard limiter
        }
      }

      setStatusMessage("Encoding output audio file...");
      setProgress(70);

      if (exportFormat === "wav") {
        const wavBlob = audioBufferToWav(finalBuffer);
        const url = URL.createObjectURL(wavBlob);
        setOutputUrl(url);
        setOutputSize(wavBlob.size);
        const name = file.name.replace(/\.[^.]+$/, "_audio.wav");
        setOutputName(name);
        audioCtx.close();
        setProgress(100);
        setStatusMessage("Complete!");
        toast.success("Audio track extracted successfully!");
      } else {
        // MP3 / WebM compression
        const srcNode = audioCtx.createBufferSource();
        srcNode.buffer = finalBuffer;
        const destNode = audioCtx.createMediaStreamDestination();
        srcNode.connect(destNode);

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
        srcNode.start(0);

        setTimeout(() => {
          recorder.stop();
          srcNode.stop();
          audioCtx.close();
        }, finalBuffer.duration * 1000 + 100);

        const compressed = await recPromise;
        const url = URL.createObjectURL(compressed);
        setOutputUrl(url);
        setOutputSize(compressed.size);
        const name = file.name.replace(/\.[^.]+$/, "_audio.mp3");
        setOutputName(name);
        setProgress(100);
        setStatusMessage("Complete!");
        toast.success("Audio track extracted successfully!");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Extraction failed";
      setError(message);
      toast.error(message);
    } finally {
      setIsExtracting(false);
    }
  }, [file, exportFormat, volumeGain, enableTrim, startTime, endTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <Badge variant="outline" className="gap-1.5">
        <Music className="h-3.5 w-3.5 text-primary" /> Extract Audio from Video
      </Badge>

      {!file ? (
        <Card className="border-2 border-dashed">
          <CardContent className="p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer space-y-3"
            >
              <Film className="h-12 w-12 text-primary opacity-80 mx-auto" />
              <h3 className="font-semibold text-lg">Extract Audio from Video File</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Rip high-fidelity audio tracks in MP3 or WAV format. Supports volume boost and selective trimming.
              </p>
              <Button className="gap-2">
                <Upload className="h-4 w-4" /> Select Video File
              </Button>
              <p className="text-xs text-muted-foreground mt-2">MP4, WebM, MOV, MKV up to 500MB</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2 truncate max-w-[300px]">
                <Film className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">{file.name}</span>
              </CardTitle>
              <Badge variant="secondary">{(file.size / (1024 * 1024)).toFixed(1)} MB</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Extraction Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/40 rounded-lg">
              {/* Format */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Output Format</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: "mp3", label: "MP3 Audio (256kbps)" },
                      { id: "wav", label: "Lossless WAV (16-bit)" },
                    ] as const
                  ).map((f) => (
                    <Button
                      key={f.id}
                      size="sm"
                      variant={exportFormat === f.id ? "default" : "outline"}
                      className="text-xs h-8"
                      onClick={() => setExportFormat(f.id)}
                    >
                      {f.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Volume Booster */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Volume Level</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[1.0, 1.5, 2.0].map((v) => (
                    <Button
                      key={v}
                      size="sm"
                      variant={volumeGain === v ? "default" : "outline"}
                      className="text-xs h-8"
                      onClick={() => setVolumeGain(v)}
                    >
                      {Math.round(v * 100)}% {v > 1 && "⚡"}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Optional Trimmer */}
            <div className="space-y-2 pt-2 border-t">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableTrim}
                  onChange={(e) => setEnableTrim(e.target.checked)}
                  className="rounded"
                />
                <Scissors className="h-3.5 w-3.5 text-primary" />
                <span>Extract only a portion of the video (Trim start / end)</span>
              </label>

              {enableTrim && totalDuration > 0 && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Start: {formatTime(startTime)}</span>
                    </div>
                    <Slider
                      value={[startTime]}
                      min={0}
                      max={Math.max(0, endTime - 0.5)}
                      step={0.5}
                      onValueChange={(v) => setStartTime(Array.isArray(v) ? v[0] : v)}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>End: {formatTime(endTime)}</span>
                    </div>
                    <Slider
                      value={[endTime]}
                      min={Math.min(totalDuration, startTime + 0.5)}
                      max={totalDuration}
                      step={0.5}
                      onValueChange={(v) => setEndTime(Array.isArray(v) ? v[0] : v)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Waveform Canvas */}
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
              onClick={handleExtract}
              disabled={isExtracting}
              className="w-full gap-2 font-semibold"
              size="lg"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {statusMessage} ({progress}%)
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Extract Audio Track
                </>
              )}
            </Button>

            {isExtracting && (
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
              <Upload className="h-4 w-4" /> Select Different Video
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
                    {outputSize ? `${(outputSize / 1024).toFixed(1)} KB • ` : ""}
                    Extracted Audio Track
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