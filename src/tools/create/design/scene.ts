"use client";
// Fabric.js scene helpers for Design Studio. Coordinates in templates are top-left; Fabric 7 defaults to
// centre origins, so objects are placed with setPositionByOrigin(…, "left", "top").
import { Canvas, Circle, FabricImage, FabricObject, Line, Path, Point, Polygon, Rect, Shadow, Textbox, Triangle, filters } from "fabric";
import type { DesignEl, DesignTemplate } from "./templates";

/** Extra properties kept when serializing (layer names and lock state). */
export const EXTRA_PROPS = ["name", "lockMovementX", "lockMovementY", "lockScalingX", "lockScalingY", "lockRotation", "hasControls"];

export type Named = FabricObject & { name?: string };

function place<T extends FabricObject>(obj: T, x: number, y: number, name: string): T {
  obj.setPositionByOrigin(new Point(x, y), "left", "top");
  (obj as Named).name = name;
  obj.setCoords();
  return obj;
}

export async function loadFonts(families: string[]) {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.all(
    [...new Set(families)].flatMap((f) => [400, 700].map((w) => document.fonts.load(`${w} 40px "${f}"`).catch(() => [])))
  );
}

export function elToObject(el: DesignEl): FabricObject {
  switch (el.t) {
    case "text":
      return place(
        new Textbox(el.text, {
          width: el.w,
          fontSize: el.size,
          fontFamily: el.font ?? "Inter Variable",
          fontWeight: el.weight ?? 400,
          fontStyle: el.italic ? "italic" : "normal",
          fill: el.color,
          textAlign: el.align ?? "left",
          lineHeight: el.lh ?? 1.16,
          charSpacing: el.ls ?? 0,
          splitByGrapheme: false,
        }),
        el.x,
        el.y,
        "Text",
      );
    case "rect":
      return place(
        new Rect({ width: el.w, height: el.h, fill: el.fill, rx: el.r ?? 0, ry: el.r ?? 0, stroke: el.stroke, strokeWidth: el.sw ?? 0, opacity: el.opacity ?? 1, strokeUniform: true }),
        el.x,
        el.y,
        "Rectangle",
      );
    case "circle":
      return place(new Circle({ radius: el.d / 2, fill: el.fill, stroke: el.stroke, strokeWidth: el.sw ?? 0, opacity: el.opacity ?? 1, strokeUniform: true }), el.x, el.y, "Circle");
    case "line":
      return place(
        new Line([0, 0, el.x2 - el.x1, el.y2 - el.y1], { stroke: el.stroke, strokeWidth: el.sw, strokeLineCap: "round", strokeUniform: true }),
        Math.min(el.x1, el.x2),
        Math.min(el.y1, el.y2) - el.sw / 2,
        "Line",
      );
  }
}

export async function applyTemplate(canvas: Canvas, tpl: DesignTemplate) {
  await loadFonts(tpl.els.flatMap((e) => (e.t === "text" ? [e.font ?? "Inter Variable"] : [])));
  canvas.clear();
  canvas.backgroundColor = tpl.bg;
  for (const el of tpl.els) canvas.add(elToObject(el));
  canvas.requestRenderAll();
}

export type TextKind = "heading" | "subheading" | "body";
const TEXT: Record<TextKind, { text: string; size: number; weight: number; font: string }> = {
  heading: { text: "Add a heading", size: 96, weight: 800, font: "Montserrat Variable" },
  subheading: { text: "Add a subheading", size: 56, weight: 600, font: "Montserrat Variable" },
  body: { text: "Add a little bit of body text", size: 36, weight: 400, font: "Inter Variable" },
};

export async function addText(canvas: Canvas, kind: TextKind, page: { w: number; h: number }, color: string) {
  const t = TEXT[kind];
  await loadFonts([t.font]);
  const w = Math.min(page.w * 0.8, kind === "body" ? 760 : 1000);
  const box = new Textbox(t.text, { width: w, fontSize: t.size, fontWeight: t.weight, fontFamily: t.font, fill: color, textAlign: "center" });
  return add(canvas, place(box, (page.w - w) / 2, page.h / 2 - t.size / 2, "Text"));
}

export type ShapeKind = "rect" | "rounded" | "circle" | "triangle" | "line" | "arrow" | "star";

