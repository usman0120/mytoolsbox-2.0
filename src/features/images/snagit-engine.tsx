"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Monitor,
  Download,
  Video,
  Camera,
  StopCircle,
  Play,
  Pause,
  Upload,
  Clock,
  Mic,
  MicOff,
  Sparkles,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function SnagitEngine() {
  const [mode, setMode] = useState<"image" | "video">("image");

  // Image Capture State
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Video Screencast State
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [includeMic, setIncludeMic] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up streams & timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Image capture via getDisplayMedia
  const captureImage = useCallback(async () => {
    setIsCapturing(true);
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        alert("Screen capture is not supported in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(video, 0, 0);

      setCapturedImage(canvas.toDataURL("image/png"));
      stream.getTracks().forEach((track) => track.stop());
      video.remove();
    } catch (err) {
      console.warn("Image capture cancelled:", err);
    } finally {
      setIsCapturing(false);
    }
  }, []);

  const handleUploadImage = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setCapturedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Video recording
  const startRecording = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        alert("Screen recording is not supported in this browser.");
        return;
      }

      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      let combinedStream = displayStream;

      if (includeMic && navigator.mediaDevices.getUserMedia) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          const audioContext = new AudioContext();
          const destination = audioContext.createMediaStreamDestination();

          if (displayStream.getAudioTracks().length > 0) {
            const displaySource = audioContext.createMediaStreamSource(displayStream);
            displaySource.connect(destination);
          }

          const micSource = audioContext.createMediaStreamSource(micStream);
          micSource.connect(destination);

          combinedStream = new MediaStream([
            ...displayStream.getVideoTracks(),
            ...destination.stream.getAudioTracks(),
          ]);
        } catch {
          console.warn("Microphone not available, recording system screen only.");
        }
      }

      streamRef.current = displayStream;

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "";

      const recorder = new MediaRecorder(combinedStream, mimeType ? { mimeType } : {});
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setRecordedVideoUrl(URL.createObjectURL(blob));
        displayStream.getTracks().forEach((track) => track.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRecording(false);
        setIsPaused(false);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000);
      setIsRecording(true);
      setIsPaused(false);
      setRecordSeconds(0);

      // Listen for browser user clicking "Stop sharing" chrome banner
      displayStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.warn("Screen recording start cancelled or failed:", err);
    }
  }, [includeMic]);

  const pauseResumeRecording = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleDownloadImage = () => {
    if (!capturedImage) return;
    const a = document.createElement("a");
    a.href = capturedImage;
    a.download = `snagit-screen-${Date.now()}.png`;
    a.click();
  };

  const handleDownloadVideo = () => {
    if (!recordedVideoUrl) return;
    const a = document.createElement("a");
    a.href = recordedVideoUrl;
    a.download = `snagit-recording-${Date.now()}.webm`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <Tabs
        value={mode}
        onValueChange={(v) => {
          setMode(v as "image" | "video");
        }}
      >
        <TabsList className="grid w-full grid-cols-2 p-1 rounded-2xl bg-muted">
          <TabsTrigger value="image" className="gap-2 rounded-xl">
            <Camera className="h-4 w-4" /> Snapshot Capture
          </TabsTrigger>
          <TabsTrigger value="video" className="gap-2 rounded-xl">
            <Video className="h-4 w-4" /> Screen & Audio Recorder
          </TabsTrigger>
        </TabsList>

        {/* Snapshot Capture Tab */}
        <TabsContent value="image" className="space-y-4 mt-4">
          {!capturedImage && (
            <div className="border-2 border-dashed rounded-2xl p-10 text-center border-muted-foreground/25 space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                <Camera className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-lg">High-Definition Screen Capture</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Snap any application, browser window, or entire multi-monitor desktop in pixel-perfect resolution.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  onClick={captureImage}
                  disabled={isCapturing}
                  size="lg"
                  className="rounded-xl gap-2 shadow-xs"
                >
                  <Camera className="h-5 w-5" />
                  {isCapturing ? "Select screen to snap..." : "Capture Screen / Window"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl gap-2 shadow-xs"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-5 w-5" />
                  Import Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUploadImage(e.target.files[0])}
                />
              </div>
            </div>
          )}

          {capturedImage && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 p-3 bg-card border rounded-2xl">
                <span className="text-xs font-medium text-muted-foreground">
                  Snapshot Captured Successfully
                </span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleDownloadImage} className="rounded-xl gap-1.5">
                    <Download className="h-4 w-4" /> Download PNG
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCapturedImage(null)}
                    className="rounded-xl"
                  >
                    Take Another
                  </Button>
                </div>
              </div>

              <div className="border rounded-2xl overflow-hidden bg-dot-pattern flex items-center justify-center p-4 max-h-[640px]">
                <img
                  src={capturedImage}
                  alt="Captured snapshot"
                  className="max-h-[580px] w-auto max-w-full object-contain rounded-lg shadow-md"
                />
              </div>
            </div>
          )}
        </TabsContent>

        {/* Video Screencast Tab */}
        <TabsContent value="video" className="space-y-4 mt-4">
          {!recordedVideoUrl && !isRecording && (
            <div className="border-2 border-dashed rounded-2xl p-10 text-center border-muted-foreground/25 space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                <Video className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-lg">Screen & Microphone Video Recording</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Record video presentations, quick software demos, and troubleshooting bug walk-throughs with optional microphone voice-over.
              </p>

              <div className="flex items-center justify-center gap-3 pt-2">
                <div className="flex items-center gap-2 p-2 border rounded-xl bg-card">
                  {includeMic ? (
                    <Mic className="h-4 w-4 text-primary" />
                  ) : (
                    <MicOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Label htmlFor="mic-toggle" className="text-xs font-medium cursor-pointer">
                    Record Microphone Audio
                  </Label>
                  <Switch id="mic-toggle" checked={includeMic} onCheckedChange={setIncludeMic} />
                </div>
              </div>

              <div className="pt-2">
                <Button onClick={startRecording} size="lg" className="rounded-xl gap-2 shadow-xs">
                  <Play className="h-5 w-5" /> Start Screen Recording
                </Button>
              </div>
            </div>
          )}

          {isRecording && (
            <div className="border-2 border-red-500/80 bg-red-500/5 rounded-2xl p-8 text-center space-y-4 animate-in fade-in">
              <div className="flex items-center justify-center gap-2 text-red-500">
                <div className="h-3 w-3 bg-red-500 rounded-full animate-ping" />
                <span className="font-semibold text-sm tracking-wider uppercase">Recording Live</span>
              </div>

              <div className="text-4xl font-mono font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
                <Clock className="h-6 w-6 text-muted-foreground" />
                {formatTime(recordSeconds)}
              </div>

              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Your screen and audio are actively streaming to an in-memory buffer.
              </p>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  onClick={pauseResumeRecording}
                  variant="outline"
                  className="rounded-xl gap-2"
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  {isPaused ? "Resume" : "Pause"}
                </Button>
                <Button
                  onClick={stopRecording}
                  variant="destructive"
                  className="rounded-xl gap-2"
                >
                  <StopCircle className="h-4 w-4" /> Finish & Save Video
                </Button>
              </div>
            </div>
          )}

          {recordedVideoUrl && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 p-3 bg-card border rounded-2xl">
                <span className="text-xs font-medium text-muted-foreground">
                  Recording Ready ({formatTime(recordSeconds)})
                </span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleDownloadVideo} className="rounded-xl gap-1.5">
                    <Download className="h-4 w-4" /> Download WebM
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRecordedVideoUrl(null);
                      setRecordSeconds(0);
                    }}
                    className="rounded-xl"
                  >
                    Record New Video
                  </Button>
                </div>
              </div>

              <div className="border rounded-2xl overflow-hidden bg-black flex items-center justify-center max-h-[580px]">
                <video
                  src={recordedVideoUrl}
                  controls
                  autoPlay
                  className="w-full max-h-[540px] rounded-lg"
                />
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}