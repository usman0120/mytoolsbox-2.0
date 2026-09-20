"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles, Download, Undo2, ZoomIn, ZoomOut, Trash2,
  Square, Circle, Diamond, GitBranch, MousePointer2,
  Loader2, Wand2, Brain, Workflow, Database, GitMerge, Layers,
  ArrowRight, Type, Hexagon, Triangle
} from "lucide-react";
import { complete } from "@/lib/ai";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DiagramShape {
  id: string;
  type: "rectangle" | "circle" | "diamond" | "rounded-rect" | "hexagon" | "triangle" | "cylinder" | "cloud" | "parallelogram" | "text";
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
  textColor: string;
}

interface DiagramConnection {
  id: string;
  fromId: string;
  toId: string;
  label: string;
  lineStyle: "solid" | "dashed" | "dotted";
}

interface DiagramState {
  shapes: DiagramShape[];
  connections: DiagramConnection[];
}

type DiagramType = "flowchart" | "mindmap" | "er" | "sequence" | "architecture";

// ─── Constants ───────────────────────────────────────────────────────────────

const SHAPE_COLORS = ["#0891b2", "#7c3aed", "#059669", "#dc2626", "#d97706", "#2563eb", "#db2777", "#0f172a"];

const DIAGRAM_TYPES: { type: DiagramType; icon: React.ComponentType<{ className?: string }>; label: string; description: string }[] = [
  { type: "flowchart", icon: Workflow, label: "Flowchart", description: "Process flows, decision trees, workflows" },
  { type: "mindmap", icon: Brain, label: "Mind Map", description: "Brainstorming, idea organization" },
  { type: "er", icon: Database, label: "ER Diagram", description: "Entity relationships, database schema" },
  { type: "sequence", icon: GitMerge, label: "Sequence", description: "API flows, message sequences" },
  { type: "architecture", icon: Layers, label: "Architecture", description: "System design, cloud infrastructure" },
];

const SHAPE_TYPES = [
  { type: "rectangle" as const, icon: Square, label: "Rectangle" },
  { type: "rounded-rect" as const, icon: Square, label: "Rounded" },
  { type: "circle" as const, icon: Circle, label: "Circle" },
  { type: "diamond" as const, icon: Diamond, label: "Diamond" },
  { type: "hexagon" as const, icon: Hexagon, label: "Hexagon" },
  { type: "triangle" as const, icon: Triangle, label: "Triangle" },
  { type: "cylinder" as const, icon: Square, label: "Database" },
  { type: "cloud" as const, icon: Square, label: "Cloud" },
  { type: "parallelogram" as const, icon: Square, label: "I/O" },
];

// ─── AI Prompt Templates ─────────────────────────────────────────────────────

function buildAIPrompt(description: string, diagramType: DiagramType): string {
  const basePrompt = `Generate a ${diagramType} diagram based on this description: "${description}"

Return ONLY a JSON object with this exact structure (no markdown, no explanation):
{
  "shapes": [
    {
      "id": "unique_id",
      "type": "rectangle|circle|diamond|rounded-rect|hexagon|triangle|cylinder|cloud|parallelogram",
      "x": number (position from left, space shapes 200-300px apart),
      "y": number (position from top, space rows 150-200px apart),
      "width": number (140-200),
      "height": number (50-100),
      "text": "label text",
      "color": "#hexcolor",
      "textColor": "#ffffff"
    }
  ],
  "connections": [
    {
      "id": "conn_id",
      "fromId": "source_shape_id",
      "toId": "target_shape_id",
      "label": "optional label",
      "lineStyle": "solid|dashed|dotted"
    }
  ]
}`;

  const typeGuides: Record<DiagramType, string> = {
    flowchart: `
Flowchart guidelines:
- Use rounded-rect for Start/End nodes
- Use rectangle for Process steps
- Use diamond for Decision/conditional nodes
- Use parallelogram for Input/Output
- Connect nodes in logical flow order
- Keep text concise (1-3 words)
- Colors: green for start, blue for processes, amber for decisions, red for end`,
    mindmap: `
Mind Map guidelines:
- Use circle for the central/main idea
- Use rounded-rect for main topics branching from center
- Use rectangle for subtopics
- Place central node at center (x:350, y:200)
- Radiate topics around the center
- Use varied colors for different branches
- Keep text short (1-3 words)`,
    er: `
ER Diagram guidelines:
- Use rectangle for entities (tables)
- Use diamond for relationships
- Use circle for attributes (optional)
- Include PK/FK notation in entity text (e.g., "User\\n───────\\nid (PK)\\nname\\nemail")
- Connect entities through relationship diamonds
- Label connections with cardinality (1, N, M)
- Space entities 250-350px apart`,
    sequence: `
Sequence Diagram guidelines:
- Use rectangle for participants/actors at the top
- Use rounded-rect for actions/messages below
- Arrange participants horizontally (spaced 200-250px)
- Stack actions vertically below participants
- Use dashed lines for message connections
- Label connections with arrow direction (→, ←)
- Keep action text descriptive but concise`,
    architecture: `
Architecture Diagram guidelines:
- Use rectangle for services/applications
- Use cylinder for databases
- Use cloud for external services
- Use hexagon for API gateways
- Use rounded-rect for components
- Arrange in layers: external → gateway → services → databases
- Connect with solid lines for sync, dashed for async
- Use distinct colors per layer`,
  };

  return basePrompt + "\n" + (typeGuides[diagramType] || "");
}

