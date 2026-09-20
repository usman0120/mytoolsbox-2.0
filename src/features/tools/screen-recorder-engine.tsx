"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Video, Play, Square, Download, Monitor, Mic, MicOff, Camera, RefreshCw, Clock, FileVideo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function ScreenRecorderEngine() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");
  const [includeAudio, setIncludeAudio] = useState(true);
  const [recordingMode, setRecordingMode] = useState<"screen" | "window" | "tab">("screen");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const previewRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, [recordedUrl]);

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
    setIsPaused(false);
  };

  const startRecording = useCallback(async () => {
    setError("");
    setRecordedBlob(null);
    setRecordedUrl("");
    setDuration(0);

    try {
      const displayMediaOptions: DisplayMediaStreamOptions = {
        video: {
          displaySurface: recordingMode === "tab" ? "browser" : recordingMode,
        } as MediaTrackConstraints,
        audio: includeAudio,
      };

      const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      streamRef.current = stream;

      // Handle user stopping via browser UI
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        stopRecording();
      });

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        setRecordedUrl(URL.createObjectURL(blob));
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recorder.start(100);
      setIsRecording(true);
      setIsPaused(false);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to start screen recording. Please grant screen sharing permission.");
    }
  }, [includeAudio, recordingMode, stopRecording]);

  const handlePauseResume = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } else {
      mediaRecorderRef.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
    }
    setIsPaused(!isPaused);
  };

  const handleDownload = () => {
    if (!recordedBlob) return;
    const link = document.createElement("a");
    link.download = `screen-recording-${Date.now()}.webm`;
    link.href = URL.createObjectURL(recordedBlob);
    link.click();
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Recording options */}
      {!isRecording && !recordedBlob && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Recording Mode</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["screen", "window", "tab"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setRecordingMode(mode)}
                    className={`p-3 rounded-lg border text-center transition-all capitalize ${
                      recordingMode === mode
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border/50 hover:border-border hover:bg-muted/50"
                    }`}
                  >
                    <Monitor className="h-5 w-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">{mode}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIncludeAudio(!includeAudio)}
                className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                  includeAudio
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-border"
                }`}
              >
                {includeAudio ? <Mic className="h-4 w-4 text-primary" /> : <MicOff className="h-4 w-4 text-muted-foreground" />}
                <span className="text-xs">{includeAudio ? "Audio On" : "Audio Off"}</span>
              </button>
            </div>

            <Button onClick={startRecording} className="gap-2 w-full" size="lg">
              <Video className="h-5 w-5" /> Start Recording
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recording in progress */}
      {isRecording && (
        <Card className="border-red-500/50 bg-red-500/5">
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500" />
              </span>
              <span className="text-lg font-bold text-red-500">
                {isPaused ? "PAUSED" : "RECORDING"}
              </span>
            </div>
            <p className="text-3xl font-mono font-bold">{formatDuration(duration)}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handlePauseResume} variant="outline" className="gap-2">
                {isPaused ? <Play className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                {isPaused ? "Resume" : "Pause"}
              </Button>
              <Button onClick={stopRecording} variant="destructive" className="gap-2">
                <Square className="h-4 w-4" /> Stop
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {recordedUrl && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <FileVideo className="h-5 w-5 text-primary" />
              <span className="font-semibold">Recording Complete</span>
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" /> {formatDuration(duration)}
              </Badge>
            </div>
            <video
              ref={previewRef}
              src={recordedUrl}
              controls
              className="w-full rounded-lg border border-border"
              style={{ maxHeight: "400px" }}
            />
            <div className="flex gap-2">
              <Button onClick={handleDownload} className="gap-2 flex-1">
                <Download className="h-4 w-4" /> Download WebM
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setRecordedBlob(null);
                  setRecordedUrl("");
                  setDuration(0);
                }}
              >
                <RefreshCw className="h-4 w-4" /> Record Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-3">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> Screen recording uses the browser&apos;s built-in Screen Capture API. 
            Recordings are saved as WebM format. For longer recordings, ensure you have sufficient disk space. 
            Audio recording requires granting microphone permission.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}