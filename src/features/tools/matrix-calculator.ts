// Matrix Calculator utility functions

export type Matrix = number[][];

export function parseMatrix(text: string): Matrix | null {
  try {
    const rows = text.trim().split("\n").filter(r => r.trim());
    const matrix = rows.map(row =>
      row.split(/[\s,]+/).map(v => {
        const n = Number(v.trim());
        if (isNaN(n)) throw new Error("Invalid number");
        return n;
      })
    );
    if (matrix.length === 0) return null;
    const cols = matrix[0].length;
    if (matrix.some(row => row.length !== cols)) return null;
    return matrix;
  } catch {
    return null;
  }
}

export function matrixToString(matrix: Matrix): string {
  return matrix.map(row => row.join("\t")).join("\n");
}

export function addMatrices(a: Matrix, b: Matrix): Matrix | null {
  if (a.length !== b.length || a[0].length !== b[0].length) return null;
  return a.map((row, i) => row.map((val, j) => val + b[i][j]));
}

export function subtractMatrices(a: Matrix, b: Matrix): Matrix | null {
  if (a.length !== b.length || a[0].length !== b[0].length) return null;
  return a.map((row, i) => row.map((val, j) => val - b[i][j]));
}

export function multiplyMatrices(a: Matrix, b: Matrix): Matrix | null {
  if (a[0].length !== b.length) return null;
  const result: Matrix = [];
  for (let i = 0; i < a.length; i++) {
    result[i] = [];
    for (let j = 0; j < b[0].length; j++) {
      let sum = 0;
      for (let k = 0; k < a[0].length; k++) {
        sum += a[i][k] * b[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
}

export function scalarMultiply(matrix: Matrix, scalar: number): Matrix {
  return matrix.map(row => row.map(val => val * scalar));
}

export function transpose(matrix: Matrix): Matrix {
  const result: Matrix = [];
  for (let j = 0; j < matrix[0].length; j++) {
    result[j] = [];
    for (let i = 0; i < matrix.length; i++) {
      result[j][i] = matrix[i][j];
    }
  }
  return result;
}

export function determinant(matrix: Matrix): number | null {
  const n = matrix.length;
  if (n !== matrix[0].length) return null; // Not square
  if (n === 1) return matrix[0][0];
  if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  if (n === 3) {
    return (
      matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
      matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
      matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0])
    );
  }
  // For larger matrices, use Laplace expansion (recursive)
  let det = 0;
  for (let j = 0; j < n; j++) {
    det += matrix[0][j] * cofactor(matrix, 0, j);
  }
  return det;
}

function cofactor(matrix: Matrix, row: number, col: number): number {
  const subMatrix = matrix
    .filter((_, i) => i !== row)
    .map(r => r.filter((_, j) => j !== col));
  const sign = (row + col) % 2 === 0 ? 1 : -1;
  return sign * (determinant(subMatrix) ?? 0);
}

export function inverse(matrix: Matrix): Matrix | null {
  const det = determinant(matrix);
  if (det === null || det === 0) return null;
  const n = matrix.length;
  const adjugate: Matrix = [];
  for (let i = 0; i < n; i++) {
    adjugate[i] = [];
    for (let j = 0; j < n; j++) {
      adjugate[i][j] = cofactor(matrix, j, i) / det;
    }
  }
  return adjugate;
}

export function identityMatrix(size: number): Matrix {
  return Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => (i === j ? 1 : 0))
  );
}

export const MATRIX_OPERATIONS = [
  { value: "add", label: "A + B" },
  { value: "subtract", label: "A - B" },
  { value: "multiply", label: "A × B" },
  { value: "scalar", label: "k × A" },
  { value: "transpose", label: "Aᵀ" },
  { value: "determinant", label: "det(A)" },
  { value: "inverse", label: "A⁻¹" },
] as const;