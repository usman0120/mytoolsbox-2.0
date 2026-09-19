"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Workflow, Square, Circle, Diamond, ArrowRight, Type, Trash2,
  Download, Undo2, ZoomIn, ZoomOut,
  GitBranch, Hexagon, Triangle, MousePointer2,
  Brain, Database, GitMerge, Layers, Network
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Shape {
  id: string;
  type: "rectangle" | "circle" | "diamond" | "rounded-rect" | "hexagon" | "triangle" | "text" | "cylinder" | "parallelogram" | "cloud";
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
  textColor: string;
}

interface Connection {
  id: string;
  fromId: string;
  toId: string;
  label: string;
  lineStyle: "solid" | "dashed" | "dotted";
}

interface DiagramState {
  shapes: Shape[];
  connections: Connection[];
}

type DiagramMode = "flowchart" | "mindmap" | "er" | "sequence" | "architecture";

// ─── Constants ───────────────────────────────────────────────────────────────

const SHAPE_COLORS = ["#0891b2", "#7c3aed", "#059669", "#dc2626", "#d97706", "#2563eb", "#db2777", "#0f172a"];

const MODE_SHAPES: Record<DiagramMode, { type: Shape["type"]; icon: React.ComponentType<{ className?: string }>; label: string }[]> = {
  flowchart: [
    { type: "rounded-rect", icon: Square, label: "Start/End" },
    { type: "rectangle", icon: Square, label: "Process" },
    { type: "diamond", icon: Diamond, label: "Decision" },
    { type: "parallelogram", icon: Square, label: "I/O" },
    { type: "circle", icon: Circle, label: "Connector" },
  ],
  mindmap: [
    { type: "circle", icon: Circle, label: "Central" },
    { type: "rounded-rect", icon: Square, label: "Topic" },
    { type: "rectangle", icon: Square, label: "Subtopic" },
    { type: "text", icon: Type, label: "Label" },
  ],
  er: [
    { type: "rectangle", icon: Square, label: "Entity" },
    { type: "diamond", icon: Diamond, label: "Relationship" },
    { type: "circle", icon: Circle, label: "Attribute" },
    { type: "text", icon: Type, label: "Label" },
  ],
  sequence: [
    { type: "rectangle", icon: Square, label: "Participant" },
    { type: "rounded-rect", icon: Square, label: "Action" },
    { type: "diamond", icon: Diamond, label: "Condition" },
    { type: "text", icon: Type, label: "Note" },
  ],
  architecture: [
    { type: "rectangle", icon: Square, label: "Service" },
    { type: "cylinder", icon: Square, label: "Database" },
    { type: "cloud", icon: Square, label: "External" },
    { type: "rounded-rect", icon: Square, label: "Component" },
    { type: "hexagon", icon: Hexagon, label: "Gateway" },
  ],
};

