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
import { AI_PERSONAS } from "../prompt-library-data";
import { SUPPORTED_PROVIDERS, getProviderConfig } from "@/lib/ai/providers-config";

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
  activePersonaId?: string;
  onPersonaChange?: (personaId: string) => void;
  onOpenPromptLibrary?: () => void;
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
  activePersonaId = "general",
  onPersonaChange,
  onOpenPromptLibrary,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [internalProviders, setInternalProviders] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Auto-fetch available providers if not provided by parent
  useEffect(() => {
    if (availableProviders && availableProviders.length > 0) {
      setInternalProviders(availableProviders);
      return;
    }

    let cancelled = false;
    fetch("/api/ai")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data.providers)) {
          setInternalProviders(data.providers);
        }
      })
      .catch(() => {
        // Fallback default
        if (!cancelled) setInternalProviders(["gemini", "groq"]);
      });

    return () => {
      cancelled = true;
    };
  }, [availableProviders]);

  // Auto-resize textarea as input grows smoothly up to 180px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 40), 180)}px`;
    }
  }, [input]);

  // Open slash commands when input starts with "/"
  useEffect(() => {
    if (input.startsWith("/") && !input.includes(" ") && input.length <= 15) {
      setSlashMenuOpen(true);
    } else {
      setSlashMenuOpen(false);
    }
  }, [input]);

  const filteredSlashCommands = SLASH_COMMANDS.filter((sc) =>
    sc.cmd.toLowerCase().startsWith(input.toLowerCase().trim())
  );

  const applySlashCommand = useCallback((prefix: string) => {
    setInput(prefix);
    setSlashMenuOpen(false);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  }, [setInput]);

  // Keyboard shortcut: Enter to send, Shift+Enter for new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      setSlashMenuOpen(false);
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecording(true);
        toast.info("Listening... Speak now");
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInput(input ? `${input} ${transcript}` : transcript);
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
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
  const effectiveProviders = internalProviders.length > 0 ? internalProviders : ["gemini", "groq"];

  const getActiveProviderLabel = () => {
    if (selectedProvider === "auto") return "Auto Router";
    const cfg = getProviderConfig(selectedProvider);
    return cfg.modelLabel;
  };

  const activePersona = AI_PERSONAS.find((p) => p.id === activePersonaId);
  const dynamicPlaceholder =
    placeholder ||
    (activePersona && activePersona.id !== "general"
      ? `Ask ${activePersona.name} or type '/' for recipes...`
      : "Ask anything, brainstorm, or paste code. Type '/' for quick recipes...");

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;

  return (
    <div className="p-2 sm:p-3 max-w-4xl mx-auto w-full relative shrink-0">
      {/* Floating Slash Command Autocomplete Menu */}
      {slashMenuOpen && filteredSlashCommands.length > 0 && (
        <div className="absolute bottom-full mb-2 left-4 sm:left-6 right-4 sm:right-6 max-w-lg z-50 rounded-2xl border border-border/70 bg-popover/95 p-1.5 shadow-2xl backdrop-blur-xl animate-fade-in-up">
          <div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>Productivity Slash Recipes</span>
            <span className="font-mono text-[9px]">Press Tab or Enter</span>
          </div>
          <div className="space-y-0.5">
            {filteredSlashCommands.map((sc) => {
              const Icon = sc.icon;
              return (
                <button
                  key={sc.cmd}
                  type="button"
                  onClick={() => applySlashCommand(sc.prefix)}
                  className="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs hover:bg-accent transition-colors group cursor-pointer"
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
      <div className="relative flex flex-col bg-[#1e1f20] dark:bg-[#1e1f20] text-white rounded-[24px] sm:rounded-[28px] border border-white/10 dark:border-white/10 shadow-2xl p-2 sm:p-2.5 transition-all focus-within:ring-2 focus-within:ring-white/20 focus-within:border-white/20">
        
        {/* Top: Full-Width Clean Textarea (Zero scrollbar clipping into buttons) */}
        <div className="w-full px-2 pt-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={dynamicPlaceholder}
            disabled={disabled || isLoading}
            rows={1}
            className="w-full resize-none bg-transparent py-1 text-sm sm:text-base text-white placeholder:text-neutral-400 focus:outline-hidden max-h-48 leading-relaxed font-normal overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full"
          />
        </div>

        {/* Bottom Toolbar Row */}
        <div className="flex items-center justify-between gap-2 px-1 pt-1 border-t border-white/5 mt-0.5">
          {/* Left Actions: Plus Menu & Clear */}
          <div className="flex items-center gap-1 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors shrink-0 outline-none cursor-pointer"
                title="Prompt starters & personas"
              >
                <Plus className="h-4.5 w-4.5" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="w-64 rounded-2xl p-1.5 text-xs shadow-2xl backdrop-blur-xl">
                <div className="px-2.5 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
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
                      className="gap-2 cursor-pointer rounded-xl p-2"
                    >
                      <ActionIcon className="h-3.5 w-3.5 text-primary" />
                      <span>{action.label}</span>
                    </DropdownMenuItem>
                  );
                })}

                <DropdownMenuSeparator />

                {onOpenPromptLibrary && (
                  <DropdownMenuItem
                    onClick={onOpenPromptLibrary}
                    className="gap-2 cursor-pointer rounded-xl p-2 font-medium text-amber-500"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Open 160+ Prompt Library</span>
                  </DropdownMenuItem>
                )}

                {onPersonaChange && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-2.5 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Active Persona
                    </div>
                    {AI_PERSONAS.slice(0, 4).map((p) => (
                      <DropdownMenuItem
                        key={p.id}
                        onClick={() => onPersonaChange(p.id)}
                        className={`gap-2 cursor-pointer rounded-xl p-2 ${
                          activePersonaId === p.id ? "bg-accent font-semibold" : ""
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span>{p.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Quick Clear Input button */}
            {input && onClear && (
              <button
                type="button"
                onClick={onClear}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
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
              <span className="hidden sm:inline-block font-mono text-[10px] sm:text-[11px] text-neutral-400 select-none mr-0.5">
                {wordCount} {wordCount === 1 ? "word" : "words"}
              </span>
            )}

            {/* DYNAMIC MODEL SELECTOR DROPDOWN (No small toggle button!) */}
            {onProviderChange && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-medium text-neutral-200 hover:text-white transition-all outline-none cursor-pointer border border-white/10"
                  title="Select AI Model"
                >
                  <Sparkles className="h-3 w-3 text-blue-400" />
                  <span className="truncate max-w-24 sm:max-w-32">{getActiveProviderLabel()}</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-64 rounded-2xl p-1.5 text-xs shadow-2xl backdrop-blur-xl">
                  {/* Auto Router Option */}
                  <DropdownMenuItem
                    onClick={() => {
                      onProviderChange("auto");
                      toast.info("Auto Router enabled: Routes to optimal engine based on prompt complexity.");
                    }}
                    className={`gap-2.5 cursor-pointer rounded-xl p-2.5 ${
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
                      <p className="text-[10px] text-muted-foreground truncate">Auto-selects fastest & smartest engine</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
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
                        className={`gap-2.5 cursor-pointer rounded-xl p-2.5 ${
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
                  {SUPPORTED_PROVIDERS.filter((p) => !effectiveProviders.includes(p.id)).length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1 text-[10px] text-muted-foreground/80 font-normal">
                        To add OpenAI, Claude, or DeepSeek, configure their API keys in <code className="font-mono text-[9px] bg-muted px-1 py-0.5 rounded">.env.local</code>.
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
              className={`flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full transition-colors cursor-pointer ${
                isRecording
                  ? "bg-rose-500 text-white animate-pulse"
                  : "hover:bg-white/10 text-neutral-300 hover:text-white"
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
                className="flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full bg-white text-neutral-900 hover:bg-neutral-200 shadow-sm transition-transform active:scale-95 cursor-pointer"
                title="Stop generation"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </button>
            ) : input.trim() ? (
              <button
                type="button"
                onClick={onSend}
                disabled={disabled}
                className="flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full bg-white text-neutral-950 hover:bg-neutral-200 shadow-sm transition-transform active:scale-95 disabled:opacity-40 cursor-pointer"
                title="Send message (Enter)"
              >
                <ArrowUp className="h-4 w-4 stroke-[2.5]" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Centered Disclaimer Under the Capsule */}
      <p className="text-[10px] sm:text-[11px] text-center text-neutral-400 dark:text-neutral-500 mt-1 sm:mt-1.5 font-normal select-none truncate">
        Gemini & Groq are AI and can make mistakes. Verify important information.
      </p>
    </div>
  );
}
