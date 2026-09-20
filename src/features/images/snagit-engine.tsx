"use client";

import { useState, useRef, useCallback } from "react";
import { Monitor, Download, Video, Camera, Image, StopCircle, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SnagitEngine() {
  const [mode, setMode] = useState<"image" | "video">("image");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const captureImage = useCallback(async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: "screen" } as MediaTrackConstraints,
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
      console.error("Capture failed:", err);
    } finally {
      setIsCapturing(false);
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: "screen" } as MediaTrackConstraints,
        audio: true,
      });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : "video/webm",
      });

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setRecordedVideo(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Recording failed:", err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const handleDownloadImage = () => {
    if (!capturedImage) return;
    const link = document.createElement("a");
    link.download = `snagit-capture-${Date.now()}.png`;
    link.href = capturedImage;
    link.click();
  };

  const handleDownloadVideo = () => {
    if (!recordedVideo) return;
    const link = document.createElement("a");
    link.download = `snagit-recording-${Date.now()}.webm`;
    link.href = recordedVideo;
    link.click();
  };

  const handleReset = () => {
    setCapturedImage(null);
    setRecordedVideo(null);
  };

  return (
    <div className="space-y-4">
      <Tabs value={mode} onValueChange={(v) => { setMode(v as "image" | "video"); handleReset(); }}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="image" className="gap-2">
            <Camera className="h-4 w-4" /> Image Capture
          </TabsTrigger>
          <TabsTrigger value="video" className="gap-2">
            <Video className="h-4 w-4" /> Video Record
          </TabsTrigger>
        </TabsList>

        <TabsContent value="image" className="space-y-4 mt-4">
          {!capturedImage && (
            <div className="border-2 border-dashed rounded-xl p-8 text-center">
              <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium text-lg mb-2">Capture Your Screen</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Capture scrolling pages, panoramic views, or selected regions.
              </p>
              <Button onClick={captureImage} disabled={isCapturing} size="lg" className="gap-2">
                <Camera className="h-5 w-5" />
                {isCapturing ? "Select area to capture..." : "Capture Screen"}
              </Button>
            </div>
          )}

          {capturedImage && (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden bg-muted/30">
                <img src={capturedImage} alt="Captured" className="w-full h-auto max-h-125 object-contain" />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleDownloadImage} className="gap-2">
                  <Download className="h-4 w-4" /> Download PNG
                </Button>
                <Button variant="outline" onClick={handleReset}>New Capture</Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="video" className="space-y-4 mt-4">
          {!recordedVideo && !isRecording && (
            <div className="border-2 border-dashed rounded-xl p-8 text-center">
              <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium text-lg mb-2">Record Your Screen</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Record screen, window, or tab with optional audio. Create tutorials and guides.
              </p>
              <Button onClick={startRecording} size="lg" className="gap-2">
                <Play className="h-5 w-5" /> Start Recording
              </Button>
            </div>
          )}

          {isRecording && (
            <div className="border-2 border-red-500 rounded-xl p-8 text-center animate-pulse">
              <div className="h-4 w-4 bg-red-500 rounded-full mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2 text-red-600">Recording...</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your screen is being recorded. Click stop when done.
              </p>
              <Button onClick={stopRecording} variant="destructive" size="lg" className="gap-2">
                <StopCircle className="h-5 w-5" /> Stop Recording
              </Button>
            </div>
          )}

          {recordedVideo && (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden bg-black">
                <video src={recordedVideo} controls className="w-full max-h-125" />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleDownloadVideo} className="gap-2">
                  <Download className="h-4 w-4" /> Download WebM
                </Button>
                <Button variant="outline" onClick={handleReset}>New Recording</Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}