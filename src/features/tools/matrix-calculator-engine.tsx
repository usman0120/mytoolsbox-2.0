"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  parseMatrix, matrixToString, addMatrices, subtractMatrices,
  multiplyMatrices, scalarMultiply, transpose, determinant, inverse,
  MATRIX_OPERATIONS, type Matrix,
} from "@/features/tools/matrix-calculator";
import { Grid3X3, ArrowUpDown, Equal } from "lucide-react";

export function MatrixCalculatorEngine() {
  const [matrixA, setMatrixA] = useState("1 2 3\n4 5 6\n7 8 9");
  const [matrixB, setMatrixB] = useState("9 8 7\n6 5 4\n3 2 1");
  const [scalar, setScalar] = useState("2");
  const [operation, setOperation] = useState("add");
  const [result, setResult] = useState<Matrix | null>(null);
  const [resultText, setResultText] = useState("");
  const [error, setError] = useState("");

  const handleCalculate = () => {
    setError("");
    setResult(null);
    setResultText("");

    const a = parseMatrix(matrixA);
    if (!a) { setError("Invalid Matrix A"); return; }

    let res: Matrix | null = null;
    let text = "";

    switch (operation) {
      case "add":
      case "subtract": {
        const b = parseMatrix(matrixB);
        if (!b) { setError("Invalid Matrix B"); return; }
        res = operation === "add" ? addMatrices(a, b) : subtractMatrices(a, b);
        if (!res) { setError("Matrices must have the same dimensions"); return; }
        break;
      }
      case "multiply": {
        const b = parseMatrix(matrixB);
        if (!b) { setError("Invalid Matrix B"); return; }
        res = multiplyMatrices(a, b);
        if (!res) { setError("A columns must equal B rows for multiplication"); return; }
        break;
      }
      case "scalar": {
        const k = Number(scalar);
        if (isNaN(k)) { setError("Invalid scalar value"); return; }
        res = scalarMultiply(a, k);
        break;
      }
      case "transpose":
        res = transpose(a);
        break;
      case "determinant": {
        const det = determinant(a);
        if (det === null) { setError("Matrix must be square for determinant"); return; }
        text = `det(A) = ${det}`;
        break;
      }
      case "inverse": {
        res = inverse(a);
        if (!res) { setError("Matrix is singular (determinant = 0), no inverse exists"); return; }
        break;
      }
    }

    if (res) text = matrixToString(res);
    setResult(res);
    setResultText(text);
  };

  const needsMatrixB = ["add", "subtract", "multiply"].includes(operation);
  const needsScalar = operation === "scalar";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="w-45">
          <Label className="text-xs mb-1 block">Operation</Label>
          <Select value={operation} onValueChange={(v) => setOperation(v || "add")}>
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
          <div className="w-25">
            <Label className="text-xs mb-1 block">Scalar k</Label>
            <Input value={scalar} onChange={e => setScalar(e.target.value)} className="h-9" />
          </div>
        )}
        <Button onClick={handleCalculate} className="gap-2 h-9">
          <Equal className="h-4 w-4" /> Calculate
        </Button>
      </div>

      <div className={`grid ${needsMatrixB ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
        <div>
          <Label className="text-xs mb-1 block">Matrix A</Label>
          <Textarea
            value={matrixA}
            onChange={e => setMatrixA(e.target.value)}
            className="font-mono text-xs min-h-25"
            placeholder="1 2 3&#10;4 5 6&#10;7 8 9"
          />
        </div>
        {needsMatrixB && (
          <div>
            <Label className="text-xs mb-1 block">Matrix B</Label>
            <Textarea
              value={matrixB}
              onChange={e => setMatrixB(e.target.value)}
              className="font-mono text-xs min-h-25"
              placeholder="9 8 7&#10;6 5 4&#10;3 2 1"
            />
          </div>
        )}
      </div>

      {error && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-3 text-sm text-red-400">{error}</CardContent>
        </Card>
      )}

      {resultText && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="font-mono text-sm whitespace-pre bg-muted p-3 rounded-lg overflow-x-auto">
              {resultText}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}