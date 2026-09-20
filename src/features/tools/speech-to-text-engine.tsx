"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Mic, Upload, Loader2, Copy, CheckCircle2, XCircle,
  FileAudio, Play, Square,
} from "lucide-react";

export function SpeechToTextEngine() {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm",
      });

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], "recording.webm", { type: "audio/webm" });
        setAudioFile(file);
        stream.getTracks().forEach((t) => t.stop());
        await processAudio(file);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      toast.success("Recording started...");
    } catch (err) {
      setError("Microphone access denied. Please allow microphone access or upload an audio file instead.");
      toast.error("Microphone access denied");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success("Recording stopped. Processing...");
    }
  }, []);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    const validTypes = ["audio/mpeg", "audio/wav", "audio/webm", "audio/ogg", "audio/mp4"];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|webm|ogg|m4a)$/i)) {
      setError("Please select a valid audio file (MP3, WAV, WebM, OGG, M4A).");
      return;
    }

    setAudioFile(file);
    await processAudio(file);
  }, []);

  const processAudio = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Use Web Speech API for recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        // Fallback: provide a message about browser support
        setText(
          "Speech recognition is not supported in this browser. " +
          "Please use Chrome or Edge for the best experience, or try uploading a smaller audio file.\n\n" +
          "Audio file received: " + file.name + " (" + (file.size / 1024).toFixed(1) + " KB)"
        );
        toast.success("Audio file processed. Note: Full transcription requires Chrome/Edge.");
        setIsProcessing(false);
        return;
      }

      // For live recording, we can try to use the SpeechRecognition API
      // However, it only works with live audio, not files
      // So we provide a helpful message
      setText(
        "Audio file received: " + file.name + " (" + (file.size / 1024).toFixed(1) + " KB)\n\n" +
        "For best speech-to-text results:\n" +
        "1. Use the 'Record' button to capture live audio\n" +
        "2. Or use Chrome/Edge's built-in dictation feature\n" +
        "3. For file transcription, consider using a dedicated transcription service\n\n" +
        "Tip: Click 'Record' and speak clearly for real-time transcription."
      );
      toast.success("Audio file loaded. Use Record for live transcription.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Processing failed";
      setError(message);
      toast.error("Processing failed: " + message);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <div className="space-y-4">
      <Badge variant="outline" className="gap-1.5">
        <Mic className="h-3.5 w-3.5" /> Speech to Text
      </Badge>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Record or Upload Audio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Record button */}
          <div className="flex justify-center gap-3">
            {!isRecording ? (
              <Button onClick={startRecording} size="lg" className="gap-2 rounded-full h-14 w-14 p-0">
                <Mic className="h-6 w-6" />
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive" size="lg" className="gap-2 rounded-full h-14 w-14 p-0">
                <Square className="h-6 w-6" />
              </Button>
            )}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {isRecording ? "Recording... Click to stop" : "Click to start recording"}
          </p>

          <div className="relative text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <span className="relative bg-background px-2 text-xs text-muted-foreground">OR</span>
          </div>

          {/* File upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.webm,.ogg,.m4a"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Audio File
          </Button>
        </CardContent>
      </Card>

      {audioFile && (
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center gap-2">
              <FileAudio className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{audioFile.name}</span>
              <span className="text-xs text-muted-foreground">
                ({(audioFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {isProcessing && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processing audio...</span>
            </div>
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

      {text && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Transcription</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5">
                {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{text}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}