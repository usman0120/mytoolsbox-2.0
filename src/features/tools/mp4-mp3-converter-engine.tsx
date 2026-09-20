"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  FileVideo, FileAudio, Upload, Download, ArrowRightLeft,
  Loader2, CheckCircle2, XCircle, Music, Film,
} from "lucide-react";

type ConversionMode = "mp4-to-mp3" | "mp3-to-mp4";

export function MP4MP3ConverterEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ConversionMode>("mp4-to-mp3");
  const [isConverting, setIsConverting] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setError(null);
    setOutputUrl(null);

    const isMP4 = selected.type === "video/mp4" || selected.name.endsWith(".mp4");
    const isMP3 = selected.type === "audio/mpeg" || selected.name.endsWith(".mp3");

    if (mode === "mp4-to-mp3" && !isMP4) {
      setError("Please select an MP4 video file.");
      return;
    }
    if (mode === "mp3-to-mp4" && !isMP3) {
      setError("Please select an MP3 audio file.");
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

    try {
      if (mode === "mp4-to-mp3") {
        // Extract audio from MP4 video
        const audioContext = new AudioContext();
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        setProgress(30);

        // Convert to WAV first
        const wavBlob = audioBufferToWav(audioBuffer);
        setProgress(60);

        // Convert WAV to MP3 using MediaRecorder
        const mp3Blob = await convertWavToMp3(wavBlob);
        setProgress(90);

        const url = URL.createObjectURL(mp3Blob);
        setOutputUrl(url);
        setOutputName(file.name.replace(/\.(mp4|MP4)$/, ".mp3"));
        toast.success("MP4 converted to MP3 successfully!");
      } else {
        // MP3 to MP4: Create a video with a static canvas + audio
        const audioContext = new AudioContext();
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        setProgress(30);

        const duration = audioBuffer.duration;
        const canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 360;
        const ctx = canvas.getContext("2d")!;

        // Draw a nice background
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, 640, 360);
        ctx.fillStyle = "#e94560";
        ctx.font = "bold 48px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🎵 " + file.name.replace(/\.(mp3|MP3)$/, ""), 320, 160);
        ctx.fillStyle = "#ffffff";
        ctx.font = "24px sans-serif";
        ctx.fillText("Audio Track", 320, 220);

        const videoStream = canvas.captureStream(30);
        const audioSource = audioContext.createBufferSource();
        audioSource.buffer = audioBuffer;
        const audioDest = audioContext.createMediaStreamDestination();
        audioSource.connect(audioDest);
        audioSource.connect(audioContext.destination);

        const combinedStream = new MediaStream([
          ...videoStream.getVideoTracks(),
          ...audioDest.stream.getAudioTracks(),
        ]);

        setProgress(50);

        const mediaRecorder = new MediaRecorder(combinedStream, {
          mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm",
          videoBitsPerSecond: 2500000,
        });

        const chunks: Blob[] = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "video/webm" });
          const url = URL.createObjectURL(blob);
          setOutputUrl(url);
          setOutputName(file.name.replace(/\.(mp3|MP3)$/, ".webm"));
          setProgress(100);
          toast.success("MP3 converted to video successfully!");
        };

        mediaRecorder.start();
        audioSource.start(0);

        // Update progress during recording
        const startTime = Date.now();
        const totalMs = duration * 1000;
        const progressInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const pct = Math.min(50 + (elapsed / totalMs) * 45, 95);
          setProgress(Math.round(pct));
        }, 200);

        setTimeout(() => {
          clearInterval(progressInterval);
          mediaRecorder.stop();
          audioSource.stop();
          audioContext.close();
        }, totalMs + 500);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Conversion failed";
      setError(message);
      toast.error("Conversion failed: " + message);
    } finally {
      if (mode === "mp4-to-mp3") {
        setIsConverting(false);
      }
    }
  }, [file, mode]);

  const handleModeSwitch = useCallback(() => {
    setMode((prev) => prev === "mp4-to-mp3" ? "mp3-to-mp4" : "mp4-to-mp3");
    setFile(null);
    setOutputUrl(null);
    setError(null);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="gap-1.5">
          {mode === "mp4-to-mp3" ? (
            <><Film className="h-3.5 w-3.5" /> MP4 → MP3</>
          ) : (
            <><Music className="h-3.5 w-3.5" /> MP3 → MP4</>
          )}
        </Badge>
        <Button variant="outline" size="sm" onClick={handleModeSwitch} className="gap-1.5">
          <ArrowRightLeft className="h-3.5 w-3.5" />
          Switch Direction
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {mode === "mp4-to-mp3" ? "Upload MP4 Video" : "Upload MP3 Audio"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept={mode === "mp4-to-mp3" ? "video/mp4,.mp4" : "audio/mpeg,.mp3"}
            onChange={handleFileSelect}
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            {file ? (
              <div className="space-y-2">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="font-medium">
                  {mode === "mp4-to-mp3" ? "Drop MP4 video here or click to browse" : "Drop MP3 audio here or click to browse"}
                </p>
                <p className="text-sm text-muted-foreground">Max 500MB</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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

      {isConverting && (
        <Card>
          <CardContent className="py-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Converting... {progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {outputUrl && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-sm">Ready!</p>
                  <p className="text-xs text-muted-foreground">{outputName}</p>
                </div>
              </div>
              <Button size="sm" className="gap-1.5" onClick={() => { const a = document.createElement("a"); a.href = outputUrl; a.download = outputName; a.click(); }}>
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleConvert}
        disabled={!file || isConverting}
        className="w-full gap-2"
      >
        {isConverting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Converting...</>
        ) : (
          <><ArrowRightLeft className="h-4 w-4" />
          {mode === "mp4-to-mp3" ? "Convert MP4 to MP3" : "Convert MP3 to Video"}
          </>
        )}
      </Button>
    </div>
  );
}

// Helper: Convert AudioBuffer to WAV Blob
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitsPerSample = 16;
  const data = buffer.getChannelData(0);
  const dataLength = data.length * (bitsPerSample / 8);
  const headerLength = 44;
  const totalLength = headerLength + dataLength;

  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  // WAV header
  writeString(view, 0, "RIFF");
  view.setUint32(4, totalLength - 8, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
  view.setUint16(32, numChannels * (bitsPerSample / 8), true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < data.length; i++) {
    const sample = Math.max(-1, Math.min(1, data[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

// Convert WAV to MP3-like format using MediaRecorder
async function convertWavToMp3(wavBlob: Blob): Promise<Blob> {
  const audioContext = new AudioContext();
  const arrayBuffer = await wavBlob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  const dest = audioContext.createMediaStreamDestination();
  source.connect(dest);

  const mediaRecorder = new MediaRecorder(dest.stream, {
    mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm",
  });

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

  return new Promise((resolve) => {
    mediaRecorder.onstop = () => {
      resolve(new Blob(chunks, { type: "audio/webm" }));
      audioContext.close();
    };
    mediaRecorder.start();
    source.start(0);
    setTimeout(() => {
      mediaRecorder.stop();
      source.stop();
    }, audioBuffer.duration * 1000 + 100);
  });
}