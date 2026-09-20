"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Film, Music, Upload, Download, Loader2, CheckCircle2, XCircle,
} from "lucide-react";

export function ExtractAudioFromVideoEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
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

    if (!selected.type.startsWith("video/")) {
      setError("Please select a valid video file.");
      return;
    }

    if (selected.size > 500 * 1024 * 1024) {
      setError("File size must be under 500MB.");
      return;
    }

    setFile(selected);
  }, []);

  const handleExtract = useCallback(async () => {
    if (!file) return;
    setIsExtracting(true);
    setError(null);
    setProgress(0);

    try {
      const audioContext = new AudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      setProgress(50);

      // Convert to WAV
      const wavBlob = audioBufferToWav(audioBuffer);
      setProgress(90);

      const url = URL.createObjectURL(wavBlob);
      setOutputUrl(url);
      setOutputName(file.name.replace(/\.[^.]+$/, "_audio.wav"));
      setProgress(100);
      audioContext.close();
      toast.success("Audio extracted successfully!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Extraction failed";
      setError(message);
      toast.error("Extraction failed: " + message);
    } finally {
      setIsExtracting(false);
    }
  }, [file]);

  return (
    <div className="space-y-4">
      <Badge variant="outline" className="gap-1.5">
        <Music className="h-3.5 w-3.5" /> Extract Audio from Video
      </Badge>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload Video</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
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
                <Film className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="font-medium">Drop video here or click to browse</p>
                <p className="text-sm text-muted-foreground">MP4, WebM, MOV — Max 500MB</p>
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

      {isExtracting && (
        <Card>
          <CardContent className="py-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Extracting audio... {progress}%</span>
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
                  <p className="font-medium text-sm">Audio Extracted!</p>
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
        onClick={handleExtract}
        disabled={!file || isExtracting}
        className="w-full gap-2"
      >
        {isExtracting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Extracting...</>
        ) : (
          <><Music className="h-4 w-4" /> Extract Audio</>
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