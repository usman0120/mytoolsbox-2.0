export type LoremTheme = "classic" | "tech" | "business" | "hipster";
export type LoremUnit = "paragraphs" | "sentences" | "words" | "list";

const THEME_WORDS: Record<LoremTheme, string[]> = {
  classic: [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
    "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
    "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
    "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea",
    "commodo", "consequat", "duis", "aute", "irure", "dolor", "in", "reprehenderit",
    "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla",
    "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident",
    "sunt", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est",
    "laborum", "perspiciatis", "unde", "omnis", "iste", "natus", "error", "sit",
    "voluptatem", "accusantium", "doloremque", "laudantium", "totam", "rem",
    "aperiam", "eaque", "ipsa", "quae", "ab", "illo", "inventore", "veritatis",
    "quasi", "architecto", "beatae", "vitae", "dicta", "sunt", "explicabo",
  ],
  tech: [
    "kubernetes", "docker", "microservice", "react", "typescript", "payload",
    "latency", "bandwidth", "pipeline", "deployment", "cluster", "telemetry",
    "asynchronous", "endpoint", "graphql", "rest", "cache", "redis", "database",
    "sharding", "replica", "distributed", "serverless", "lambda", "gateway",
    "compiler", "runtime", "dependency", "injection", "middleware", "concurrency",
    "thread", "mutex", "websocket", "authentication", "authorization", "jwt",
    "oauth", "encryption", "hash", "git", "commit", "branch", "pull-request",
    "linting", "debugging", "observability", "metrics", "tracing", "container",
  ],
  business: [
    "synergy", "paradigm", "deliverables", "stakeholder", "bandwidth", "pipeline",
    "quarterly", "growth", "strategy", "alignment", "ecosystem", "scalable",
    "actionable", "roi", "kpi", "milestone", "traction", "agile", "velocity",
    "frictionless", "core", "competency", "value-add", "deep-dive", "bandwidth",
    "leverage", "pivot", "runway", "seed", "venture", "disruptive", "empower",
    "holistic", "streamline", "optimize", "monetize", "benchmark", "touchpoint",
    "incentivize", "onboarding", "roadmap", "synergistic", "cross-functional",
  ],
  hipster: [
    "artisan", "cold-brew", "pour-over", "kombucha", "cardigan", "flannel",
    "sustainable", "craft", "organic", "retro", "vinyl", "succulent", "bespoke",
    "tote-bag", "polaroid", "aesthetic", "distillery", "farm-to-table", "vintage",
    "single-origin", "matcha", "avocado", "sourdough", "fixie", "mustache",
    "chillwave", "lo-fi", "raw-denim", "slow-fashion", "biodynamic", "heirloom",
  ],
};

export interface LoremOptions {
  theme?: LoremTheme;
  unit?: LoremUnit;
  count?: number;
  sentencesPerParagraph?: number;
  wordsPerSentence?: number;
  startWithLorem?: boolean;
  htmlTags?: boolean;
}

export function generateLoremIpsum(
  paragraphs: number = 3,
  sentencesPerParagraph: number = 5,
  wordsPerSentence: number = 10,
  options: LoremOptions = {}
): string {
  const theme = options.theme || "classic";
  const unit = options.unit || "paragraphs";
  const pool = THEME_WORDS[theme] || THEME_WORDS.classic;
  const startWithLorem = options.startWithLorem !== false;
  const htmlTags = !!options.htmlTags;

  const getRandomWord = () => pool[Math.floor(Math.random() * pool.length)];

  const makeSentence = (wordCount: number, isFirst: boolean): string => {
    const words: string[] = [];
    if (isFirst && startWithLorem && theme === "classic") {
      words.push("Lorem", "ipsum", "dolor", "sit", "amet,", "consectetur", "adipiscing", "elit.");
      return words.join(" ");
    }

    const count = Math.max(3, wordCount + Math.floor(Math.random() * 5) - 2);
    for (let i = 0; i < count; i++) {
      words.push(getRandomWord());
    }
    const raw = words.join(" ") + ".";
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  };

  if (unit === "words") {
    const totalWords = options.count || wordsPerSentence * 5;
    const words: string[] = [];
    if (startWithLorem && theme === "classic") {
      words.push("Lorem", "ipsum", "dolor", "sit", "amet");
    }
    while (words.length < totalWords) {
      words.push(getRandomWord());
    }
    return words.slice(0, totalWords).join(" ");
  }

  if (unit === "sentences") {
    const totalSentences = options.count || sentencesPerParagraph * 2;
    const sentences: string[] = [];
    for (let i = 0; i < totalSentences; i++) {
      sentences.push(makeSentence(wordsPerSentence, i === 0));
    }
    return sentences.join(" ");
  }

  if (unit === "list") {
    const itemsCount = options.count || 5;
    const items: string[] = [];
    for (let i = 0; i < itemsCount; i++) {
      const sentence = makeSentence(8, i === 0);
      items.push(htmlTags ? `  <li>${sentence}</li>` : `• ${sentence}`);
    }
    return htmlTags ? `<ul>\n${items.join("\n")}\n</ul>` : items.join("\n");
  }

  // Paragraphs
  const pCount = options.count || paragraphs;
  const paraResults: string[] = [];

  for (let p = 0; p < pCount; p++) {
    const sentences: string[] = [];
    for (let s = 0; s < sentencesPerParagraph; s++) {
      sentences.push(makeSentence(wordsPerSentence, p === 0 && s === 0));
    }
    const paraText = sentences.join(" ");
    paraResults.push(htmlTags ? `<p>${paraText}</p>` : paraText);
  }

  return paraResults.join(htmlTags ? "\n\n" : "\n\n");
}