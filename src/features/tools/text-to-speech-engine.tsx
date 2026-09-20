"use client";

import { useState, useCallback, useRef } from "react";
import { Volume2, Play, Pause, Square, Download, Copy, Check, Type, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const VOICES: { id: string; label: string; lang: string }[] = [
  { id: "en-US-female", label: "English (US) - Female", lang: "en-US" },
  { id: "en-US-male", label: "English (US) - Male", lang: "en-US" },
  { id: "en-GB-female", label: "English (UK) - Female", lang: "en-GB" },
  { id: "en-GB-male", label: "English (UK) - Male", lang: "en-GB" },
  { id: "en-AU-female", label: "English (AU) - Female", lang: "en-AU" },
  { id: "es-ES-female", label: "Spanish - Female", lang: "es-ES" },
  { id: "fr-FR-female", label: "French - Female", lang: "fr-FR" },
  { id: "de-DE-female", label: "German - Female", lang: "de-DE" },
  { id: "ja-JP-female", label: "Japanese - Female", lang: "ja-JP" },
  { id: "ko-KR-female", label: "Korean - Female", lang: "ko-KR" },
  { id: "zh-CN-female", label: "Chinese - Female", lang: "zh-CN" },
  { id: "hi-IN-female", label: "Hindi - Female", lang: "hi-IN" },
];

export function TextToSpeechEngine() {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("en-US-female");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const updateStats = useCallback((t: string) => {
    setCharCount(t.length);
    setWordCount(t.trim() ? t.trim().split(/\s+/).length : 0);
  }, []);

  const handleSpeak = useCallback(() => {
    setError("");
    if (!text.trim()) {
      setError("Please enter some text to speak.");
      return;
    }

    if (!("speechSynthesis" in window)) {
      setError("Text-to-speech is not supported in your browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Try to find a matching voice
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = VOICES.find((v) => v.id === voice);
    if (selectedVoice && voices.length > 0) {
      const match = voices.find((v) => v.lang === selectedVoice.lang);
      if (match) utterance.voice = match;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); };
    utterance.onerror = () => { setIsSpeaking(false); setIsPaused(false); };
    utterance.onpause = () => setIsPaused(true);
    utterance.onresume = () => setIsPaused(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [text, voice, rate, pitch, volume]);

  const handlePause = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
    } else {
      window.speechSynthesis.pause();
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const handleDownload = () => {
    // Browser TTS doesn't support direct download, show instructions
    setError("To download as audio file, use a screen recording tool or a dedicated TTS service. Browser TTS is for live playback only.");
    setTimeout(() => setError(""), 5000);
  };

  const selectedVoiceInfo = VOICES.find((v) => v.id === voice);

  return (
    <div className="space-y-6">
      {/* Text input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Text to Speak</Label>
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span>{charCount} chars</span>
            <span>{wordCount} words</span>
            <span>~{Math.ceil(wordCount / 2.5)}s</span>
          </div>
        </div>
        <Textarea
          placeholder="Enter text to convert to speech..."
          className="min-h-[120px]"
          value={text}
          onChange={(e) => { setText(e.target.value); updateStats(e.target.value); }}
          maxLength={5000}
        />
        <div className="flex justify-between">
          <span className="text-[10px] text-muted-foreground">Max 5,000 characters</span>
          {text.length > 4000 && (
            <span className="text-[10px] text-amber-500">{5000 - text.length} characters remaining</span>
          )}
        </div>
      </div>

      {/* Voice selector */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Voice</Label>
        <select
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          {VOICES.map((v) => (
            <option key={v.id} value={v.id}>{v.label}</option>
          ))}
        </select>
        {selectedVoiceInfo && (
          <Badge variant="outline" className="text-[10px] gap-1 mt-1">
            <Languages className="h-3 w-3" /> {selectedVoiceInfo.lang}
          </Badge>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Label className="text-xs">Speed: {rate}x</Label>
          </div>
          <Slider value={[rate]} onValueChange={([v]) => setRate(v)} min={0.25} max={3} step={0.25} />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Label className="text-xs">Pitch: {pitch}</Label>
          </div>
          <Slider value={[pitch]} onValueChange={([v]) => setPitch(v)} min={0.5} max={2} step={0.1} />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Label className="text-xs">Volume: {Math.round(volume * 100)}%</Label>
          </div>
          <Slider value={[volume]} onValueChange={([v]) => setVolume(v)} min={0} max={1} step={0.1} />
        </div>
      </div>

      {/* Playback controls */}
      <div className="flex gap-2">
        {!isSpeaking ? (
          <Button onClick={handleSpeak} className="gap-2 flex-1" disabled={!text.trim()}>
            <Play className="h-4 w-4" /> Speak
          </Button>
        ) : (
          <>
            <Button onClick={handlePause} variant="outline" className="gap-2 flex-1">
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {isPaused ? "Resume" : "Pause"}
            </Button>
            <Button onClick={handleStop} variant="destructive" className="gap-2">
              <Square className="h-4 w-4" /> Stop
            </Button>
          </>
        )}
        <Button variant="outline" size="icon" onClick={handleDownload} title="Download instructions">
          <Download className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="p-3">
            <p className="text-sm text-amber-600 dark:text-amber-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            <strong>Tip:</strong> For best results, use shorter sentences and add punctuation. 
            The browser's built-in speech synthesis is used — voice quality varies by browser and OS.
            Chrome and Edge provide the best voices on Windows and macOS.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}