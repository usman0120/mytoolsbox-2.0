"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Send, Loader2, Sparkles, Lightbulb, BookOpen, AlertTriangle,
   MessageCircle, Leaf, ChevronRight,
} from "lucide-react";
import { askFarmingExpert, type FarmingAssistantOutput } from "@/lib/ai/services/farming-assistant";
import { getAvailableProviders } from "@/lib/ai";

const SUGGESTED_QUESTIONS = [
  { text: "How do I control aphids on my crops naturally?", lang: "english" },
  { text: "What is the best fertilizer for wheat?", lang: "english" },
  { text: "When should I plant rice this season?", lang: "english" },
  { text: "How to prevent tomato blight disease?", lang: "english" },
];

interface Message {
  role: "user" | "assistant";
  content: string;
  disclaimer?: string;
  relatedTopics?: string[];
  practicalSteps?: string[];
}

export function KnowledgeAssistant() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);

  const hasAI = getAvailableProviders().length > 0;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAsk = async (text?: string) => {
    const q = text || query;
    if (!q.trim()) return;

    const userMsg: Message = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setIsLoading(true);

    try {
      if (hasAI) {
        const result = await askFarmingExpert({ query: q, language: "english" });
        const assistantMsg: Message = {
          role: "assistant",
          content: result.answer,
          disclaimer: result.disclaimer,
          relatedTopics: result.relatedTopics,
          practicalSteps: result.practicalSteps,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        // Offline fallback
        await new Promise((r) => setTimeout(r, 800));
        const assistantMsg: Message = {
          role: "assistant",
          content: getOfflineResponse(q),
          disclaimer: "For region-specific advice, consult your local Krishi Vigyan Kendra (KVK) or agricultural extension officer.",
          relatedTopics: ["Soil health management", "Integrated pest management", "Crop rotation benefits"],
          practicalSteps: ["Visit your nearest KVK for soil testing", "Join local farmer groups for knowledge sharing", "Keep a farm diary to track crop performance"],
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch {
      const assistantMsg: Message = {
        role: "assistant",
        content: getOfflineResponse(q),
        disclaimer: "For region-specific advice, consult your local agricultural extension officer.",
        relatedTopics: [],
        practicalSteps: [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const toggleSteps = (idx: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Availability */}
      <div className="flex items-center gap-2">
        {!hasAI && (
          <Badge variant="secondary" className="text-[10px] h-5">Offline Mode</Badge>
        )}
      </div>

      {/* Chat Messages */}
      {messages.length > 0 && (
        <div className="space-y-3 max-h-96 overflow-y-auto p-1">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                  <Leaf className="h-3.5 w-3.5 text-green-600" />
                </div>
              )}
              <div className={`rounded-xl px-3 py-2 max-w-[85%] ${
                msg.role === "user"
                  ? "bg-green-600 text-white"
                  : "bg-muted/50 border border-border/30"
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                {/* Practical Steps */}
                {msg.practicalSteps && msg.practicalSteps.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/20">
                    <button
                      className="text-xs font-medium flex items-center gap-1 text-green-600 dark:text-green-400 hover:underline"
                      onClick={() => toggleSteps(i)}
                    >
                      <Lightbulb className="h-3 w-3" />
                      Practical Steps ({msg.practicalSteps.length})
                      <ChevronRight className={`h-3 w-3 transition-transform ${expandedSteps.has(i) ? "rotate-90" : ""}`} />
                    </button>
                    {expandedSteps.has(i) && (
                      <ol className="mt-1.5 space-y-1 list-decimal list-inside">
                        {msg.practicalSteps.map((step, si) => (
                          <li key={si} className="text-xs text-muted-foreground">{step}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}

                {/* Related Topics */}
                {msg.relatedTopics && msg.relatedTopics.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/20">
                    <p className="text-xs font-medium mb-1 flex items-center gap-1 text-muted-foreground">
                      <BookOpen className="h-3 w-3" /> Related Topics
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {msg.relatedTopics.map((topic, ti) => (
                        <Badge
                          key={ti}
                          variant="secondary"
                          className="text-[10px] cursor-pointer hover:bg-secondary/80"
                          onClick={() => handleAsk(topic)}
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                {msg.disclaimer && (
                  <div className="mt-2 pt-2 border-t border-border/20">
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-start gap-1">
                      <AlertTriangle className="h-2.5 w-2.5 mt-0.5 shrink-0" />
                      {msg.disclaimer}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      )}

      {/* Suggested Questions */}
      {messages.length === 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MessageCircle className="h-3 w-3" /> Try asking:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_QUESTIONS.map((sq, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80 transition-colors py-1.5 px-3"
                onClick={() => handleAsk(sq.text)}
              >
                {sq.text.length > 50 ? sq.text.slice(0, 50) + "..." : sq.text}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask any farming question..."
          className="h-10 text-sm"
        />
        <Button
          onClick={() => handleAsk()}
          disabled={!query.trim() || isLoading}
          size="sm"
          className="h-10 gap-1.5 bg-green-600 hover:bg-green-700"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Offline fallback responses
// ---------------------------------------------------------------------------

function getOfflineResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes("aphid") || q.includes("pest") || q.includes("insect")) {
    return "For natural pest control:\n\n1. Use neem oil spray (5ml neem oil + 1L water + few drops of soap) every 7-10 days\n2. Introduce beneficial insects like ladybugs and lacewings\n3. Plant marigold and basil as companion plants to repel pests\n4. Use yellow sticky traps to monitor and reduce pest population\n5. Practice crop rotation to break pest cycles";
  }

  if (q.includes("fertilizer") || q.includes("nutrient") || q.includes("manure")) {
    return "For balanced fertilization:\n\n1. Always start with a soil test to know what your soil needs\n2. Apply well-decomposed farmyard manure (FYM) at 10-15 tons/ha before planting\n3. Use NPK fertilizers based on crop requirements — typically 100-120 kg N, 50-60 kg P, 40-50 kg K per hectare for cereals\n4. Split nitrogen application: 50% at sowing, 25% at 30 days, 25% at 60 days\n5. Consider vermicompost and biofertilizers for organic farming";
  }

  if (q.includes("water") || q.includes("irrigation") || q.includes("paani") || q.includes("sichai")) {
    return "For efficient irrigation:\n\n1. Most field crops need 4-6 mm of water per day during peak growth\n2. Use drip irrigation to save 30-50% water compared to flood irrigation\n3. Irrigate early morning or evening to reduce evaporation\n4. Critical stages for irrigation: germination, flowering, and grain filling\n5. Mulching with crop residue can reduce water loss by 30-40%";
  }

  if (q.includes("yellow") || q.includes("peela") || q.includes("pila")) {
    return "Yellowing leaves can indicate several issues:\n\n1. Nitrogen deficiency — older leaves turn yellow first. Apply urea or ammonium sulfate\n2. Iron deficiency — young leaves yellow while veins stay green. Apply iron sulfate foliar spray\n3. Water stress — either too much or too little water. Check soil moisture\n4. Disease — fungal infections like blight can cause yellowing. Look for spots or lesions\n5. Get your soil tested at the nearest Krishi Vigyan Kendra (KVK) for accurate diagnosis";
  }

  return "Thank you for your question! For the most accurate advice:\n\n1. Visit your nearest Krishi Vigyan Kendra (KVK) — they provide free expert advice\n2. Get your soil and water tested at a government lab\n3. Connect with local farmer producer organizations (FPOs) for peer learning\n4. Check the Kisan Suvidha app for weather and market information\n5. For specific crop advice, try our Crop Calculator or Fertilizer Calculator tools above";
}
