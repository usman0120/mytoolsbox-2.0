// Design Studio templates as plain data (no Fabric import), turned into canvas objects by scene.ts.
// All text, colours and shapes are original; no third-party assets.

export type DesignEl =
  | { t: "text"; text: string; x: number; y: number; w: number; size: number; font?: string; weight?: number; color: string; align?: "left" | "center" | "right"; lh?: number; ls?: number; italic?: boolean }
  | { t: "rect"; x: number; y: number; w: number; h: number; fill: string; r?: number; stroke?: string; sw?: number; opacity?: number }
  | { t: "circle"; x: number; y: number; d: number; fill: string; stroke?: string; sw?: number; opacity?: number }
  | { t: "line"; x1: number; y1: number; x2: number; y2: number; stroke: string; sw: number };

export interface CanvasSize {
  id: string;
  name: string;
  w: number;
  h: number;
  /** Pixels per inch used for PDF export at true physical size. */
  dpi?: number;
}

export const SIZES: CanvasSize[] = [
  { id: "square", name: "Square post", w: 1080, h: 1080 },
  { id: "portrait", name: "Portrait post", w: 1080, h: 1350 },
  { id: "story", name: "Story / reel", w: 1080, h: 1920 },
  { id: "thumbnail", name: "Video thumbnail", w: 1280, h: 720 },
  { id: "banner", name: "Link / blog banner", w: 1200, h: 630 },
  { id: "wide", name: "Wide post", w: 1600, h: 900 },
  { id: "slide", name: "Presentation 16:9", w: 1920, h: 1080 },
  { id: "a4", name: "A4 poster", w: 1240, h: 1754, dpi: 150 },
  { id: "a4-land", name: "A4 landscape", w: 1754, h: 1240, dpi: 150 },
  { id: "letter", name: "US Letter flyer", w: 1275, h: 1650, dpi: 150 },
];

export const FONTS = [
  "Inter Variable",
  "Montserrat Variable",
  "Space Grotesk Variable",
  "Oswald Variable",
  "Bebas Neue",
  "Playfair Display Variable",
  "DM Serif Display",
  "Roboto Slab Variable",
  "Lobster",
  "Pacifico",
  "Georgia",
  "Courier New",
];

export interface DesignTemplate {
  id: string;
  name: string;
  size: string;
  bg: string;
  els: DesignEl[];
}

const SANS = "Inter Variable";
const HEAD = "Montserrat Variable";

