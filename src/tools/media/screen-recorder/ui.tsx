"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Video, Play, Square, Download, Monitor, Mic, MicOff,
  Camera, CameraOff, RefreshCw, Clock, FileVideo, Radio,
  Volume2, Settings2, Sliders, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type QualityPreset = "1080p60" | "1080p30" | "720p30";

export function ScreenRecorderEngine() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");

  // Configuration
  const [includeMic, setIncludeMic] = useState(true);
  const [includeSystemAudio, setIncludeSystemAudio] = useState(true);
  const [enableWebcamPip, setEnableWebcamPip] = useState(false);
  const [recordingMode, setRecordingMode] = useState<"screen" | "camera">("screen");
  const [qualityPreset, setQualityPreset] = useState<QualityPreset>("1080p30");
  const [micVolume, setMicVolume] = useState(0);

  // References
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const camStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const previewRef = useRef<HTMLVideoElement>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllMedia();
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const stopAllMedia = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (camStreamRef.current) {
      camStreamRef.current.getTracks().forEach((t) => t.stop());
      camStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    stopAllMedia();
    setIsRecording(false);
    setIsPaused(false);
  }, []);

  const startRecording = useCallback(async () => {
    setError("");
    setRecordedBlob(null);
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl("");
    setDuration(0);

    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const audioDest = audioCtx.createMediaStreamDestination();

      let targetStream: MediaStream;

      // Quality specs
      const fps = qualityPreset === "1080p60" ? 60 : 30;
      const width = qualityPreset === "720p30" ? 1280 : 1920;
      const height = qualityPreset === "720p30" ? 720 : 1080;
      const bitrate = qualityPreset === "1080p60" ? 8000000 : 5000000;

      if (recordingMode === "camera") {
        // Webcam-only mode
        const camStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: width }, height: { ideal: height }, frameRate: { ideal: fps } },
          audio: includeMic,
        });
        camStreamRef.current = camStream;
        targetStream = camStream;
      } else {
        // Screen mode
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: width },
            height: { ideal: height },
            frameRate: { ideal: fps },
          },
          audio: includeSystemAudio,
        });
        screenStreamRef.current = screenStream;

        // Auto-stop when user clicks "Stop Sharing" on browser prompt
        screenStream.getVideoTracks()[0].addEventListener("ended", () => {
          stopRecording();
        });

        // Mix System Audio if present
        if (screenStream.getAudioTracks().length > 0) {
          const sysSource = audioCtx.createMediaStreamSource(
            new MediaStream(screenStream.getAudioTracks())
          );
          sysSource.connect(audioDest);
        }

        // Mix Microphone if requested
        if (includeMic) {
          try {
            const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            micStreamRef.current = micStream;
            const micSource = audioCtx.createMediaStreamSource(micStream);
            micSource.connect(audioDest);

            // Audio level meter
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            micSource.connect(analyser);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const updateMeter = () => {
              if (analyser) {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                const avg = sum / dataArray.length;
                setMicVolume(Math.min(100, Math.round((avg / 255) * 100)));
              }
              if (isRecording) {
                requestAnimationFrame(updateMeter);
              }
            };
            requestAnimationFrame(updateMeter);
          } catch {
            toast.error("Microphone access denied or not found; proceeding without microphone.");
          }
        }

        // If Webcam Picture-in-Picture is enabled, composite via Canvas
        if (enableWebcamPip) {
          try {
            const camStream = await navigator.mediaDevices.getUserMedia({
              video: { width: 480, height: 360 },
            });
            camStreamRef.current = camStream;

            const screenVideo = document.createElement("video");
            screenVideo.srcObject = screenStream;
            screenVideo.muted = true;
            await screenVideo.play();

            const camVideo = document.createElement("video");
            camVideo.srcObject = camStream;
            camVideo.muted = true;
            await camVideo.play();

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d")!;

            const pipWidth = Math.round(width * 0.22);
            const pipHeight = Math.round(pipWidth * 0.75);
            const margin = 24;

            const drawCanvas = () => {
              ctx.drawImage(screenVideo, 0, 0, width, height);

              // Draw Webcam PiP circle/rounded rectangle in bottom-right
              const x = width - pipWidth - margin;
              const y = height - pipHeight - margin;
              ctx.save();
              ctx.fillStyle = "#000000";
              ctx.strokeStyle = "#3b82f6";
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.roundRect(x, y, pipWidth, pipHeight, 16);
              ctx.fill();
              ctx.stroke();
              ctx.clip();
              ctx.drawImage(camVideo, x, y, pipWidth, pipHeight);
              ctx.restore();

              animationFrameRef.current = requestAnimationFrame(drawCanvas);
            };

            animationFrameRef.current = requestAnimationFrame(drawCanvas);
            const canvasStream = canvas.captureStream(fps);

            targetStream = new MediaStream([
              ...canvasStream.getVideoTracks(),
              ...audioDest.stream.getAudioTracks(),
            ]);
          } catch {
            toast.error("Webcam access failed; recording screen only.");
            targetStream = new MediaStream([
              ...screenStream.getVideoTracks(),
              ...audioDest.stream.getAudioTracks(),
            ]);
          }
        } else {
          targetStream = new MediaStream([
            ...screenStream.getVideoTracks(),
            ...audioDest.stream.getAudioTracks(),
          ]);
        }
      }

      // Determine supported MIME
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
        ? "video/webm;codecs=vp8,opus"
        : "video/webm";

      const recorder = new MediaRecorder(targetStream, {
        mimeType,
        videoBitsPerSecond: bitrate,
      });

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        toast.success("Recording ready for preview and download!");
      };

      recorder.start(500); // 500ms chunks
      setIsRecording(true);
      setIsPaused(false);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Screen or camera permission was dismissed.");
      } else {
        setError(err instanceof Error ? err.message : "Recording failed to start.");
      }
    }
  }, [recordingMode, includeMic, includeSystemAudio, enableWebcamPip, qualityPreset, recordedUrl, stopRecording]);

  const handlePauseResume = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      setIsPaused(false);
      toast.info("Recording resumed");
    } else {
      mediaRecorderRef.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPaused(true);
      toast.info("Recording paused");
    }
  };

  const handleDownload = () => {
    if (!recordedBlob) return;
    const a = document.createElement("a");
    a.href = recordedUrl;
    a.download = `recording_${Date.now()}.webm`;
    a.click();
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      {!isRecording && !recordedUrl && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mode Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Monitor className="h-4 w-4 text-primary" /> Capture Source
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRecordingMode("screen")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    recordingMode === "screen"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <Monitor className="h-6 w-6 text-primary mb-2" />
                  <div className="font-semibold text-sm">Screen / Window</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Record full desktop, app window, or browser tab
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRecordingMode("camera")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    recordingMode === "camera"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <Camera className="h-6 w-6 text-primary mb-2" />
                  <div className="font-semibold text-sm">Webcam Only</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Direct camera video feed recording
                  </div>
                </button>
              </div>

              {recordingMode === "screen" && (
                <div className="p-3 bg-muted/40 rounded-lg flex items-center justify-between border">
                  <div className="space-y-0.5">
                    <div className="text-xs font-medium flex items-center gap-1.5">
                      <Camera className="h-3.5 w-3.5 text-primary" /> Webcam Picture-in-Picture
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Overlay facecam bubble in corner of screen recording
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableWebcamPip}
                    onChange={(e) => setEnableWebcamPip(e.target.checked)}
                    className="h-4 w-4 rounded text-primary focus:ring-primary"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audio & Quality Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" /> Audio & Quality Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Audio toggles */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Audio Sources</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIncludeMic(!includeMic)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                      includeMic ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
                    }`}
                  >
                    {includeMic ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    Microphone: {includeMic ? "ON" : "OFF"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIncludeSystemAudio(!includeSystemAudio)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                      includeSystemAudio ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
                    }`}
                  >
                    <Volume2 className="h-4 w-4" />
                    System Audio: {includeSystemAudio ? "ON" : "OFF"}
                  </button>
                </div>
              </div>

              {/* Quality selector */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Recording Quality</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: "1080p60", label: "1080p 60fps" },
                      { id: "1080p30", label: "1080p 30fps" },
                      { id: "720p30", label: "720p 30fps" },
                    ] as const
                  ).map((q) => (
                    <Button
                      key={q.id}
                      type="button"
                      size="sm"
                      variant={qualityPreset === q.id ? "default" : "outline"}
                      className="text-xs h-8"
                      onClick={() => setQualityPreset(q.id)}
                    >
                      {q.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={startRecording}
                size="lg"
                className="w-full gap-2 font-semibold bg-red-600 hover:bg-red-700 text-white"
              >
                <Radio className="h-5 w-5 animate-pulse" /> Start Recording
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recording in Progress Screen */}
      {isRecording && (
        <Card className="border-red-500/50 bg-red-500/5">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <span className="relative flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-600" />
              </span>
              <span className="text-xl font-bold text-red-600 tracking-wider">
                {isPaused ? "RECORDING PAUSED" : "LIVE RECORDING"}
              </span>
            </div>

            <div className="text-5xl font-mono font-bold tracking-tight">
              {formatDuration(duration)}
            </div>

            {/* Mic indicator */}
            {includeMic && (
              <div className="max-w-xs mx-auto space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mic className="h-3.5 w-3.5" /> Mic Input
                  </span>
                  <span>{micVolume}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-75"
                    style={{ width: `${micVolume}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-center pt-2">
              <Button
                onClick={handlePauseResume}
                variant="outline"
                size="lg"
                className="gap-2 min-w-[130px]"
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                {isPaused ? "Resume" : "Pause"}
              </Button>

              <Button
                onClick={stopRecording}
                variant="destructive"
                size="lg"
                className="gap-2 min-w-[130px]"
              >
                <Square className="h-4 w-4 fill-current" /> Stop & Finish
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Finished Recording Preview */}
      {recordedUrl && (
        <Card className="border-green-500/40 bg-green-500/5">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <h4 className="font-semibold text-sm">Recording Completed</h4>
                  <p className="text-xs text-muted-foreground">
                    Duration: {formatDuration(duration)} • Size:{" "}
                    {recordedBlob ? (recordedBlob.size / (1024 * 1024)).toFixed(1) : 0} MB
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleDownload}
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="h-4 w-4" /> Download WebM Video
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setRecordedBlob(null);
                    setRecordedUrl("");
                    setDuration(0);
                  }}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" /> New Recording
                </Button>
              </div>
            </div>

            <video
              ref={previewRef}
              src={recordedUrl}
              controls
              className="w-full rounded-lg border border-border bg-black max-h-[460px] object-contain"
            />
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}