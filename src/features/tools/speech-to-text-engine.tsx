"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Mic,
  MicOff,
  Copy,
  CheckCircle2,
  Trash2,
  Download,
  Volume2,
  Globe,
  Radio,
} from "lucide-react";

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string; confidence: number };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

const LANGUAGES = [
  { code: "en-US", label: "English (United States)" },
  { code: "en-GB", label: "English (United Kingdom)" },
  { code: "es-ES", label: "Spanish (Spain)" },
  { code: "es-MX", label: "Spanish (Mexico)" },
  { code: "fr-FR", label: "French (France)" },
  { code: "de-DE", label: "German (Germany)" },
  { code: "zh-CN", label: "Chinese (Mandarin Simplified)" },
  { code: "ja-JP", label: "Japanese" },
  { code: "ar-SA", label: "Arabic (Saudi Arabia)" },
  { code: "ur-PK", label: "Urdu (Pakistan)" },
  { code: "hi-IN", label: "Hindi (India)" },
  { code: "pt-BR", label: "Portuguese (Brazil)" },
];

export function SpeechToTextEngine() {
  const [text, setText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en-US");
  const [isSupported, setIsSupported] = useState(true);
  const [copied, setCopied] = useState(false);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    // Check Web Speech API support
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SpeechClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechClass) {
      setIsSupported(false);
    }
  }, []);

  const startListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SpeechClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechClass) {
      toast.error("Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    try {
      const recognition = new SpeechClass() as ISpeechRecognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLang;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        let finalChunk = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const transcript = res[0].transcript;
          if (res.isFinal) {
            finalChunk += transcript + " ";
          } else {
            interim += transcript;
          }
        }

        if (finalChunk) {
          setText((prev) => (prev ? prev + " " + finalChunk.trim() : finalChunk.trim()));
          setInterimText("");
        } else {
          setInterimText(interim);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === "no-speech") return;
        toast.error(`Recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText("");
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      toast.success("Microphone listening... Speak clearly.");
    } catch (err) {
      toast.error("Could not start microphone listener. Check browser permissions.");
      setIsListening(false);
    }
  }, [selectedLang]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText("");
    toast.info("Microphone stopped.");
  }, []);

  const handleCopy = useCallback(async () => {
    const full = (text + (interimText ? " " + interimText : "")).trim();
    if (!full) return;
    await navigator.clipboard.writeText(full);
    setCopied(true);
    toast.success("Transcript copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }, [text, interimText]);

  const handleDownload = () => {
    const full = (text + (interimText ? " " + interimText : "")).trim();
    if (!full) return;
    const blob = new Blob([full], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded transcript!");
  };

  const handleClear = () => {
    setText("");
    setInterimText("");
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div className="space-y-6">
      {/* Control Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-muted/40 rounded-xl border">
        <div className="flex items-center gap-3">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <div className="w-56">
            <Select
              value={selectedLang}
              onValueChange={(v) => {
                if (isListening) stopListening();
                setSelectedLang(v || "en-US");
              }}
            >
              <SelectTrigger className="h-8 text-xs bg-background">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code} className="text-xs">
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isListening ? (
            <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 gap-1.5 animate-pulse text-xs">
              <Radio className="h-3 w-3 text-rose-500" /> Live Dictation Active
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Ready to Dictate
            </Badge>
          )}
        </div>
      </div>

      {!isSupported && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-700 dark:text-amber-300">
          ⚠️ Note: Direct browser speech recognition is supported in Google Chrome, Microsoft Edge, and Safari.
        </div>
      )}

      {/* Main Microphone Button & Waveform Box */}
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl border bg-card shadow-xs text-center space-y-4">
        <div className="relative">
          {isListening && (
            <span className="absolute -inset-2 rounded-full bg-rose-500/20 animate-ping" />
          )}
          <Button
            onClick={isListening ? stopListening : startListening}
            size="lg"
            variant={isListening ? "destructive" : "default"}
            className="rounded-full h-20 w-20 shadow-md relative z-10 transition-transform active:scale-95"
          >
            {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
          </Button>
        </div>

        <div>
          <h3 className="font-semibold text-base">
            {isListening ? "Listening to your voice..." : "Click to Start Speaking"}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {isListening
              ? "Speak into your microphone. Transcribed words will stream in real-time."
              : "Continuous speech-to-text dictation with automatic sentence punctuation."}
          </p>
        </div>

        {isListening && (
          <div className="flex items-center gap-1 h-6">
            <span className="w-1 h-3 bg-rose-500 rounded-full animate-pulse" />
            <span className="w-1 h-6 bg-rose-500 rounded-full animate-pulse delay-75" />
            <span className="w-1 h-4 bg-rose-500 rounded-full animate-pulse delay-150" />
            <span className="w-1 h-8 bg-rose-500 rounded-full animate-pulse delay-100" />
            <span className="w-1 h-5 bg-rose-500 rounded-full animate-pulse delay-200" />
          </div>
        )}
      </div>

      {/* Live Transcript Card */}
      <div className="rounded-xl border bg-card p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Real-Time Transcription</span>
            <span className="text-xs text-muted-foreground font-mono ml-2">
              {wordCount} words • {charCount} characters
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              disabled={!text && !interimText}
              className="gap-1 h-8 text-xs"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!text && !interimText}
              className="gap-1 h-8 text-xs"
            >
              <Download className="h-3.5 w-3.5" /> Download .txt
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!text && !interimText}
              className="gap-1 h-8 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </Button>
          </div>
        </div>

        <Textarea
          value={text + (interimText ? (text ? " " : "") + interimText : "")}
          onChange={(e) => setText(e.target.value)}
          placeholder="Your speech transcript will be typed here live as you speak..."
          className="min-h-52 font-mono text-sm leading-relaxed resize-y bg-muted/20"
        />
        {interimText && (
          <p className="text-xs text-primary font-mono animate-pulse">
            Listening: &ldquo;{interimText}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}