export function addShape(canvas: Canvas, kind: ShapeKind, page: { w: number; h: number }, color: string) {
  const s = Math.round(Math.min(page.w, page.h) * 0.3);
  const x = (page.w - s) / 2, y = (page.h - s) / 2;
  const fill = { fill: color, strokeUniform: true };
  let obj: FabricObject;
  if (kind === "rect") obj = place(new Rect({ width: s, height: s, ...fill }), x, y, "Rectangle");
  else if (kind === "rounded") obj = place(new Rect({ width: s, height: s, rx: s * 0.12, ry: s * 0.12, ...fill }), x, y, "Rounded rectangle");
  else if (kind === "circle") obj = place(new Circle({ radius: s / 2, ...fill }), x, y, "Circle");
  else if (kind === "triangle") obj = place(new Triangle({ width: s, height: s, ...fill }), x, y, "Triangle");
  else if (kind === "line") obj = place(new Line([0, 0, s, 0], { stroke: color, strokeWidth: 8, strokeLineCap: "round", strokeUniform: true }), x, page.h / 2, "Line");
  else if (kind === "arrow") {
    const L = s * 1.2, h = Math.max(10, s * 0.06);
    obj = place(new Path(`M 0 ${h * 2} L ${L - h * 4} ${h * 2} L ${L - h * 4} 0 L ${L} ${h * 3} L ${L - h * 4} ${h * 6} L ${L - h * 4} ${h * 4} L 0 ${h * 4} z`, { ...fill }), (page.w - L) / 2, page.h / 2 - h * 3, "Arrow");
  } else {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const r = i % 2 ? s * 0.2 : s / 2;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      return { x: s / 2 + r * Math.cos(a), y: s / 2 + r * Math.sin(a) };
    });
    obj = place(new Polygon(pts, { ...fill }), x, y, "Star");
  }
  return add(canvas, obj);
}

/** Reads a photo, downsizes it to keep projects small, and returns a data URL (survives reloads). */
export async function photoDataUrl(file: Blob, max = 2400): Promise<string> {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close();
  const png = file.type === "image/png" || file.type === "image/webp" || file.type === "image/svg+xml";
  return c.toDataURL(png ? "image/png" : "image/jpeg", 0.9);
}

export async function addPhoto(canvas: Canvas, url: string, page: { w: number; h: number }) {
  const img = await FabricImage.fromURL(url);
  const k = Math.min((page.w * 0.6) / img.width, (page.h * 0.6) / img.height, 1);
  img.scale(k);
  return add(canvas, place(img, (page.w - img.width * k) / 2, (page.h - img.height * k) / 2, "Photo"));
}

function add(canvas: Canvas, obj: FabricObject) {
  canvas.add(obj);
  canvas.setActiveObject(obj);
  canvas.requestRenderAll();
  return obj;
}

export interface PhotoAdjust {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: boolean;
}

export function getAdjust(img: FabricImage): PhotoAdjust {
  const f = img.filters ?? [];
  const find = <T>(type: string) => f.find((x) => x && (x as { type: string }).type === type) as T | undefined;
  return {
    brightness: find<{ brightness: number }>("Brightness")?.brightness ?? 0,
    contrast: find<{ contrast: number }>("Contrast")?.contrast ?? 0,
    saturation: find<{ saturation: number }>("Saturation")?.saturation ?? 0,
    blur: find<{ blur: number }>("Blur")?.blur ?? 0,
    grayscale: !!find("Grayscale"),
  };
}

export function setAdjust(img: FabricImage, a: PhotoAdjust) {
  const list = [];
  if (a.brightness) list.push(new filters.Brightness({ brightness: a.brightness }));
  if (a.contrast) list.push(new filters.Contrast({ contrast: a.contrast }));
  if (a.saturation) list.push(new filters.Saturation({ saturation: a.saturation }));
  if (a.blur) list.push(new filters.Blur({ blur: a.blur }));
  if (a.grayscale) list.push(new filters.Grayscale());
  img.filters = list;
  img.applyFilters();
}

export function setShadow(obj: FabricObject, on: boolean) {
  obj.shadow = on ? new Shadow({ color: "rgba(0,0,0,0.35)", blur: 24, offsetX: 0, offsetY: 10 }) : null;
}

export function layerLabel(obj: FabricObject): string {
  if (obj instanceof Textbox) return obj.text.split("\n")[0].slice(0, 32) || "Text";
  return (obj as Named).name ?? obj.type;
}

export function setLocked(obj: FabricObject, locked: boolean) {
  obj.set({ lockMovementX: locked, lockMovementY: locked, lockScalingX: locked, lockScalingY: locked, lockRotation: locked, hasControls: !locked });
}

export const isLocked = (obj: FabricObject) => !!obj.lockMovementX;

/** Renders the page (not the viewport) at design size × scale. */
export function pageDataUrl(canvas: Canvas, zoom: number, format: "png" | "jpeg" | "webp", scale = 1) {
  const active = canvas.getActiveObject();
  canvas.discardActiveObject();
  canvas.renderAll();
  const url = canvas.toDataURL({ format, quality: 0.92, multiplier: scale / zoom, enableRetinaScaling: false });
  if (active) canvas.setActiveObject(active);
  canvas.requestRenderAll();
  return url;
}

export function pageSvg(canvas: Canvas, page: { w: number; h: number }) {
  const vpt = canvas.viewportTransform.slice() as typeof canvas.viewportTransform;
  canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
  const svg = canvas.toSVG({ width: `${page.w}`, height: `${page.h}`, viewBox: { x: 0, y: 0, width: page.w, height: page.h } });
  canvas.setViewportTransform(vpt);
  return svg;
}

export function sceneJson(canvas: Canvas) {
  return canvas.toObject(EXTRA_PROPS);
}
