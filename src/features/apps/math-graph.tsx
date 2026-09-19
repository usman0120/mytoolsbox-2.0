"use client";

import { useRef, useEffect, useCallback } from "react";
import type { GraphData } from "@/lib/math/engine";

interface MathGraphProps {
  data: GraphData;
  width?: number;
  height?: number;
}

export function MathGraph({ data, width = 600, height = 400 }: MathGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, width, height);

    const padding = { left: 50, right: 20, top: 20, bottom: 40 };
    const plotW = width - padding.left - padding.right;
    const plotH = height - padding.top - padding.bottom;

    const [xMin, xMax] = data.xRange;
    const [yMin, yMax] = data.yRange;

    const toX = (x: number) => padding.left + ((x - xMin) / (xMax - xMin)) * plotW;
    const toY = (y: number) => padding.top + ((yMax - y) / (yMax - yMin)) * plotH;

    // Grid
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 0.5;
    const xStep = calcStep(xMin, xMax, 8);
    const yStep = calcStep(yMin, yMax, 6);

    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      const px = toX(x);
      ctx.beginPath();
      ctx.moveTo(px, padding.top);
      ctx.lineTo(px, padding.top + plotH);
      ctx.stroke();
    }
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      const py = toY(y);
      ctx.beginPath();
      ctx.moveTo(padding.left, py);
      ctx.lineTo(padding.left + plotW, py);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 1.5;
    const originX = toX(0);
    const originY = toY(0);

    if (originX >= padding.left && originX <= padding.left + plotW) {
      ctx.beginPath();
      ctx.moveTo(originX, padding.top);
      ctx.lineTo(originX, padding.top + plotH);
      ctx.stroke();
    }
    if (originY >= padding.top && originY <= padding.top + plotH) {
      ctx.beginPath();
      ctx.moveTo(padding.left, originY);
      ctx.lineTo(padding.left + plotW, originY);
      ctx.stroke();
    }

    // Axis labels
    ctx.fillStyle = "#6b7280";
    ctx.font = "11px system-ui";
    ctx.textAlign = "center";
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      ctx.fillText(formatNum(x), toX(x), padding.top + plotH + 16);
    }
    ctx.textAlign = "right";
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      ctx.fillText(formatNum(y), padding.left - 6, toY(y) + 4);
    }

    // Plot functions
    for (const fn of data.functions) {
      ctx.strokeStyle = fn.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      let firstPoint = true;
      const steps = 500;
      for (let i = 0; i <= steps; i++) {
        const x = xMin + (i / steps) * (xMax - xMin);
        const y = evaluateExpression(fn.expr, x);
        if (isNaN(y) || !isFinite(y)) {
          firstPoint = true;
          continue;
        }
        const px = toX(x);
        const py = toY(Math.max(yMin, Math.min(yMax, y)));
        if (firstPoint) {
          ctx.moveTo(px, py);
          firstPoint = false;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
    }

    // Key points
    if (data.keyPoints) {
      for (const pt of data.keyPoints) {
        const px = toX(pt.x);
        const py = toY(pt.y);
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1f2937";
        ctx.font = "bold 11px system-ui";
        ctx.textAlign = "left";
        ctx.fillText(pt.label, px + 8, py - 8);
      }
    }

    // Legend
    let legendY = padding.top + 8;
    for (const fn of data.functions) {
      if (!fn.label) continue;
      ctx.fillStyle = fn.color;
      ctx.fillRect(padding.left + plotW - 140, legendY, 12, 12);
      ctx.fillStyle = "#374151";
      ctx.font = "11px system-ui";
      ctx.textAlign = "left";
      ctx.fillText(fn.label, padding.left + plotW - 124, legendY + 10);
      legendY += 18;
    }
  }, [data, width, height]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-lg border border-border/50 bg-white dark:bg-gray-950"
      style={{ maxWidth: width }}
    />
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function calcStep(min: number, max: number, targetTicks: number): number {
  const range = max - min;
  const rawStep = range / targetTicks;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / magnitude;
  let niceStep: number;
  if (residual <= 1.5) niceStep = 1;
  else if (residual <= 3) niceStep = 2;
  else if (residual <= 7) niceStep = 5;
  else niceStep = 10;
  return niceStep * magnitude;
}

function formatNum(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  return n.toFixed(1);
}

function evaluateExpression(expr: string, x: number): number {
  // Simple expression evaluator for common patterns
  try {
    // Replace x with value
    let e = expr.replace(/x/g, `(${x})`);
    // Handle ² and ³
    e = e.replace(/²/g, "**2").replace(/³/g, "**3");
    // Handle sin, cos, tan
    e = e.replace(/sin\(/g, "Math.sin(");
    e = e.replace(/cos\(/g, "Math.cos(");
    e = e.replace(/tan\(/g, "Math.tan(");
    e = e.replace(/exp\(/g, "Math.exp(");
    e = e.replace(/ln\(/g, "Math.log(");
    e = e.replace(/sqrt\(/g, "Math.sqrt(");
    e = e.replace(/abs\(/g, "Math.abs(");
    e = e.replace(/pi/gi, String(Math.PI));
    e = e.replace(/\^/g, "**");
    // eslint-disable-next-line no-new-func
    return new Function("Math", `"use strict"; return ${e};`)(Math);
  } catch {
    return NaN;
  }
}