const MODE_TEMPLATES: Record<DiagramMode, DiagramState> = {
  flowchart: {
    shapes: [
      { id: "1", type: "rounded-rect", x: 100, y: 200, width: 160, height: 60, text: "Start", color: "#059669", textColor: "#ffffff" },
      { id: "2", type: "rectangle", x: 350, y: 200, width: 160, height: 60, text: "Process", color: "#0891b2", textColor: "#ffffff" },
      { id: "3", type: "diamond", x: 600, y: 180, width: 140, height: 100, text: "Decision?", color: "#d97706", textColor: "#ffffff" },
      { id: "4", type: "rounded-rect", x: 600, y: 350, width: 160, height: 60, text: "End", color: "#dc2626", textColor: "#ffffff" },
    ],
    connections: [
      { id: "c1", fromId: "1", toId: "2", label: "", lineStyle: "solid" },
      { id: "c2", fromId: "2", toId: "3", label: "", lineStyle: "solid" },
      { id: "c3", fromId: "3", toId: "4", label: "Yes", lineStyle: "solid" },
    ],
  },
  mindmap: {
    shapes: [
      { id: "1", type: "circle", x: 350, y: 200, width: 100, height: 100, text: "Main Idea", color: "#7c3aed", textColor: "#ffffff" },
      { id: "2", type: "rounded-rect", x: 100, y: 80, width: 140, height: 50, text: "Topic A", color: "#0891b2", textColor: "#ffffff" },
      { id: "3", type: "rounded-rect", x: 100, y: 200, width: 140, height: 50, text: "Topic B", color: "#059669", textColor: "#ffffff" },
      { id: "4", type: "rounded-rect", x: 100, y: 320, width: 140, height: 50, text: "Topic C", color: "#d97706", textColor: "#ffffff" },
      { id: "5", type: "rounded-rect", x: 550, y: 80, width: 140, height: 50, text: "Topic D", color: "#dc2626", textColor: "#ffffff" },
      { id: "6", type: "rounded-rect", x: 550, y: 200, width: 140, height: 50, text: "Topic E", color: "#2563eb", textColor: "#ffffff" },
    ],
    connections: [
      { id: "c1", fromId: "1", toId: "2", label: "", lineStyle: "solid" },
      { id: "c2", fromId: "1", toId: "3", label: "", lineStyle: "solid" },
      { id: "c3", fromId: "1", toId: "4", label: "", lineStyle: "solid" },
      { id: "c4", fromId: "1", toId: "5", label: "", lineStyle: "solid" },
      { id: "c5", fromId: "1", toId: "6", label: "", lineStyle: "solid" },
    ],
  },
  er: {
    shapes: [
      { id: "1", type: "rectangle", x: 100, y: 100, width: 180, height: 120, text: "User\n───────\nid (PK)\nname\nemail", color: "#0891b2", textColor: "#ffffff" },
      { id: "2", type: "rectangle", x: 450, y: 100, width: 180, height: 120, text: "Order\n───────\nid (PK)\nuser_id (FK)\ntotal", color: "#7c3aed", textColor: "#ffffff" },
      { id: "3", type: "rectangle", x: 450, y: 300, width: 180, height: 100, text: "Product\n───────\nid (PK)\nname\nprice", color: "#059669", textColor: "#ffffff" },
      { id: "4", type: "diamond", x: 310, y: 115, width: 100, height: 60, text: "places", color: "#d97706", textColor: "#ffffff" },
      { id: "5", type: "diamond", x: 310, y: 310, width: 100, height: 60, text: "contains", color: "#dc2626", textColor: "#ffffff" },
    ],
    connections: [
      { id: "c1", fromId: "1", toId: "4", label: "1", lineStyle: "solid" },
      { id: "c2", fromId: "4", toId: "2", label: "N", lineStyle: "solid" },
      { id: "c3", fromId: "2", toId: "5", label: "N", lineStyle: "solid" },
      { id: "c4", fromId: "5", toId: "3", label: "M", lineStyle: "solid" },
    ],
  },
  sequence: {
    shapes: [
      { id: "1", type: "rectangle", x: 50, y: 30, width: 120, height: 50, text: "Client", color: "#0891b2", textColor: "#ffffff" },
      { id: "2", type: "rectangle", x: 300, y: 30, width: 120, height: 50, text: "API Gateway", color: "#7c3aed", textColor: "#ffffff" },
      { id: "3", type: "rectangle", x: 550, y: 30, width: 120, height: 50, text: "Service", color: "#059669", textColor: "#ffffff" },
      { id: "4", type: "rectangle", x: 800, y: 30, width: 120, height: 50, text: "Database", color: "#d97706", textColor: "#ffffff" },
      { id: "5", type: "rounded-rect", x: 50, y: 140, width: 200, height: 40, text: "POST /api/order", color: "#2563eb", textColor: "#ffffff" },
      { id: "6", type: "rounded-rect", x: 300, y: 240, width: 200, height: 40, text: "Validate & Route", color: "#db2777", textColor: "#ffffff" },
      { id: "7", type: "rounded-rect", x: 550, y: 340, width: 200, height: 40, text: "Process Order", color: "#0f172a", textColor: "#ffffff" },
      { id: "8", type: "rounded-rect", x: 800, y: 440, width: 200, height: 40, text: "INSERT INTO orders", color: "#d97706", textColor: "#ffffff" },
    ],
    connections: [
      { id: "c1", fromId: "5", toId: "6", label: "→", lineStyle: "dashed" },
      { id: "c2", fromId: "6", toId: "7", label: "→", lineStyle: "dashed" },
      { id: "c3", fromId: "7", toId: "8", label: "→", lineStyle: "dashed" },
    ],
  },
  architecture: {
    shapes: [
      { id: "1", type: "cloud", x: 50, y: 80, width: 140, height: 70, text: "CDN", color: "#0891b2", textColor: "#ffffff" },
      { id: "2", type: "hexagon", x: 280, y: 80, width: 140, height: 70, text: "API Gateway", color: "#7c3aed", textColor: "#ffffff" },
      { id: "3", type: "rectangle", x: 100, y: 240, width: 140, height: 70, text: "Auth Service", color: "#059669", textColor: "#ffffff" },
      { id: "4", type: "rectangle", x: 280, y: 240, width: 140, height: 70, text: "App Service", color: "#dc2626", textColor: "#ffffff" },
      { id: "5", type: "rectangle", x: 460, y: 240, width: 140, height: 70, text: "Worker", color: "#d97706", textColor: "#ffffff" },
      { id: "6", type: "cylinder", x: 100, y: 380, width: 140, height: 80, text: "Users DB", color: "#2563eb", textColor: "#ffffff" },
      { id: "7", type: "cylinder", x: 280, y: 380, width: 140, height: 80, text: "App DB", color: "#db2777", textColor: "#ffffff" },
      { id: "8", type: "cloud", x: 460, y: 380, width: 140, height: 80, text: "S3 Storage", color: "#0f172a", textColor: "#ffffff" },
    ],
    connections: [
      { id: "c1", fromId: "1", toId: "2", label: "", lineStyle: "solid" },
      { id: "c2", fromId: "2", toId: "3", label: "", lineStyle: "solid" },
      { id: "c3", fromId: "2", toId: "4", label: "", lineStyle: "solid" },
      { id: "c4", fromId: "4", toId: "5", label: "", lineStyle: "dashed" },
      { id: "c5", fromId: "3", toId: "6", label: "", lineStyle: "solid" },
      { id: "c6", fromId: "4", toId: "7", label: "", lineStyle: "solid" },
      { id: "c7", fromId: "5", toId: "8", label: "", lineStyle: "dashed" },
    ],
  },
};

