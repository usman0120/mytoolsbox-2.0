// Canva Design Studio Core Specifications & Canvas Rendering Models

export interface CanvasTemplate {
  id: string;
  name: string;
  category: "social" | "presentation" | "print" | "custom";
  width: number;
  height: number;
  aspectRatio: string;
}

export const DESIGN_TEMPLATES: CanvasTemplate[] = [
  { id: "insta_post", name: "Instagram Post", category: "social", width: 1080, height: 1080, aspectRatio: "1:1" },
  { id: "insta_story", name: "Instagram Story / Reel", category: "social", width: 1080, height: 1920, aspectRatio: "9:16" },
  { id: "fb_post", name: "Facebook Post", category: "social", width: 1200, height: 630, aspectRatio: "1.91:1" },
  { id: "twitter_post", name: "Twitter / X Post", category: "social", width: 1200, height: 675, aspectRatio: "16:9" },
  { id: "linkedin_post", name: "LinkedIn Post", category: "social", width: 1200, height: 627, aspectRatio: "1.91:1" },
  { id: "yt_thumb", name: "YouTube Thumbnail", category: "social", width: 1280, height: 720, aspectRatio: "16:9" },
  { id: "presentation", name: "Presentation Slide (16:9)", category: "presentation", width: 1920, height: 1080, aspectRatio: "16:9" },
  { id: "poster_a4", name: "Poster (A4 Print)", category: "print", width: 2480, height: 3508, aspectRatio: "1:1.41" },
];

export interface TextLayer {
  id: string;
  text: string;
  color: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: "normal" | "bold" | "900";
  textAlign: "left" | "center" | "right";
  xPercent: number; // 0 to 100
  yPercent: number; // 0 to 100
  hasShadow?: boolean;
  shadowColor?: string;
}

export interface DesignState {
  template: CanvasTemplate;
  bgType: "color" | "gradient" | "image";
  bgColor: string;
  bgGradient?: { from: string; to: string; direction: "to-r" | "to-b" | "to-br" };
  bgImageSrc?: string;
  textLayers: TextLayer[];
}

export const PRESET_GRADIENTS = [
  { name: "Sunset", from: "#ff512f", to: "#dd2476" },
  { name: "Ocean", from: "#2193b0", to: "#6dd5ed" },
  { name: "Midnight", from: "#0f2027", to: "#2c5364" },
  { name: "Emerald", from: "#11998e", to: "#38ef7d" },
  { name: "Royal Purple", from: "#8e2de2", to: "#4a00e0" },
  { name: "Neon Glow", from: "#f857a6", to: "#ff5858" },
];

export function calculateFittedDimensions(
  templateWidth: number,
  templateHeight: number,
  containerMaxWidth: number,
  containerMaxHeight: number
): { width: number; height: number; scale: number } {
  const scale = Math.min(containerMaxWidth / templateWidth, containerMaxHeight / templateHeight, 1);
  return {
    width: Math.round(templateWidth * scale),
    height: Math.round(templateHeight * scale),
    scale,
  };
}