function parseAIResponse(text: string): DiagramState | null {
  try {
    // Try to extract JSON from the response (handle markdown code blocks)
    let jsonStr = text.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    const parsed = JSON.parse(jsonStr);

    if (!parsed.shapes || !Array.isArray(parsed.shapes)) return null;
    if (!parsed.connections || !Array.isArray(parsed.connections)) return null;

    // Validate and sanitize shapes
    const shapes: DiagramShape[] = parsed.shapes.map((s: Record<string, unknown>, i: number) => ({
      id: String(s.id || `s${i}`),
      type: ["rectangle", "circle", "diamond", "rounded-rect", "hexagon", "triangle", "cylinder", "cloud", "parallelogram", "text"].includes(String(s.type)) ? String(s.type) as DiagramShape["type"] : "rectangle",
      x: typeof s.x === "number" ? s.x : 100 + (i % 3) * 250,
      y: typeof s.y === "number" ? s.y : 100 + Math.floor(i / 3) * 180,
      width: typeof s.width === "number" ? s.width : 160,
      height: typeof s.height === "number" ? s.height : 60,
      text: String(s.text || "Node"),
      color: typeof s.color === "string" && s.color.startsWith("#") ? s.color : SHAPE_COLORS[i % SHAPE_COLORS.length],
      textColor: typeof s.textColor === "string" ? s.textColor : "#ffffff",
    }));

    // Validate and sanitize connections
    const shapeIds = new Set(shapes.map((s) => s.id));
    const connections: DiagramConnection[] = parsed.connections
      .filter((c: Record<string, unknown>) => shapeIds.has(String(c.fromId)) && shapeIds.has(String(c.toId)))
      .map((c: Record<string, unknown>, i: number) => ({
        id: String(c.id || `c${i}`),
        fromId: String(c.fromId),
        toId: String(c.toId),
        label: String(c.label || ""),
        lineStyle: ["solid", "dashed", "dotted"].includes(String(c.lineStyle)) ? String(c.lineStyle) as DiagramConnection["lineStyle"] : "solid",
      }));

    return { shapes, connections };
  } catch {
    return null;
  }
}

// ─── Offline Fallback Templates ──────────────────────────────────────────────

