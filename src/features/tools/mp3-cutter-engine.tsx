"use client";

import { useState, useCallback, useRef } from "react";
import { Music, Play, Pause, Square, Scissors, Download, Upload, Clock, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function MP3CutterEngine() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      setError("Please select an audio file (MP3, WAV, etc.)");
      return;
    }

    setError("");
    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setStartTime(0);
    setEndTime(0);
    setCurrentTime(0);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setEndTime(audioRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = startTime;
    setIsPlaying(false);
    setCurrentTime(startTime);
  };

  const handleSeek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleSetStart = () => {
    setStartTime(currentTime);
    if (currentTime >= endTime) {
      setEndTime(duration);
    }
  };

  const handleSetEnd = () => {
    if (currentTime > startTime) {
      setEndTime(currentTime);
    }
  };

  const handleCut = async () => {
    if (!audioFile || startTime >= endTime) {
      setError("Please set valid start and end points.");
      return;
    }

    try {
      // Use AudioContext to slice the audio
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const sampleRate = audioBuffer.sampleRate;
      const startSample = Math.floor(startTime * sampleRate);
      const endSample = Math.floor(endTime * sampleRate);
      const length = endSample - startSample;

      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        length,
        sampleRate
      );

      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineContext.destination);
      source.start(0, startTime, endTime - startTime);

      const renderedBuffer = await offlineContext.startRendering();

      // Convert to WAV
      const wavBlob = audioBufferToWav(renderedBuffer);
      const url = URL.createObjectURL(wavBlob);

      const link = document.createElement("a");
      link.download = `cut-${audioFile.name.replace(/\.[^.]+$/, "")}.wav`;
      link.href = url;
      link.click();

      URL.revokeObjectURL(url);
      audioContext.close();
    } catch (err: any) {
      setError("Failed to cut audio: " + (err.message || "Unknown error"));
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
      {/* File upload */}
      {!audioFile && (
        <Card>
          <CardContent className="p-8 text-center">
            <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="font-medium mb-1">Upload Audio File</p>
            <p className="text-sm text-muted-foreground mb-4">MP3, WAV, OGG, AAC supported</p>
            <label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button className="gap-2">
                  <Upload className="h-4 w-4" /> Choose File
                </Button>
            </label>
          </CardContent>
        </Card>
      )}

      {/* Audio player */}
      {audioUrl && (
        <>
          <audio
            ref={audioRef}
            src={audioUrl}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => { setIsPlaying(false); }}
            className="hidden"
          />

          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Music className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm truncate flex-1">{audioFile?.name}</span>
                <Badge variant="secondary">{formatTime(duration)}</Badge>
              </div>

              {/* Timeline */}
              <div className="space-y-1">
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-primary/30 rounded-full"
                    style={{ left: `${(startTime / duration) * 100}%`, width: `${((endTime - startTime) / duration) * 100}%` }}
                  />
                  <div
                    className="absolute h-full w-1 bg-primary rounded-full"
                    style={{ left: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Playback controls */}
              <div className="flex items-center justify-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleSeek(startTime)}>
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button onClick={handlePlayPause} size="icon" className="h-10 w-10 rounded-full">
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={handleStop}>
                  <Square className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleSeek(endTime)}>
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              {/* Cut markers */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Start: {formatTime(startTime)}</Label>
                    <Button variant="outline" size="sm" className="h-6 text-xs" onClick={handleSetStart}>
                      Set Current
                    </Button>
                  </div>
                  <Slider
                    value={[startTime]}
                    onValueChange={(v) => setStartTime(Math.min(Array.isArray(v) ? v[0] : v, endTime - 0.1))}
                    min={0}
                    max={duration}
                    step={0.01}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">End: {formatTime(endTime)}</Label>
                    <Button variant="outline" size="sm" className="h-6 text-xs" onClick={handleSetEnd}>
                      Set Current
                    </Button>
                  </div>
                  <Slider
                    value={[endTime]}
                    onValueChange={(v) => setEndTime(Math.max(Array.isArray(v) ? v[0] : v, startTime + 0.1))}
                    min={0}
                    max={duration}
                    step={0.01}
                  />
                </div>
              </div>

              {/* Selection info */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Selection: <span className="font-mono font-medium text-foreground">{formatTime(endTime - startTime)}</span>
                </span>
                <Button onClick={handleCut} className="gap-2" disabled={startTime >= endTime}>
                  <Scissors className="h-4 w-4" /> Cut & Download
                </Button>
              </div>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="gap-2 w-full"
            onClick={() => {
              setAudioFile(null);
              setAudioUrl("");
              URL.revokeObjectURL(audioUrl);
            }}
          >
            <Upload className="h-4 w-4" /> Choose Different File
          </Button>
        </>
      )}

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-3">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// WAV encoder helper
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

  // Write samples
  let offset = 44;
  for (let i = 0; i < data.length; i++) {
    const sample = Math.max(-1, Math.min(1, data[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}