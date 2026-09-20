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
  Volume2, VolumeX,
} from "lucide-react";

export function AudioCutterEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isCutting, setIsCutting] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setFile(selected);
    setAudioUrl(url);
  }, [audioUrl]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      const d = audioRef.current.duration;
      setDuration(d);
      setEndTime(d);
      setStartTime(0);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      const t = audioRef.current.currentTime;
      setCurrentTime(t);
      if (t >= endTime) {
        audioRef.current.pause();
        setIsPlaying(false);
        audioRef.current.currentTime = startTime;
      }
    }
  }, [endTime, startTime]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.currentTime = startTime;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying, startTime]);

  const handleCut = useCallback(async () => {
    if (!file || !audioUrl) return;
    setIsCutting(true);
    setError(null);

    try {
      const audioContext = new AudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const sampleRate = audioBuffer.sampleRate;
      const startSample = Math.floor(startTime * sampleRate);
      const endSample = Math.floor(endTime * sampleRate);
      const newLength = endSample - startSample;

      const newBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        newLength,
        sampleRate
      );

      for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
        const oldData = audioBuffer.getChannelData(ch);
        const newData = newBuffer.getChannelData(ch);
        for (let i = 0; i < newLength; i++) {
          let sample = oldData[startSample + i];
          // Apply fade in
          if (fadeIn && i < sampleRate * 0.05) {
            sample *= i / (sampleRate * 0.05);
          }
          // Apply fade out
          if (fadeOut && i > newLength - sampleRate * 0.05) {
            sample *= (newLength - i) / (sampleRate * 0.05);
          }
          newData[i] = sample;
        }
      }

      // Convert to WAV
      const wavBlob = audioBufferToWav(newBuffer);
      const url = URL.createObjectURL(wavBlob);
      setOutputUrl(url);
      toast.success("Audio cut successfully!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Cutting failed";
      setError(message);
      toast.error("Cutting failed: " + message);
    } finally {
      setIsCutting(false);
    }
  }, [file, audioUrl, startTime, endTime, fadeIn, fadeOut]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${m}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      <Badge variant="outline" className="gap-1.5">
        <Scissors className="h-3.5 w-3.5" /> Audio Cutter
      </Badge>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload Audio File</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
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
                <p className="font-medium">Drop audio file here or click to browse</p>
                <p className="text-sm text-muted-foreground">MP3, WAV, OGG, M4A, AAC, FLAC — Max 200MB</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {audioUrl && (
        <>
          <audio
            ref={audioRef}
            src={audioUrl}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />

          <Card>
            <CardContent className="py-4">
              <div className="space-y-4">
                {/* Playback controls */}
                <div className="flex items-center justify-center gap-3">
                  <Button variant="outline" size="icon" onClick={() => { if (audioRef.current) { audioRef.current.currentTime = startTime; } }}>
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button size="icon" onClick={togglePlay} className="h-10 w-10 rounded-full">
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => { if (audioRef.current) { audioRef.current.currentTime = endTime; } }}>
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="relative h-2 bg-muted rounded-full">
                    <div
                      className="absolute h-2 bg-primary/30 rounded-full"
                      style={{ left: `${(startTime / duration) * 100}%`, width: `${((endTime - startTime) / duration) * 100}%` }}
                    />
                    <div
                      className="absolute h-2 bg-primary rounded-full w-1"
                      style={{ left: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Start time slider */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Start Time: {formatTime(startTime)}</label>
                  <Slider
                    value={[startTime]}
                    min={0}
                    max={endTime - 0.1}
                    step={0.01}
                    onValueChange={(v) => { const arr = v as number[]; if (arr.length > 0) setStartTime(arr[0]); }}
                  />
                </div>

                {/* End time slider */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">End Time: {formatTime(endTime)}</label>
                  <Slider
                    value={[endTime]}
                    min={startTime + 0.1}
                    max={duration}
                    step={0.01}
                    onValueChange={(v) => { const arr = v as number[]; if (arr.length > 0) setEndTime(arr[0]); }}
                  />
                </div>

                {/* Fade options */}
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fadeIn}
                      onChange={(e) => setFadeIn(e.target.checked)}
                      className="rounded"
                    />
                    Fade In
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fadeOut}
                      onChange={(e) => setFadeOut(e.target.checked)}
                      className="rounded"
                    />
                    Fade Out
                  </label>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Selected: {formatTime(endTime - startTime)} of {formatTime(duration)}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
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
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-sm">Cut Complete!</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(endTime - startTime)} — {file?.name?.replace(/\.[^.]+$/, "_cut.wav") ?? "cut.wav"}
                  </p>
                </div>
              </div>
              <Button size="sm" className="gap-1.5" onClick={() => { const a = document.createElement("a"); a.href = outputUrl; a.download = file?.name?.replace(/\.[^.]+$/, "_cut.wav") ?? "cut.wav"; a.click(); }}>
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleCut}
        disabled={!file || isCutting || startTime >= endTime}
        className="w-full gap-2"
      >
        {isCutting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Cutting...</>
        ) : (
          <><Scissors className="h-4 w-4" /> Cut Audio</>
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