function getFallbackDiagram(description: string, diagramType: DiagramType): DiagramState {
  const lowerDesc = description.toLowerCase();

  // Detect keywords for smarter fallbacks
  const hasAuth = lowerDesc.includes("auth") || lowerDesc.includes("login") || lowerDesc.includes("user");
  const hasPayment = lowerDesc.includes("payment") || lowerDesc.includes("checkout") || lowerDesc.includes("order");
  const hasAPI = lowerDesc.includes("api") || lowerDesc.includes("rest") || lowerDesc.includes("endpoint");
  const hasDB = lowerDesc.includes("database") || lowerDesc.includes("schema") || lowerDesc.includes("table");

  if (diagramType === "flowchart") {
    if (hasAuth) {
      return {
        shapes: [
          { id: "1", type: "rounded-rect", x: 100, y: 200, width: 160, height: 60, text: "Start", color: "#059669", textColor: "#ffffff" },
          { id: "2", type: "rectangle", x: 350, y: 200, width: 160, height: 60, text: "Enter Credentials", color: "#0891b2", textColor: "#ffffff" },
          { id: "3", type: "diamond", x: 600, y: 180, width: 140, height: 100, text: "Valid?", color: "#d97706", textColor: "#ffffff" },
          { id: "4", type: "rectangle", x: 600, y: 340, width: 160, height: 60, text: "Show Error", color: "#dc2626", textColor: "#ffffff" },
          { id: "5", type: "rounded-rect", x: 850, y: 200, width: 160, height: 60, text: "Dashboard", color: "#059669", textColor: "#ffffff" },
        ],
        connections: [
          { id: "c1", fromId: "1", toId: "2", label: "", lineStyle: "solid" },
          { id: "c2", fromId: "2", toId: "3", label: "", lineStyle: "solid" },
          { id: "c3", fromId: "3", toId: "4", label: "No", lineStyle: "solid" },
          { id: "c4", fromId: "3", toId: "5", label: "Yes", lineStyle: "solid" },
          { id: "c5", fromId: "4", toId: "2", label: "Retry", lineStyle: "dashed" },
        ],
      };
    }
    return {
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
    };
  }

  if (diagramType === "architecture") {
    return {
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
    };
  }

  if (diagramType === "er") {
    return {
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
    };
  }

  if (diagramType === "sequence") {
    return {
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
    };
  }

  // mindmap fallback
  return {
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
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AIDiagramGeneratorEngine() {
  // Input
  const [description, setDescription] = useState("");
  const [diagramType, setDiagramType] = useState<DiagramType>("flowchart");

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedAI, setUsedAI] = useState(false);

  // Diagram state
  const [diagram, setDiagram] = useState<DiagramState>({ shapes: [], connections: [] });

  // Editing
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<DiagramShape["type"]>("rectangle");
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

  // ─── AI Generation ─────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setIsGenerating(true);
    setError(null);

    try {
      const prompt = buildAIPrompt(description.trim(), diagramType);
      const response = await complete({
        prompt,
        systemPrompt: "You are a diagram generation expert. Always respond with valid JSON only. Never include markdown formatting or explanations.",
        temperature: 0.3,
        maxTokens: 4000,
      });

      const parsed = parseAIResponse(response.text);
      if (parsed && parsed.shapes.length > 0) {
        setDiagram(parsed);
        setUsedAI(true);
        setUndoStack([]);
      } else {
        // Fallback to template
        setDiagram(getFallbackDiagram(description, diagramType));
        setUsedAI(false);
        setError("AI response couldn't be parsed. Using a template instead. You can edit it manually.");
      }
    } catch (err) {
      // Offline fallback
      setDiagram(getFallbackDiagram(description, diagramType));
      setUsedAI(false);
      setError("AI is unavailable (offline or API error). Using a template. You can edit it manually.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Manual Editing ────────────────────────────────────────────────────────

  const addShape = (x: number, y: number) => {
    pushUndo();
    const newShape: DiagramShape = {
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

  const updateShape = (id: string, updates: Partial<DiagramShape>) => {
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
    a.download = `${diagramType}-diagram.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedShapeData = diagram.shapes.find((s) => s.id === selectedShape);

  const getShapeStyle = (shape: DiagramShape): React.CSSProperties => {
    const base: React.CSSProperties = {
      left: shape.x,
      top: shape.y,
      width: shape.width,
      height: shape.height,
      backgroundColor: shape.color,
      color: shape.textColor,
    };
    switch (shape.type) {
      case "circle": return { ...base, borderRadius: "50%" };
      case "rounded-rect": return { ...base, borderRadius: "12px" };
      case "diamond": return { ...base, clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" };
      case "hexagon": return { ...base, clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" };
      case "triangle": return { ...base, clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" };
      case "cylinder": return { ...base, borderRadius: "8px 8px 0 0", borderBottom: "4px solid rgba(0,0,0,0.2)" };
      case "parallelogram": return { ...base, clipPath: "polygon(12% 0%, 100% 0%, 88% 100%, 0% 100%)" };
      case "cloud": return { ...base, borderRadius: "40px", opacity: 0.9 };
      default: return { ...base, borderRadius: "4px" };
    }
  };

  const hasDiagram = diagram.shapes.length > 0;

  return (
    <div className="space-y-4">
      {/* ── Generation Panel ── */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              <span className="font-medium text-sm">AI Diagram Generator</span>
              {usedAI && <Badge variant="secondary" className="text-xs">AI Generated</Badge>}
            </div>

            <div className="flex flex-wrap gap-2">
              {DIAGRAM_TYPES.map((dt) => (
                <Button
                  key={dt.type}
                  variant={diagramType === dt.type ? "default" : "outline"}
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={() => setDiagramType(dt.type)}
                >
                  <dt.icon className="h-3.5 w-3.5" /> {dt.label}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Textarea
                placeholder={`Describe your ${DIAGRAM_TYPES.find((d) => d.type === diagramType)?.label.toLowerCase()}...\n\ne.g., "User login flow with email verification and password reset"`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex-1 min-h-15 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    handleGenerate();
                  }
                }}
              />
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !description.trim()}
                className="h-auto gap-2 self-stretch"
              >
                {isGenerating ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> Generate</>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Describe what you want and AI will create the diagram. You can then edit it manually. Press Ctrl+Enter to generate.</p>

            {error && (
              <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded">
                {error}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Toolbar (shown when diagram exists) ── */}
      {hasDiagram && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            {SHAPE_TYPES.map((st) => (
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
      )}

      {/* ── Canvas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          {hasDiagram ? (
            <div
              ref={canvasRef}
              className="canvas-bg relative w-full h-125 rounded-xl border-2 border-dashed border-muted-foreground/20 overflow-hidden bg-[radial-gradient(circle,#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(circle,#1e293b_1px,transparent_1px)] bg-size-[20px_20px] cursor-crosshair"
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
          ) : (
            <div className="w-full h-125 rounded-xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center gap-3 bg-muted/10">
              <Brain className="h-12 w-12 text-muted-foreground/40" />
              <p className="text-muted-foreground text-sm">Describe your diagram above and click Generate</p>
              <p className="text-xs text-muted-foreground/70">AI will create the diagram, then you can edit it here</p>
            </div>
          )}
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
          ) : hasDiagram ? (
            <Card>
              <CardContent className="p-4 text-center text-sm text-muted-foreground">
                <MousePointer2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Click a shape to edit it</p>
                <p className="text-xs mt-1">Click canvas to add shapes</p>
                <p className="text-xs mt-1">Double-click to connect</p>
              </CardContent>
            </Card>
          ) : null}

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