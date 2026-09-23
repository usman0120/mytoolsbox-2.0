"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Volume2, Play, Pause, Square, Download, Copy, Check,
  Type, Languages, Sparkles, RefreshCw, FileAudio, Sliders,
  BookOpen, Headphones, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { synthesizeSpeechWav } from "@/lib/processing/client/audio-processor";

const SAMPLE_SCRIPTS = [
  {
    label: "Podcast Intro",
    text: "Welcome back to the Deep Dive Podcast! In today's episode, we're exploring breakthrough innovations in artificial intelligence and browser technology.",
  },
  {
    label: "Customer Support",
    text: "Thank you for calling customer care. Your call is very important to us. Please hold while we connect you to the next available representative.",
  },
  {
    label: "Meditation",
    text: "Take a deep breath in through your nose, hold for a moment, and gently exhale. Allow yourself to feel grounded, calm, and completely relaxed.",
  },
  {
    label: "Product Announcement",
    text: "We are thrilled to announce our next-generation suite of high-performance tools, designed to simplify workflows and boost your daily productivity.",
  },
];

export function TextToSpeechEngine() {
  const [text, setText] = useState(
    "Welcome to MyToolsBox! Convert any text into spoken audio with natural voices, real-time word highlighting, and instant audio download."
  );
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>("");
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false);
  const [error, setError] = useState("");

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available system voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        // Default to English voice if available
        const defaultVoice =
          voices.find((v) => v.lang.startsWith("en") && v.name.includes("Natural")) ||
          voices.find((v) => v.lang.startsWith("en")) ||
          voices[0];
        if (defaultVoice && !selectedVoiceUri) {
          setSelectedVoiceUri(defaultVoice.voiceURI);
        }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedVoiceUri]);

  const words = text.trim() ? text.trim().split(/\s+/) : [];

  const handleSpeak = useCallback(() => {
    setError("");
    if (!text.trim()) {
      setError("Please enter some text to speak.");
      return;
    }

    if (!("speechSynthesis" in window)) {
      setError("Speech synthesis is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    if (selectedVoiceUri) {
      const match = availableVoices.find((v) => v.voiceURI === selectedVoiceUri);
      if (match) utterance.voice = match;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setActiveWordIndex(0);
    };

    utterance.onboundary = (e) => {
      if (e.name === "word") {
        // Calculate word index from charIndex
        const charIdx = e.charIndex;
        let runningLength = 0;
        for (let i = 0; i < words.length; i++) {
          runningLength += words[i].length + 1;
          if (runningLength > charIdx) {
            setActiveWordIndex(i);
            break;
          }
        }
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveWordIndex(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveWordIndex(null);
    };

    utterance.onpause = () => setIsPaused(true);
    utterance.onresume = () => setIsPaused(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    toast.success("Playing speech audio");
  }, [text, rate, pitch, volume, selectedVoiceUri, availableVoices, words]);

  const handlePauseResume = () => {
    if (!("speechSynthesis" in window)) return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveWordIndex(null);
  };

  const handleGenerateDownload = () => {
    if (!text.trim()) {
      setError("Please enter some text to synthesize.");
      return;
    }

    setIsGeneratingDownload(true);
    setError("");

    try {
      const wav = synthesizeSpeechWav(text, { rate, pitch });
      setDownloadBlob(wav);
      const url = URL.createObjectURL(wav);
      setDownloadUrl(url);
      toast.success("Audio file generated and ready for download!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to generate audio file";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsGeneratingDownload(false);
    }
  };

  const selectedVoiceObj = availableVoices.find((v) => v.voiceURI === selectedVoiceUri);

  return (
    <div className="space-y-6">
      <Badge variant="outline" className="gap-1.5">
        <Volume2 className="h-3.5 w-3.5" /> Text to Speech & Audio Generator
      </Badge>

      {/* Sample Templates */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-muted-foreground whitespace-nowrap flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-primary" /> Presets:
        </span>
        {SAMPLE_SCRIPTS.map((s) => (
          <Button
            key={s.label}
            size="sm"
            variant="outline"
            className="h-7 text-xs whitespace-nowrap"
            onClick={() => setText(s.text)}
          >
            {s.label}
          </Button>
        ))}
      </div>

      {/* Main Textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <Label className="font-medium">Text to Synthesize</Label>
          <div className="flex gap-3 text-muted-foreground font-mono">
            <span>{text.length} characters</span>
            <span>{words.length} words</span>
            <span>~{Math.max(1, Math.round(words.length / (2.5 * rate)))}s</span>
          </div>
        </div>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to speak or download as audio..."
          className="min-h-[140px] text-sm leading-relaxed"
          maxLength={10000}
        />
      </div>

      {/* Real-time Word Highlighting Reader */}
      {isSpeaking && words.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-primary mb-2 flex items-center gap-1.5">
              <Headphones className="h-3.5 w-3.5" /> Live Word Tracking:
            </div>
            <div className="text-sm leading-relaxed flex flex-wrap gap-1">
              {words.map((w, idx) => (
                <span
                  key={idx}
                  className={`px-1 rounded transition-all duration-100 ${
                    idx === activeWordIndex
                      ? "bg-primary text-primary-foreground font-bold shadow-sm scale-105"
                      : "text-foreground"
                  }`}
                >
                  {w}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voice and Audio Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Languages className="h-4 w-4 text-primary" /> Voice Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <select
              value={selectedVoiceUri}
              onChange={(e) => setSelectedVoiceUri(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-1 focus:ring-primary"
            >
              {availableVoices.length > 0 ? (
                availableVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))
              ) : (
                <option value="">Default Browser Voice</option>
              )}
            </select>
            {selectedVoiceObj && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-[10px]">
                  {selectedVoiceObj.lang}
                </Badge>
                <span className="truncate">{selectedVoiceObj.name}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" /> Speech Dynamics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span>Speed / Rate</span>
                <span>{rate}x</span>
              </div>
              <Slider
                value={[rate]}
                min={0.5}
                max={2.0}
                step={0.1}
                onValueChange={(v) => setRate(Array.isArray(v) ? v[0] : v)}
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span>Pitch</span>
                <span>{pitch}x</span>
              </div>
              <Slider
                value={[pitch]}
                min={0.5}
                max={1.8}
                step={0.1}
                onValueChange={(v) => setPitch(Array.isArray(v) ? v[0] : v)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Live Playback */}
        <div className="flex gap-2">
          {!isSpeaking ? (
            <Button
              onClick={handleSpeak}
              className="gap-2 flex-1 font-semibold"
              disabled={!text.trim()}
              size="lg"
            >
              <Play className="h-4 w-4" /> Listen to Speech
            </Button>
          ) : (
            <>
              <Button
                onClick={handlePauseResume}
                variant="outline"
                className="gap-2 flex-1"
                size="lg"
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                {isPaused ? "Resume" : "Pause"}
              </Button>
              <Button
                onClick={handleStop}
                variant="destructive"
                className="gap-2"
                size="lg"
              >
                <Square className="h-4 w-4" /> Stop
              </Button>
            </>
          )}
        </div>

        {/* Generate Download */}
        <Button
          onClick={handleGenerateDownload}
          variant="outline"
          className="gap-2 font-semibold border-primary/30 hover:border-primary text-primary"
          disabled={isGeneratingDownload || !text.trim()}
          size="lg"
        >
          {isGeneratingDownload ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" /> Synthesizing Audio...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" /> Export as Audio File (.WAV)
            </>
          )}
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-3">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Generated Audio Download Card */}
      {downloadUrl && (
        <Card className="border-green-500/40 bg-green-500/5">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <h4 className="font-semibold text-sm">Spoken Audio File Ready</h4>
                  <p className="text-xs text-muted-foreground">
                    16-bit PCM WAV • {downloadBlob ? `${(downloadBlob.size / 1024).toFixed(1)} KB` : ""}
                  </p>
                </div>
              </div>
              <Button
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = downloadUrl;
                  a.download = `speech_${Date.now()}.wav`;
                  a.click();
                }}
              >
                <Download className="h-4 w-4" /> Download .WAV Audio
              </Button>
            </div>

            <audio src={downloadUrl} controls className="w-full" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}