const MODE_ICONS: Record<DiagramMode, React.ComponentType<{ className?: string }>> = {
  flowchart: Workflow,
  mindmap: Brain,
  er: Database,
  sequence: GitMerge,
  architecture: Layers,
};

const MODE_LABELS: Record<DiagramMode, string> = {
  flowchart: "Flowchart",
  mindmap: "Mind Map",
  er: "ER Diagram",
  sequence: "Sequence",
  architecture: "Architecture",
};

// ─── Component ───────────────────────────────────────────────────────────────

export function DiagramMakerEngine() {
  const [mode, setMode] = useState<DiagramMode>("flowchart");
  const [diagram, setDiagram] = useState<DiagramState>(MODE_TEMPLATES.flowchart);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<Shape["type"]>("rectangle");
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; startX: number; startY: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [undoStack, setUndoStack] = useState<DiagramState[]>([]);

  const pushUndo = useCallback(() => {
    setUndoStack((prev) => [...prev.slice(-30), JSON.parse(JSON.stringify(diagram))]);
  }, [diagram]);

  const undo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    setDiagram(prev);
  };

  const switchMode = (newMode: DiagramMode) => {
    setMode(newMode);
    setDiagram(JSON.parse(JSON.stringify(MODE_TEMPLATES[newMode])));
    setSelectedShape(null);
    setConnectingFrom(null);
    setUndoStack([]);
    setSelectedTool(MODE_SHAPES[newMode][0].type);
  };

  const addShape = (x: number, y: number) => {
    pushUndo();
    const newShape: Shape = {
      id: Date.now().toString(),
      type: selectedTool,
      x: (x - pan.x) / zoom - 80,
      y: (y - pan.y) / zoom - 30,
      width: selectedTool === "cylinder" ? 140 : 160,
      height: selectedTool === "cylinder" ? 80 : 60,
      text: selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1),
      color: SHAPE_COLORS[diagram.shapes.length % SHAPE_COLORS.length],
      textColor: "#ffffff",
    };
    setDiagram((prev) => ({ ...prev, shapes: [...prev.shapes, newShape] }));
  };

  const updateShape = (id: string, updates: Partial<Shape>) => {
    pushUndo();
    setDiagram((prev) => ({
      ...prev,
      shapes: prev.shapes.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const deleteShape = (id: string) => {
    pushUndo();
    setDiagram((prev) => ({
      shapes: prev.shapes.filter((s) => s.id !== id),
      connections: prev.connections.filter((c) => c.fromId !== id && c.toId !== id),
    }));
    setSelectedShape(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (connectingFrom) return;
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains("canvas-bg")) {
      setSelectedShape(null);
      if (selectedTool !== "text") {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) addShape(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const handleShapeMouseDown = (e: React.MouseEvent, shapeId: string) => {
    e.stopPropagation();
    setSelectedShape(shapeId);
    setDragging({ id: shapeId, startX: e.clientX, startY: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: pan.x + e.clientX - panStart.x, y: pan.y + e.clientY - panStart.y });
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }
    if (!dragging) return;
    const dx = (e.clientX - dragging.startX) / zoom;
    const dy = (e.clientY - dragging.startY) / zoom;
    setDiagram((prev) => ({
      ...prev,
      shapes: prev.shapes.map((s) =>
        s.id === dragging.id ? { ...s, x: s.x + dx, y: s.y + dy } : s
      ),
    }));
    setDragging({ id: dragging.id, startX: e.clientX, startY: e.clientY });
  };

  const handleMouseUp = () => {
    if (dragging) pushUndo();
    setDragging(null);
    setIsPanning(false);
  };

  const handleShapeDoubleClick = (shapeId: string) => {
    if (connectingFrom && connectingFrom !== shapeId) {
      pushUndo();
      setDiagram((prev) => ({
        ...prev,
        connections: [...prev.connections, { id: `c${Date.now()}`, fromId: connectingFrom, toId: shapeId, label: "", lineStyle: "solid" }],
      }));
      setConnectingFrom(null);
    }
  };

  const startConnection = (shapeId: string) => {
    setConnectingFrom(shapeId);
    setSelectedShape(shapeId);
  };

  const deleteConnection = (connId: string) => {
    pushUndo();
    setDiagram((prev) => ({ ...prev, connections: prev.connections.filter((c) => c.id !== connId) }));
  };

  const exportSVG = () => {
    const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
    </marker>
  </defs>
  ${diagram.connections
    .map((conn) => {
      const from = diagram.shapes.find((s) => s.id === conn.fromId);
      const to = diagram.shapes.find((s) => s.id === conn.toId);
      if (!from || !to) return "";
      const x1 = from.x + from.width / 2;
      const y1 = from.y + from.height / 2;
      const x2 = to.x + to.width / 2;
      const y2 = to.y + to.height / 2;
      const dash = conn.lineStyle === "dashed" ? ' stroke-dasharray="8,4"' : conn.lineStyle === "dotted" ? ' stroke-dasharray="2,4"' : "";
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#64748b" stroke-width="2"${dash} marker-end="url(#arrowhead)" />`;
    })
    .join("\n")}
  ${diagram.shapes
    .map((shape) => {
      let shapeSvg = "";
      const rx = shape.type === "rounded-rect" ? 8 : 0;
      switch (shape.type) {
        case "circle":
          shapeSvg = `<ellipse cx="${shape.x + shape.width / 2}" cy="${shape.y + shape.height / 2}" rx="${shape.width / 2}" ry="${shape.height / 2}" fill="${shape.color}" stroke="#1e293b" stroke-width="2"/>`;
          break;
        case "diamond":
          shapeSvg = `<polygon points="${shape.x + shape.width / 2},${shape.y} ${shape.x + shape.width},${shape.y + shape.height / 2} ${shape.x + shape.width / 2},${shape.y + shape.height} ${shape.x},${shape.y + shape.height / 2}" fill="${shape.color}" stroke="#1e293b" stroke-width="2"/>`;
          break;
        case "hexagon":
          const hw = shape.width / 2, hh = shape.height / 2, cx = shape.x + hw, cy = shape.y + hh;
          shapeSvg = `<polygon points="${cx - hw * 0.5},${cy - hh} ${cx + hw * 0.5},${cy - hh} ${cx + hw},${cy} ${cx + hw * 0.5},${cy + hh} ${cx - hw * 0.5},${cy + hh} ${cx - hw},${cy}" fill="${shape.color}" stroke="#1e293b" stroke-width="2"/>`;
          break;
        case "triangle":
          shapeSvg = `<polygon points="${shape.x + shape.width / 2},${shape.y} ${shape.x + shape.width},${shape.y + shape.height} ${shape.x},${shape.y + shape.height}" fill="${shape.color}" stroke="#1e293b" stroke-width="2"/>`;
          break;
        case "cylinder":
          shapeSvg = `<rect x="${shape.x}" y="${shape.y + 10}" width="${shape.width}" height="${shape.height - 20}" fill="${shape.color}" stroke="#1e293b" stroke-width="2"/>
            <ellipse cx="${shape.x + shape.width / 2}" cy="${shape.y + 10}" rx="${shape.width / 2}" ry="10" fill="${shape.color}" stroke="#1e293b" stroke-width="2"/>
            <ellipse cx="${shape.x + shape.width / 2}" cy="${shape.y + shape.height - 10}" rx="${shape.width / 2}" ry="10" fill="${shape.color}" stroke="#1e293b" stroke-width="2"/>`;
          break;
        case "cloud":
          shapeSvg = `<ellipse cx="${shape.x + shape.width * 0.3}" cy="${shape.y + shape.height * 0.6}" rx="${shape.width * 0.35}" ry="${shape.height * 0.35}" fill="${shape.color}" stroke="#1e293b" stroke-width="2"/>
            <ellipse cx="${shape.x + shape.width * 0.7}" cy="${shape.y + shape.height * 0.55}" rx="${shape.width * 0.3}" ry="${shape.height * 0.4}" fill="${shape.color}" stroke="#1e293b" stroke-width="2"/>
            <ellipse cx="${shape.x + shape.width * 0.5}" cy="${shape.y + shape.height * 0.35}" rx="${shape.width * 0.4}" ry="${shape.height * 0.35}" fill="${shape.color}" stroke="#1e293b" stroke-width="2"/>`;
          break;
        case "parallelogram":
          shapeSvg = `<polygon points="${shape.x + 20},${shape.y} ${shape.x + shape.width},${shape.y} ${shape.x + shape.width - 20},${shape.y + shape.height} ${shape.x},${shape.y + shape.height}" fill="${shape.color}" stroke="#1e293b" stroke-width="2"/>`;
          break;
        default:
          shapeSvg = `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" rx="${rx}" fill="${shape.color}" stroke="#1e293b" stroke-width="2"/>`;
      }
      const lines = shape.text.split("\n");
      if (lines.length === 1) {
        shapeSvg += `<text x="${shape.x + shape.width / 2}" y="${shape.y + shape.height / 2 + 5}" text-anchor="middle" fill="${shape.textColor}" font-size="14" font-family="Inter, sans-serif">${shape.text}</text>`;
      } else {
        lines.forEach((line, i) => {
          shapeSvg += `<text x="${shape.x + shape.width / 2}" y="${shape.y + 20 + i * 18}" text-anchor="middle" fill="${shape.textColor}" font-size="12" font-family="Inter, sans-serif">${line}</text>`;
        });
      }
      return shapeSvg;
    })
    .join("\n")}
</svg>`;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${mode}-diagram.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedShapeData = diagram.shapes.find((s) => s.id === selectedShape);
  const currentShapes = MODE_SHAPES[mode];

  // Shape rendering helper
  const getShapeStyle = (shape: Shape) => {
    const base: React.CSSProperties = {
      left: shape.x,
      top: shape.y,
      width: shape.width,
      height: shape.height,
      backgroundColor: shape.color,
      color: shape.textColor,
    };

    switch (shape.type) {
      case "circle":
        return { ...base, borderRadius: "50%" };
      case "rounded-rect":
        return { ...base, borderRadius: "12px" };
      case "diamond":
        return { ...base, clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" };
      case "hexagon":
        return { ...base, clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" };
      case "triangle":
        return { ...base, clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" };
      case "cylinder":
        return { ...base, borderRadius: "8px 8px 0 0", borderBottom: "4px solid rgba(0,0,0,0.2)" };
      case "parallelogram":
        return { ...base, clipPath: "polygon(12% 0%, 100% 0%, 88% 100%, 0% 100%)" };
      case "cloud":
        return { ...base, borderRadius: "40px", backgroundColor: shape.color, opacity: 0.9 };
      default:
        return { ...base, borderRadius: "4px" };
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Mode Selector ── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          {(Object.keys(MODE_TEMPLATES) as DiagramMode[]).map((m) => {
            const Icon = MODE_ICONS[m];
            return (
              <Button
                key={m}
                variant={mode === m ? "default" : "ghost"}
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => switchMode(m)}
              >
                <Icon className="h-3.5 w-3.5" /> {MODE_LABELS[m]}
              </Button>
            );
          })}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          {currentShapes.map((st) => (
            <Button
              key={st.type}
              variant={selectedTool === st.type ? "default" : "ghost"}
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => { setSelectedTool(st.type); setConnectingFrom(null); }}
            >
              <st.icon className="h-3.5 w-3.5" /> {st.label}
            </Button>
          ))}
        </div>
        <Separator orientation="vertical" className="h-8" />
        <Button
          variant={connectingFrom ? "default" : "outline"}
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => setConnectingFrom(null)}
        >
          <GitBranch className="h-3.5 w-3.5" />
          {connectingFrom ? "Connecting... (dbl-click target)" : "Connect"}
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={undo} disabled={undoStack.length === 0}>
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom((z) => Math.min(2, z + 0.1))}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={exportSVG}>
          <Download className="h-3.5 w-3.5" /> Export SVG
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Canvas */}
        <div className="lg:col-span-3">
          <div
            ref={canvasRef}
            className="canvas-bg relative w-full h-[500px] rounded-xl border-2 border-dashed border-muted-foreground/20 overflow-hidden bg-[radial-gradient(circle,#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(circle,#1e293b_1px,transparent_1px)] bg-[size:20px_20px] cursor-crosshair"
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseDown={(e) => {
              if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains("canvas-bg")) {
                setIsPanning(true);
                setPanStart({ x: e.clientX, y: e.clientY });
              }
            }}
          >
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "0 0",
              }}
            >
              {/* Connections */}
              <svg className="absolute inset-0 pointer-events-none" style={{ width: "4000px", height: "4000px", left: "-2000px", top: "-2000px" }}>
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                  </marker>
                </defs>
                {diagram.connections.map((conn) => {
                  const from = diagram.shapes.find((s) => s.id === conn.fromId);
                  const to = diagram.shapes.find((s) => s.id === conn.toId);
                  if (!from || !to) return null;
                  const x1 = from.x + from.width / 2;
                  const y1 = from.y + from.height / 2;
                  const x2 = to.x + to.width / 2;
                  const y2 = to.y + to.height / 2;
                  const dashArray = conn.lineStyle === "dashed" ? "8,4" : conn.lineStyle === "dotted" ? "2,4" : undefined;
                  return (
                    <g key={conn.id}>
                      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#64748b" strokeWidth="2"
                        strokeDasharray={dashArray} markerEnd="url(#arrowhead)" />
                      {conn.label && (
                        <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 8} textAnchor="middle" fill="#64748b" fontSize="12" fontFamily="Inter">
                          {conn.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Shapes */}
              {diagram.shapes.map((shape) => {
                const isSelected = selectedShape === shape.id;
                const isConnecting = connectingFrom === shape.id;
                return (
                  <div
                    key={shape.id}
                    className={`absolute flex items-center justify-center cursor-move select-none transition-shadow ${
                      isSelected ? "ring-2 ring-primary ring-offset-2 z-10" : ""
                    } ${isConnecting ? "ring-2 ring-amber-500 ring-offset-2 z-10" : ""}`}
                    style={getShapeStyle(shape)}
                    onMouseDown={(e) => handleShapeMouseDown(e, shape.id)}
                    onDoubleClick={() => handleShapeDoubleClick(shape.id)}
                  >
                    <span className="text-sm font-medium px-2 text-center pointer-events-none whitespace-pre-line leading-tight">
                      {shape.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="space-y-3">
          {selectedShapeData ? (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Properties</CardTitle>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteShape(selectedShapeData.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Text</label>
                  <Input
                    value={selectedShapeData.text}
                    onChange={(e) => updateShape(selectedShapeData.id, { text: e.target.value })}
                    className="h-8 text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Color</label>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {SHAPE_COLORS.map((c) => (
                      <button
                        key={c}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${selectedShapeData.color === c ? "border-foreground scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: c }}
                        onClick={() => updateShape(selectedShapeData.id, { color: c })}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Width</label>
                    <Input
                      type="number"
                      value={selectedShapeData.width}
                      onChange={(e) => updateShape(selectedShapeData.id, { width: parseInt(e.target.value) || 100 })}
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Height</label>
                    <Input
                      type="number"
                      value={selectedShapeData.height}
                      onChange={(e) => updateShape(selectedShapeData.id, { height: parseInt(e.target.value) || 40 })}
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => startConnection(selectedShapeData.id)}>
                  <GitBranch className="h-3.5 w-3.5 mr-1.5" /> Connect From Here
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-4 text-center text-sm text-muted-foreground">
                <MousePointer2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Click a shape to edit it</p>
                <p className="text-xs mt-1">Click canvas to add shapes</p>
                <p className="text-xs mt-1">Double-click to connect</p>
              </CardContent>
            </Card>
          )}

          {/* Connections list */}
          {diagram.connections.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Connections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {diagram.connections.map((conn) => {
                  const from = diagram.shapes.find((s) => s.id === conn.fromId);
                  const to = diagram.shapes.find((s) => s.id === conn.toId);
                  return (
                    <div key={conn.id} className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-muted/50">
                      <span className="truncate flex-1">{from?.text?.split("\n")[0] || "?"} → {to?.text?.split("\n")[0] || "?"}</span>
                      <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={() => deleteConnection(conn.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}