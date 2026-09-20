"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Music, Upload, Download, ArrowLeftRight, Loader2,
  CheckCircle2, XCircle, FileAudio,
} from "lucide-react";

type ConversionMode = "wav-to-mp3" | "mp3-to-wav";

export function AudioConverterEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ConversionMode>("wav-to-mp3");
  const [isConverting, setIsConverting] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setError(null);
    setOutputUrl(null);

    const isWav = selected.type === "audio/wav" || selected.name.endsWith(".wav");
    const isMp3 = selected.type === "audio/mpeg" || selected.name.endsWith(".mp3");

    if (mode === "wav-to-mp3" && !isWav) {
      setError("Please select a WAV audio file.");
      return;
    }
    if (mode === "mp3-to-wav" && !isMp3) {
      setError("Please select an MP3 audio file.");
      return;
    }

    if (selected.size > 200 * 1024 * 1024) {
      setError("File size must be under 200MB.");
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
      const audioContext = new AudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      setProgress(40);

      if (mode === "mp3-to-wav") {
        // Convert to WAV
        const wavBlob = audioBufferToWav(audioBuffer);
        setProgress(90);
        const url = URL.createObjectURL(wavBlob);
        setOutputUrl(url);
        setOutputName(file.name.replace(/\.(mp3|MP3)$/, ".wav"));
        toast.success("MP3 converted to WAV successfully!");
      } else {
        // Convert WAV to compressed audio via MediaRecorder
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        const dest = audioContext.createMediaStreamDestination();
        source.connect(dest);

        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm";

        const mediaRecorder = new MediaRecorder(dest.stream, { mimeType });
        const chunks: Blob[] = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/webm" });
          const url = URL.createObjectURL(blob);
          setOutputUrl(url);
          setOutputName(file.name.replace(/\.(wav|WAV)$/, ".mp3"));
          setProgress(100);
          audioContext.close();
          toast.success("WAV converted to MP3 successfully!");
        };

        mediaRecorder.start();
        source.start(0);
        setProgress(60);

        setTimeout(() => {
          mediaRecorder.stop();
          source.stop();
        }, audioBuffer.duration * 1000 + 100);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Conversion failed";
      setError(message);
      toast.error("Conversion failed: " + message);
    } finally {
      if (mode === "mp3-to-wav") {
        setIsConverting(false);
      }
    }
  }, [file, mode]);

  const handleModeSwitch = useCallback(() => {
    setMode((prev) => prev === "wav-to-mp3" ? "mp3-to-wav" : "wav-to-mp3");
    setFile(null);
    setOutputUrl(null);
    setError(null);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="gap-1.5">
          <FileAudio className="h-3.5 w-3.5" />
          {mode === "wav-to-mp3" ? "WAV → MP3" : "MP3 → WAV"}
        </Badge>
        <Button variant="outline" size="sm" onClick={handleModeSwitch} className="gap-1.5">
          <ArrowLeftRight className="h-3.5 w-3.5" />
          Switch Direction
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Upload {mode === "wav-to-mp3" ? "WAV" : "MP3"} File
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept={mode === "wav-to-mp3" ? "audio/wav,.wav" : "audio/mpeg,.mp3"}
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
                <Music className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="font-medium">
                  Drop {mode === "wav-to-mp3" ? "WAV" : "MP3"} file here or click to browse
                </p>
                <p className="text-sm text-muted-foreground">Max 200MB</p>
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
                  <p className="font-medium text-sm">Converted!</p>
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
          <><ArrowLeftRight className="h-4 w-4" />
          {mode === "wav-to-mp3" ? "Convert WAV to MP3" : "Convert MP3 to WAV"}
          </>
        )}
      </Button>
    </div>
  );
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const data = buffer.getChannelData(0);
  const dataLength = data.length * 2;
  const headerLength = 44;
  const totalLength = headerLength + dataLength;

  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, totalLength - 8, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < data.length; i++) {
    const s = Math.max(-1, Math.min(1, data[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}