export const TEMPLATES: DesignTemplate[] = [
  {
    id: "announce", name: "Bold announcement", size: "square", bg: "#111111",
    els: [
      { t: "rect", x: 80, y: 80, w: 120, h: 14, fill: "#c6f432" },
      { t: "text", text: "BIG NEWS", x: 80, y: 130, w: 920, size: 44, font: HEAD, weight: 700, color: "#c6f432", ls: 200 },
      { t: "text", text: "We're opening a second studio this spring", x: 80, y: 210, w: 900, size: 104, font: HEAD, weight: 800, color: "#ffffff", lh: 1.02 },
      { t: "text", text: "Doors open March 14 · 22 King Street", x: 80, y: 930, w: 900, size: 34, font: SANS, color: "#a8a29e" },
    ],
  },
  {
    id: "quote", name: "Quote card", size: "square", bg: "#f5efe6",
    els: [
      { t: "text", text: "“", x: 90, y: 60, w: 200, size: 260, font: "DM Serif Display", color: "#c2410c" },
      { t: "text", text: "Small steps every day add up to big changes.", x: 110, y: 330, w: 860, size: 76, font: "DM Serif Display", color: "#292524", lh: 1.15 },
      { t: "line", x1: 110, y1: 800, x2: 230, y2: 800, stroke: "#c2410c", sw: 4 },
      { t: "text", text: "Your Name", x: 110, y: 830, w: 700, size: 34, font: SANS, weight: 600, color: "#57534e" },
    ],
  },
  {
    id: "opening", name: "Grand opening", size: "square", bg: "#1e3a8a",
    els: [
      { t: "circle", x: 640, y: -160, d: 620, fill: "#3b82f6", opacity: 0.35 },
      { t: "circle", x: -200, y: 700, d: 560, fill: "#60a5fa", opacity: 0.25 },
      { t: "text", text: "Grand", x: 90, y: 300, w: 900, size: 150, font: "Pacifico", color: "#fde68a" },
      { t: "text", text: "OPENING", x: 90, y: 480, w: 900, size: 150, font: "Bebas Neue", color: "#ffffff", ls: 60 },
      { t: "text", text: "Saturday 10 am · Free coffee for the first 50 guests", x: 90, y: 680, w: 900, size: 34, font: SANS, color: "#dbeafe" },
    ],
  },
  {
    id: "event", name: "Event invite", size: "portrait", bg: "#fafaf9",
    els: [
      { t: "rect", x: 0, y: 0, w: 1080, h: 620, fill: "#0f766e" },
      { t: "text", text: "YOU'RE INVITED", x: 90, y: 120, w: 900, size: 36, font: HEAD, weight: 700, color: "#99f6e4", ls: 300 },
      { t: "text", text: "Community Garden Day", x: 90, y: 200, w: 900, size: 110, font: "Playfair Display Variable", weight: 700, color: "#ffffff", lh: 1.05 },
      { t: "text", text: "Sunday, June 8\n9:00 am – 1:00 pm", x: 90, y: 720, w: 900, size: 54, font: HEAD, weight: 700, color: "#134e4a", lh: 1.25 },
      { t: "text", text: "Riverside Park, north gate. Bring gloves, we'll bring the seedlings.", x: 90, y: 960, w: 880, size: 34, font: SANS, color: "#44403c", lh: 1.4 },
    ],
  },
  {
    id: "tips", name: "Tips list", size: "portrait", bg: "#fffbeb",
    els: [
      { t: "text", text: "5 tips for better sleep", x: 90, y: 100, w: 900, size: 84, font: HEAD, weight: 800, color: "#1c1917", lh: 1.05 },
      { t: "rect", x: 90, y: 330, w: 10, h: 820, fill: "#f59e0b" },
      { t: "text", text: "1  Keep the same wake-up time\n2  Get daylight in the morning\n3  No caffeine after 2 pm\n4  Keep the bedroom cool\n5  Put screens away 30 min before bed", x: 140, y: 330, w: 860, size: 44, font: SANS, weight: 500, color: "#292524", lh: 1.9 },
      { t: "text", text: "@yourhandle", x: 90, y: 1220, w: 900, size: 30, font: SANS, color: "#a16207" },
    ],
  },
  {
    id: "hiring", name: "We're hiring", size: "square", bg: "#fef2f2",
    els: [
      { t: "text", text: "We're hiring", x: 80, y: 120, w: 920, size: 120, font: HEAD, weight: 800, color: "#991b1b" },
      { t: "text", text: "Junior Designer", x: 80, y: 290, w: 920, size: 64, font: HEAD, weight: 600, color: "#1c1917" },
      { t: "text", text: "Full time · Hybrid · Lahore", x: 80, y: 390, w: 920, size: 36, font: SANS, color: "#57534e" },
      { t: "rect", x: 80, y: 820, w: 420, h: 110, fill: "#991b1b", r: 55 },
      { t: "text", text: "Apply today", x: 80, y: 850, w: 420, size: 40, font: SANS, weight: 600, color: "#ffffff", align: "center" },
    ],
  },
  {
    id: "story-news", name: "Story announcement", size: "story", bg: "#18181b",
    els: [
      { t: "rect", x: 80, y: 260, w: 920, h: 920, fill: "#27272a", r: 40 },
      { t: "text", text: "NEW", x: 140, y: 330, w: 400, size: 60, font: "Bebas Neue", color: "#c6f432", ls: 100 },
      { t: "text", text: "Our summer menu is here", x: 140, y: 420, w: 800, size: 110, font: HEAD, weight: 800, color: "#fafafa", lh: 1.02 },
      { t: "text", text: "Swipe up to see what's new", x: 80, y: 1560, w: 920, size: 40, font: SANS, color: "#a1a1aa", align: "center" },
    ],
  },
  {
    id: "story-question", name: "Story question", size: "story", bg: "#7c3aed",
    els: [
      { t: "text", text: "Ask me anything", x: 80, y: 520, w: 920, size: 120, font: "Lobster", color: "#ffffff", align: "center" },
      { t: "rect", x: 140, y: 820, w: 800, h: 260, fill: "#ffffff", r: 36 },
      { t: "text", text: "Type your question…", x: 140, y: 920, w: 800, size: 44, font: SANS, color: "#a1a1aa", align: "center" },
    ],
  },
  {
    id: "thumb-tutorial", name: "Tutorial thumbnail", size: "thumbnail", bg: "#0a0a0a",
    els: [
      { t: "rect", x: 0, y: 0, w: 520, h: 720, fill: "#c6f432" },
      { t: "text", text: "HOW TO", x: 50, y: 210, w: 440, size: 120, font: "Bebas Neue", color: "#0a0a0a" },
      { t: "text", text: "in 10 min", x: 50, y: 350, w: 440, size: 70, font: HEAD, weight: 800, color: "#0a0a0a" },
      { t: "text", text: "Budget like a pro", x: 580, y: 230, w: 660, size: 110, font: HEAD, weight: 800, color: "#ffffff", lh: 1 },
    ],
  },
  {
    id: "thumb-vlog", name: "Vlog thumbnail", size: "thumbnail", bg: "#f97316",
    els: [
      { t: "text", text: "24 HOURS IN", x: 60, y: 160, w: 1160, size: 110, font: "Bebas Neue", color: "#ffffff", ls: 30 },
      { t: "text", text: "ISTANBUL", x: 60, y: 270, w: 1160, size: 260, font: "Bebas Neue", color: "#1c1917" },
      { t: "rect", x: 60, y: 580, w: 300, h: 70, fill: "#1c1917", r: 10 },
      { t: "text", text: "EP. 12", x: 60, y: 592, w: 300, size: 40, font: HEAD, weight: 700, color: "#ffffff", align: "center" },
    ],
  },
  {
    id: "podcast", name: "Podcast episode", size: "square", bg: "#0c4a6e",
    els: [
      { t: "circle", x: 650, y: 110, d: 340, fill: "#38bdf8", opacity: 0.2 },
      { t: "text", text: "EPISODE 42", x: 90, y: 110, w: 600, size: 36, font: HEAD, weight: 700, color: "#7dd3fc", ls: 200 },
      { t: "text", text: "Starting a business with no money", x: 90, y: 420, w: 900, size: 92, font: HEAD, weight: 800, color: "#ffffff", lh: 1.05 },
      { t: "text", text: "with guest Sara Malik", x: 90, y: 880, w: 900, size: 40, font: SANS, color: "#bae6fd" },
    ],
  },
  {
    id: "blog-header", name: "Blog header", size: "banner", bg: "#f8fafc",
    els: [
      { t: "rect", x: 0, y: 0, w: 24, h: 630, fill: "#2563eb" },
      { t: "text", text: "GUIDE", x: 90, y: 130, w: 600, size: 28, font: HEAD, weight: 700, color: "#2563eb", ls: 300 },
      { t: "text", text: "How to write a cover letter that gets read", x: 90, y: 190, w: 1000, size: 68, font: HEAD, weight: 800, color: "#0f172a", lh: 1.1 },
      { t: "text", text: "yourblog.com", x: 90, y: 520, w: 600, size: 28, font: SANS, color: "#64748b" },
    ],
  },
  {
    id: "webinar", name: "Webinar banner", size: "banner", bg: "#111827",
    els: [
      { t: "text", text: "FREE LIVE WEBINAR", x: 70, y: 90, w: 700, size: 28, font: HEAD, weight: 700, color: "#34d399", ls: 200 },
      { t: "text", text: "Excel basics for small teams", x: 70, y: 150, w: 760, size: 72, font: HEAD, weight: 800, color: "#f9fafb", lh: 1.05 },
      { t: "text", text: "Thursday · 6 pm GMT · 45 minutes", x: 70, y: 480, w: 760, size: 30, font: SANS, color: "#9ca3af" },
      { t: "rect", x: 880, y: 90, w: 250, h: 450, fill: "#1f2937", r: 24 },
      { t: "text", text: "Save\nyour\nseat", x: 900, y: 170, w: 210, size: 64, font: HEAD, weight: 800, color: "#34d399", align: "center", lh: 1.1 },
    ],
  },
  {
    id: "poster-event", name: "Event poster", size: "a4", bg: "#fef3c7",
    els: [
      { t: "circle", x: 620, y: 140, d: 560, fill: "#f59e0b" },
      { t: "text", text: "SUMMER", x: 100, y: 760, w: 1040, size: 230, font: "Bebas Neue", color: "#78350f" },
      { t: "text", text: "night market", x: 100, y: 980, w: 1040, size: 120, font: "Pacifico", color: "#b45309" },
      { t: "line", x1: 100, y1: 1260, x2: 1140, y2: 1260, stroke: "#78350f", sw: 4 },
      { t: "text", text: "Friday, July 18 · 6 pm till late\nOld Town Square\nFood · Music · Crafts", x: 100, y: 1310, w: 1040, size: 52, font: HEAD, weight: 600, color: "#78350f", lh: 1.4 },
    ],
  },
  {
    id: "poster-minimal", name: "Minimal poster", size: "a4", bg: "#ffffff",
    els: [
      { t: "text", text: "Less,\nbut better.", x: 110, y: 160, w: 1020, size: 170, font: "Playfair Display Variable", weight: 700, color: "#111111", lh: 1.05 },
      { t: "rect", x: 110, y: 1300, w: 1020, h: 4, fill: "#111111" },
      { t: "text", text: "An exhibition of everyday design\nApril 4 – May 30", x: 110, y: 1350, w: 1020, size: 46, font: SANS, color: "#444444", lh: 1.5 },
    ],
  },
  {
    id: "notice", name: "Notice", size: "a4", bg: "#ffffff",
    els: [
      { t: "rect", x: 0, y: 0, w: 1240, h: 320, fill: "#dc2626" },
      { t: "text", text: "NOTICE", x: 0, y: 90, w: 1240, size: 150, font: "Bebas Neue", color: "#ffffff", align: "center", ls: 80 },
      { t: "text", text: "The lift will be closed for maintenance", x: 110, y: 470, w: 1020, size: 84, font: HEAD, weight: 800, color: "#111111", align: "center", lh: 1.1 },
      { t: "text", text: "Monday 9 am – Wednesday 5 pm\nPlease use the stairs. Sorry for the trouble.", x: 110, y: 900, w: 1020, size: 48, font: SANS, color: "#404040", align: "center", lh: 1.5 },
    ],
  },
  {
    id: "cert-complete", name: "Certificate of completion", size: "a4-land", bg: "#fffdf7",
    els: [
      { t: "rect", x: 50, y: 50, w: 1654, h: 1140, fill: "rgba(0,0,0,0)", stroke: "#1e3a8a", sw: 6 },
      { t: "rect", x: 75, y: 75, w: 1604, h: 1090, fill: "rgba(0,0,0,0)", stroke: "#b8860b", sw: 2 },
      { t: "text", text: "CERTIFICATE OF COMPLETION", x: 0, y: 210, w: 1754, size: 64, font: HEAD, weight: 700, color: "#1e3a8a", align: "center", ls: 200 },
      { t: "text", text: "This certifies that", x: 0, y: 380, w: 1754, size: 40, font: SANS, color: "#57534e", align: "center" },
      { t: "text", text: "Recipient Name", x: 0, y: 450, w: 1754, size: 120, font: "Playfair Display Variable", weight: 600, italic: true, color: "#1c1917", align: "center" },
      { t: "text", text: "has successfully completed the course Introduction to Data Analysis", x: 277, y: 660, w: 1200, size: 40, font: SANS, color: "#44403c", align: "center", lh: 1.4 },
      { t: "line", x1: 260, y1: 1000, x2: 700, y2: 1000, stroke: "#1c1917", sw: 2 },
      { t: "line", x1: 1054, y1: 1000, x2: 1494, y2: 1000, stroke: "#1c1917", sw: 2 },
      { t: "text", text: "Date", x: 260, y: 1020, w: 440, size: 30, font: SANS, color: "#57534e", align: "center" },
      { t: "text", text: "Signature", x: 1054, y: 1020, w: 440, size: 30, font: SANS, color: "#57534e", align: "center" },
    ],
  },
  {
    id: "cert-award", name: "Award certificate", size: "a4-land", bg: "#0f172a",
    els: [
      { t: "rect", x: 60, y: 60, w: 1634, h: 1120, fill: "rgba(0,0,0,0)", stroke: "#eab308", sw: 4 },
      { t: "circle", x: 777, y: 120, d: 200, fill: "#eab308" },
      { t: "text", text: "★", x: 777, y: 150, w: 200, size: 110, font: SANS, color: "#0f172a", align: "center" },
      { t: "text", text: "AWARD OF EXCELLENCE", x: 0, y: 400, w: 1754, size: 60, font: HEAD, weight: 700, color: "#eab308", align: "center", ls: 250 },
      { t: "text", text: "Recipient Name", x: 0, y: 520, w: 1754, size: 120, font: "DM Serif Display", color: "#f8fafc", align: "center" },
      { t: "text", text: "For outstanding contribution to the team in 2026", x: 277, y: 730, w: 1200, size: 42, font: SANS, color: "#cbd5e1", align: "center" },
      { t: "text", text: "Presented by Organization Name", x: 0, y: 1000, w: 1754, size: 32, font: SANS, color: "#94a3b8", align: "center" },
    ],
  },
  {
    id: "slide-title", name: "Title slide", size: "slide", bg: "#fafaf9",
    els: [
      { t: "rect", x: 0, y: 0, w: 1920, h: 16, fill: "#4f46e5" },
      { t: "text", text: "Quarterly review", x: 140, y: 380, w: 1640, size: 140, font: HEAD, weight: 800, color: "#1c1917" },
      { t: "text", text: "Results, lessons and the plan for next quarter", x: 140, y: 580, w: 1640, size: 54, font: SANS, color: "#57534e" },
      { t: "text", text: "Team name · Date", x: 140, y: 900, w: 1640, size: 36, font: SANS, color: "#a8a29e" },
    ],
  },
  {
    id: "slide-section", name: "Section slide", size: "slide", bg: "#4f46e5",
    els: [
      { t: "text", text: "02", x: 140, y: 300, w: 600, size: 200, font: HEAD, weight: 800, color: "#a5b4fc" },
      { t: "text", text: "What we learned", x: 140, y: 560, w: 1640, size: 120, font: HEAD, weight: 800, color: "#ffffff" },
    ],
  },
];
