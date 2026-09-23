"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  parseMatrix, matrixToString, matrixToLatex, addMatrices, subtractMatrices,
  multiplyMatrices, scalarMultiply, transpose, determinant, inverse,
  matrixPower, trace, matrixRank, identityMatrix, zeroMatrix, randomMatrix,
  MATRIX_OPERATIONS, type Matrix,
} from "@/features/tools/matrix-calculator";
import { ArrowLeftRight, Copy, Check, Sparkles, RefreshCw, Equal } from "lucide-react";

export function MatrixCalculatorEngine() {
  const [matrixA, setMatrixA] = useState("1 2 3\n0 1 4\n5 6 0");
  const [matrixB, setMatrixB] = useState("2 0 -1\n1 3 2\n0 -2 1");
  const [scalar, setScalar] = useState("2");
  const [power, setPower] = useState("2");
  const [operation, setOperation] = useState("multiply");
  const [resultMatrix, setResultMatrix] = useState<Matrix | null>(null);
  const [scalarResult, setScalarResult] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleCalculate = () => {
    setError("");
    setResultMatrix(null);
    setScalarResult(null);

    const a = parseMatrix(matrixA);
    if (!a) {
      setError("Matrix A has invalid format or mismatched column counts.");
      return;
    }

    switch (operation) {
      case "add":
      case "subtract": {
        const b = parseMatrix(matrixB);
        if (!b) {
          setError("Matrix B has invalid format.");
          return;
        }
        const res = operation === "add" ? addMatrices(a, b) : subtractMatrices(a, b);
        if (!res) {
          setError(`Matrices must have identical dimensions. Matrix A is ${a.length}×${a[0].length}, Matrix B is ${b.length}×${b[0].length}.`);
          return;
        }
        setResultMatrix(res);
        break;
      }
      case "multiply": {
        const b = parseMatrix(matrixB);
        if (!b) {
          setError("Matrix B has invalid format.");
          return;
        }
        const res = multiplyMatrices(a, b);
        if (!res) {
          setError(`Cannot multiply: columns of Matrix A (${a[0].length}) must equal rows of Matrix B (${b.length}).`);
          return;
        }
        setResultMatrix(res);
        break;
      }
      case "scalar": {
        const k = Number(scalar);
        if (isNaN(k)) {
          setError("Invalid scalar value.");
          return;
        }
        setResultMatrix(scalarMultiply(a, k));
        break;
      }
      case "power": {
        const p = parseInt(power, 10);
        if (isNaN(p) || p < 0) {
          setError("Power must be a non-negative integer.");
          return;
        }
        const res = matrixPower(a, p);
        if (!res) {
          setError("Matrix power requires a square matrix.");
          return;
        }
        setResultMatrix(res);
        break;
      }
      case "transpose": {
        setResultMatrix(transpose(a));
        break;
      }
      case "determinant": {
        const det = determinant(a);
        if (det === null) {
          setError("Determinant can only be calculated for square matrices.");
          return;
        }
        setScalarResult(`det(A) = ${det}`);
        break;
      }
      case "inverse": {
        const inv = inverse(a);
        if (!inv) {
          setError("Matrix is singular (determinant = 0 or non-square). Inverse does not exist.");
          return;
        }
        setResultMatrix(inv);
        break;
      }
      case "trace": {
        const tr = trace(a);
        if (tr === null) {
          setError("Trace requires a square matrix.");
          return;
        }
        setScalarResult(`tr(A) = ${tr}`);
        break;
      }
      case "rank": {
        const r = matrixRank(a);
        setScalarResult(`rank(A) = ${r}`);
        break;
      }
    }
  };

  const handlePreset = (target: "A" | "B", type: "identity3" | "zero3" | "random3") => {
    let m: Matrix;
    if (type === "identity3") m = identityMatrix(3);
    else if (type === "zero3") m = zeroMatrix(3, 3);
    else m = randomMatrix(3, 3);

    const str = matrixToString(m);
    if (target === "A") setMatrixA(str);
    else setMatrixB(str);
  };

  const swapAB = () => {
    const temp = matrixA;
    setMatrixA(matrixB);
    setMatrixB(temp);
  };

  const copyResultToA = () => {
    if (resultMatrix) {
      setMatrixA(matrixToString(resultMatrix));
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 1500);
  };

  const needsMatrixB = ["add", "subtract", "multiply"].includes(operation);
  const needsScalar = operation === "scalar";
  const needsPower = operation === "power";

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="flex flex-wrap gap-3 items-end p-4 rounded-xl border bg-card/60">
        <div className="flex-1 min-w-[200px]">
          <Label className="text-xs mb-1.5 block font-medium">Operation</Label>
          <Select value={operation} onValueChange={(v) => setOperation(v || "multiply")}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MATRIX_OPERATIONS.map(op => (
                <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {needsScalar && (
          <div className="w-28">
            <Label className="text-xs mb-1.5 block font-medium">Scalar (k)</Label>
            <Input
              type="number"
              value={scalar}
              onChange={e => setScalar(e.target.value)}
              className="h-9 font-mono"
            />
          </div>
        )}

        {needsPower && (
          <div className="w-28">
            <Label className="text-xs mb-1.5 block font-medium">Power (k)</Label>
            <Input
              type="number"
              min={0}
              max={15}
              value={power}
              onChange={e => setPower(e.target.value)}
              className="h-9 font-mono"
            />
          </div>
        )}

        <Button onClick={handleCalculate} className="gap-2 h-9 px-5">
          <Equal className="h-4 w-4" /> Calculate
        </Button>

        {needsMatrixB && (
          <Button variant="outline" size="sm" onClick={swapAB} className="h-9 gap-1.5">
            <ArrowLeftRight className="h-3.5 w-3.5" /> Swap A ↔ B
          </Button>
        )}
      </div>

      {/* Matrices Input */}
      <div className={`grid ${needsMatrixB ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-4`}>
        {/* Matrix A */}
        <Card>
          <CardHeader className="py-2.5 px-4 flex flex-row items-center justify-between border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span>Matrix A</span>
              {parseMatrix(matrixA) && (
                <Badge variant="outline" className="font-mono text-xs">
                  {parseMatrix(matrixA)!.length} × {parseMatrix(matrixA)![0].length}
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => handlePreset("A", "identity3")}>I₃</Button>
              <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => handlePreset("A", "zero3")}>0</Button>
              <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => handlePreset("A", "random3")}>
                <Sparkles className="h-3 w-3 mr-1" /> Rand
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <Textarea
              value={matrixA}
              onChange={e => setMatrixA(e.target.value)}
              className="font-mono text-sm min-h-[120px] leading-relaxed resize-y"
              placeholder="1 2 3&#10;0 1 4&#10;5 6 0"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Separate elements with spaces or commas, rows with newlines.
            </p>
          </CardContent>
        </Card>

        {/* Matrix B */}
        {needsMatrixB && (
          <Card>
            <CardHeader className="py-2.5 px-4 flex flex-row items-center justify-between border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span>Matrix B</span>
                {parseMatrix(matrixB) && (
                  <Badge variant="outline" className="font-mono text-xs">
                    {parseMatrix(matrixB)!.length} × {parseMatrix(matrixB)![0].length}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => handlePreset("B", "identity3")}>I₃</Button>
                <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => handlePreset("B", "zero3")}>0</Button>
                <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => handlePreset("B", "random3")}>
                  <Sparkles className="h-3 w-3 mr-1" /> Rand
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <Textarea
                value={matrixB}
                onChange={e => setMatrixB(e.target.value)}
                className="font-mono text-sm min-h-[120px] leading-relaxed resize-y"
                placeholder="2 0 -1&#10;1 3 2&#10;0 -2 1"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Separate elements with spaces or commas, rows with newlines.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-3 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {/* Scalar Result (Determinant, Trace, Rank) */}
      {scalarResult && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Scalar Result</span>
              <p className="font-mono text-2xl font-bold text-foreground mt-0.5">{scalarResult}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(scalarResult, "scalar")}
              className="gap-1.5"
            >
              {copiedType === "scalar" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              Copy
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Matrix Result */}
      {resultMatrix && (
        <Card>
          <CardHeader className="py-2.5 px-4 flex flex-row items-center justify-between border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span>Result Matrix</span>
              <Badge variant="secondary" className="font-mono text-xs">
                {resultMatrix.length} × {resultMatrix[0].length}
              </Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={copyResultToA}
              >
                <RefreshCw className="h-3 w-3" /> Set as Matrix A
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <Tabs defaultValue="visual">
              <TabsList className="mb-3">
                <TabsTrigger value="visual">Visual Grid</TabsTrigger>
                <TabsTrigger value="text">Raw Text</TabsTrigger>
                <TabsTrigger value="latex">LaTeX Code</TabsTrigger>
              </TabsList>

              <TabsContent value="visual">
                <div className="overflow-x-auto p-4 bg-muted/40 rounded-lg flex justify-center">
                  <div className="inline-flex border-l-2 border-r-2 border-foreground/70 px-3 py-2 rounded-sm">
                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${resultMatrix[0].length}, minmax(48px, 1fr))` }}>
                      {resultMatrix.flatMap((row, rIdx) =>
                        row.map((val, cIdx) => (
                          <div
                            key={`${rIdx}-${cIdx}`}
                            className="h-10 px-3 flex items-center justify-center font-mono text-sm bg-background border rounded shadow-xs"
                          >
                            {val}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="text" className="space-y-2">
                <pre className="font-mono text-sm bg-muted p-3 rounded-lg overflow-x-auto">
                  {matrixToString(resultMatrix)}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(matrixToString(resultMatrix), "text")}
                  className="gap-1.5"
                >
                  {copiedType === "text" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy Text
                </Button>
              </TabsContent>

              <TabsContent value="latex" className="space-y-2">
                <pre className="font-mono text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                  {matrixToLatex(resultMatrix)}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(matrixToLatex(resultMatrix), "latex")}
                  className="gap-1.5"
                >
                  {copiedType === "latex" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy LaTeX
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}