"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Square,
  Mic,
  MicOff,
  Sparkles,
  Zap,
  ChevronDown,
  Trash2,
  Code,
  Lightbulb,
  CheckSquare,
  ArrowUp,
  Bug,
  ListOrdered,
  FileText,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { getProviderConfig } from "@/lib/ai/providers-config";
import { UI_COPY } from "@/lib/ui-copy";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSend: () => void;
  onStop?: () => void;
  onClear?: () => void;
  placeholder?: string;
  disabled?: boolean;
  selectedProvider?: string;
  onProviderChange?: (provider: string) => void;
  availableProviders?: string[];
}

const QUICK_ACTIONS = [
  { label: "Refactor Code", prefix: "Please review and refactor the following code following clean code and SOLID principles:\n\n```\n\n```", icon: Code },
  { label: "Fix Bug", prefix: "Explain the bug and provide the fix for: ", icon: Bug },
  { label: "Explain Step-by-Step", prefix: "Explain how this works step-by-step in simple terms: ", icon: Lightbulb },
  { label: "Executive Summary", prefix: "Summarize the key points, core takeaways, and action items from: ", icon: FileText },
  { label: "Generate Unit Tests", prefix: "Write comprehensive unit tests with edge cases for: ", icon: CheckSquare },
];

const SLASH_COMMANDS = [
  { cmd: "/code", label: "Refactor Code", desc: "Clean up, optimize, and refactor code", prefix: "Please review and refactor the following code following clean code and SOLID principles:\n\n```\n\n```", icon: Code },
  { cmd: "/debug", label: "Debug Error", desc: "Identify root cause and provide fix", prefix: "Analyze this bug/error message, identify root cause, and provide the fix:\n\n", icon: Bug },
  { cmd: "/explain", label: "Explain Step-by-Step", desc: "Break down complex concepts simply", prefix: "Explain how this works step-by-step in intuitive and practical terms: ", icon: Lightbulb },
  { cmd: "/summary", label: "Executive Summary", desc: "Key takeaways and action points", prefix: "Provide an executive summary of the following, highlighting core takeaways and action items:\n\n", icon: FileText },
  { cmd: "/test", label: "Generate Unit Tests", desc: "Write comprehensive unit test cases", prefix: "Write comprehensive unit tests with edge cases and mocks for:\n\n```\n\n```", icon: CheckSquare },
  { cmd: "/steps", label: "Step-by-Step Guide", desc: "Create an actionable implementation guide", prefix: "Create a detailed, step-by-step implementation guide for: ", icon: ListOrdered },
];

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResultList {
  [index: number]: {
    [index: number]: SpeechRecognitionResultItem;
  };
  length: number;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

export function ChatInput({
  input,
  setInput,
  isLoading,
  onSend,
  onStop,
  onClear,
  placeholder,
  disabled = false,
  selectedProvider = "gemini",
  onProviderChange,
  availableProviders,
}: ChatInputProps) {
  const { t } = UI_COPY;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [slashMenuDismissed, setSlashMenuDismissed] = useState(false);
  const [fetchedProviders, setFetchedProviders] = useState<string[]>([]);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  // Auto-fetch available providers only if not provided by parent
  useEffect(() => {
    if (availableProviders !== undefined) {
      return;
    }

    let cancelled = false;
    fetch("/api/ai")
      .then((res) => { if (!res.ok) throw new Error("Provider status unavailable"); return res.json(); })
      .then((data) => {
        if (!cancelled && Array.isArray(data.providers)) {
          setFetchedProviders(data.providers);
        }
      })
      .catch(() => {
        if (!cancelled) setFetchedProviders([]);
      });

    return () => {
      cancelled = true;
    };
  }, [availableProviders]);

  useEffect(() => () => {
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.stop();
    }
  }, []);

  useEffect(() => {
    if (isLoading) recognitionRef.current?.stop();
  }, [isLoading]);

  // Auto-resize textarea as input grows smoothly up to 180px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 40), 180)}px`;
    }
  }, [input]);

  // Derive slash menu visibility without cascading effect updates
  const isSlashTrigger = input.startsWith("/") && !input.includes(" ") && input.length <= 15;
  const slashMenuOpen = isSlashTrigger && !slashMenuDismissed;

  const filteredSlashCommands = SLASH_COMMANDS.filter((sc) =>
    sc.cmd.toLowerCase().startsWith(input.toLowerCase().trim())
  );

  const applySlashCommand = useCallback((prefix: string) => {
    setInput(prefix);
    setSlashMenuDismissed(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  }, [setInput]);

  // Keyboard shortcut: Enter to send, Shift+Enter for new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Escape") {
      if (slashMenuOpen) { e.preventDefault(); e.stopPropagation(); }
      setSlashMenuDismissed(true);
      return;
    }

    if (slashMenuOpen && (e.key === "Enter" || e.key === "Tab") && filteredSlashCommands.length > 0) {
      e.preventDefault();
      applySlashCommand(filteredSlashCommands[0].prefix);
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim() && !disabled) {
        onSend();
      }
    }
  };

  // Speech Recognition (Voice Dictation)
  const toggleSpeechRecognition = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = document.documentElement.lang || navigator.language;
      const initialInput = input;

      recognition.onstart = () => {
        setIsRecording(true);
        toast.info("Listening... Speak now");
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = "";
        for (let resultIndex = 0; resultIndex < event.results.length; resultIndex++) {
          transcript += event.results[resultIndex][0].transcript;
        }
        if (transcript) {
          setInput(initialInput ? `${initialInput} ${transcript}` : transcript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error !== "no-speech") {
          toast.error(`Speech recognition error: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      toast.error("Failed to start speech recognition");
      setIsRecording(false);
    }
  };

  // Dynamic Provider List & Display
  const effectiveProviders = availableProviders ?? fetchedProviders;

  const getActiveProviderLabel = () => {
    if (selectedProvider === "auto") return "Auto Router";
    const cfg = getProviderConfig(selectedProvider);
    return cfg.modelLabel;
  };

  const dynamicPlaceholder = placeholder || t("contact_message", "Message");

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;

  return (
    <div className="p-2 sm:p-3 max-w-4xl mx-auto w-full relative shrink-0">
      {/* Floating Slash Command Autocomplete Menu */}
      {slashMenuOpen && filteredSlashCommands.length > 0 && (
        <div className="absolute bottom-full mb-2 left-2 right-2 max-w-lg max-h-64 overflow-y-auto z-50 rounded-lg border border-border bg-popover p-1.5 shadow-md">
          <div className="px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            <span>Prompt starters</span>
          </div>
          <div className="space-y-0.5">
            {filteredSlashCommands.map((sc) => {
              const Icon = sc.icon;
              return (
                <button
                  key={sc.cmd}
                  type="button"
                  onClick={() => applySlashCommand(sc.prefix)}
                  className="w-full min-h-11 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm hover:bg-accent group cursor-pointer"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground font-mono">{sc.cmd}</span>
                      <span className="text-muted-foreground text-[11px]">— {sc.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground/80 truncate">{sc.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Modern Multi-line AI Capsule Container (Gemini / Claude style) */}
      <div className="relative flex flex-col bg-background text-foreground rounded-lg border border-input p-2 focus-within:ring-2 focus-within:ring-ring">
        
        {/* Top: Full-Width Clean Textarea (Zero scrollbar clipping into buttons) */}
        <div className="w-full px-2 pt-1">
          <textarea
            ref={textareaRef}
            aria-label={t("contact_message", "Message")}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setSlashMenuDismissed(false);
            }}
            onKeyDown={handleKeyDown}
            placeholder={dynamicPlaceholder}
            disabled={disabled || isLoading}
            rows={1}
            className="w-full resize-none bg-transparent py-1 text-base text-foreground placeholder:text-muted-foreground focus:outline-none max-h-48 leading-relaxed overflow-y-auto"
          />
        </div>

        {/* Bottom Toolbar Row */}
        <div className="flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-border mt-0.5">
          {/* Left Actions: Plus Menu & Clear */}
          <div className="flex items-center gap-1 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={isLoading || disabled}
                aria-label="Prompt starters"
                className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground shrink-0 cursor-pointer disabled:opacity-50"
                title="Prompt starters"
              >
                <Plus className="h-4.5 w-4.5" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="w-64 max-h-80 overflow-y-auto rounded-lg p-1.5 text-sm">
                <div className="px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                  Quick Prompt Starters
                </div>
                {QUICK_ACTIONS.map((action) => {
                  const ActionIcon = action.icon;
                  return (
                    <DropdownMenuItem
                      key={action.label}
                      onClick={() => {
                        setInput(action.prefix);
                        textareaRef.current?.focus();
                      }}
                      className="gap-2 cursor-pointer rounded-md p-2"
                    >
                      <ActionIcon className="h-3.5 w-3.5 text-primary" />
                      <span>{action.label}</span>
                    </DropdownMenuItem>
                  );
                })}

              </DropdownMenuContent>
            </DropdownMenu>

            {/* Quick Clear Input button */}
            {input && onClear && (
              <button
                type="button"
                onClick={onClear}
                disabled={isLoading || disabled}
                aria-label="Clear input"
                className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-destructive cursor-pointer disabled:opacity-50"
                title="Clear input"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Right Actions: Word Count, Dynamic Model Selector, Dictation, Send/Stop */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Live Word Count Indicator */}
            {wordCount > 0 && (
              <span className="hidden sm:inline-block text-xs text-muted-foreground select-none mr-0.5">
                {wordCount} {wordCount === 1 ? "word" : "words"}
              </span>
            )}

            {/* DYNAMIC MODEL SELECTOR DROPDOWN (No small toggle button!) */}
            {onProviderChange && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  disabled={isLoading || disabled}
                  aria-label="Select AI provider"
                  className="flex h-11 items-center gap-1 px-2 rounded-md hover:bg-accent text-xs font-medium text-foreground cursor-pointer disabled:opacity-50"
                  title="Select AI provider"
                >
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="truncate max-w-24 sm:max-w-32">{getActiveProviderLabel()}</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-64 rounded-lg p-1.5 text-sm">
                  {/* Auto Router Option */}
                  <DropdownMenuItem
                    onClick={() => {
                      onProviderChange("auto");
                    }}
                    className={`gap-2.5 cursor-pointer rounded-md p-2.5 ${
                      selectedProvider === "auto" ? "bg-accent font-semibold" : ""
                    }`}
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">Auto Router</span>
                        {selectedProvider === "auto" && <Check className="h-3.5 w-3.5 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground">Server-selected provider</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                    Configured AI Providers
                  </div>

                  {/* Dynamically Map Over Configured Providers */}
                  {effectiveProviders.map((pId) => {
                    const cfg = getProviderConfig(pId);
                    const isSelected = selectedProvider === pId;
                    return (
                      <DropdownMenuItem
                        key={pId}
                        onClick={() => {
                          onProviderChange(pId);
                          toast.info(`Switched to ${cfg.name}`);
                        }}
                        className={`gap-2.5 cursor-pointer rounded-md p-2.5 ${
                          isSelected ? "bg-accent font-semibold" : ""
                        }`}
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                          <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground">{cfg.name}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">{cfg.description}</p>
                        </div>
                      </DropdownMenuItem>
                    );
                  })}

                  {/* If user wants to see other supported providers not yet configured */}
                  {effectiveProviders.length === 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1 text-[10px] text-muted-foreground/80 font-normal">
                        No configured providers were reported. Requests may be unavailable.
                      </div>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Microphone Dictation Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              disabled={isLoading || disabled}
              aria-label={isRecording ? "Stop voice dictation" : "Dictate with voice"}
              aria-pressed={isRecording}
              className={`flex h-11 w-11 items-center justify-center rounded-md cursor-pointer disabled:opacity-50 ${
                isRecording
                  ? "bg-destructive text-destructive-foreground"
                  : "hover:bg-accent text-muted-foreground hover:text-foreground"
              }`}
              title={isRecording ? "Stop voice dictation" : "Dictate with voice"}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            {/* Send / Stop Action Button */}
            {isLoading ? (
              <button
                type="button"
                onClick={onStop}
                aria-label="Stop waiting for response"
                className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                title="Stop waiting for response"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </button>
            ) : input.trim() ? (
              <button
                type="button"
                onClick={onSend}
                disabled={disabled}
                aria-label={t("contact_send", "Send message")}
                className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 cursor-pointer"
                title="Send message (Enter)"
              >
                <ArrowUp className="h-4 w-4 stroke-[2.5]" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Centered Disclaimer Under the Capsule */}
      <p className="text-xs text-center text-muted-foreground mt-1.5">
        AI can make mistakes. Verify important information.
      </p>
    </div>
  );
}
