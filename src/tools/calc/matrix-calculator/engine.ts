// Matrix Calculator utility functions

export type Matrix = number[][];

export function parseMatrix(text: string): Matrix | null {
  try {
    const rows = text.trim().split("\n").filter(r => r.trim());
    if (rows.length === 0) return null;

    const matrix = rows.map(row =>
      row.trim().split(/[\s,]+/).map(v => {
        const n = Number(v.trim());
        if (isNaN(n)) throw new Error("Invalid number");
        return n;
      })
    );
    const cols = matrix[0].length;
    if (cols === 0) return null;
    if (matrix.some(row => row.length !== cols)) return null;
    return matrix;
  } catch {
    return null;
  }
}

export function matrixToString(matrix: Matrix): string {
  return matrix.map(row => row.map(v => formatNumber(v)).join("\t")).join("\n");
}

export function matrixToLatex(matrix: Matrix): string {
  const inner = matrix.map(row => row.map(v => formatNumber(v)).join(" & ")).join(" \\\\\n  ");
  return `\\begin{pmatrix}\n  ${inner}\n\\end{pmatrix}`;
}

export function addMatrices(a: Matrix, b: Matrix): Matrix | null {
  if (a.length !== b.length || a[0].length !== b[0].length) return null;
  return a.map((row, i) => row.map((val, j) => roundPrecision(val + b[i][j])));
}

export function subtractMatrices(a: Matrix, b: Matrix): Matrix | null {
  if (a.length !== b.length || a[0].length !== b[0].length) return null;
  return a.map((row, i) => row.map((val, j) => roundPrecision(val - b[i][j])));
}

export function multiplyMatrices(a: Matrix, b: Matrix): Matrix | null {
  if (a[0].length !== b.length) return null;
  const rows = a.length;
  const cols = b[0].length;
  const common = a[0].length;
  const result: Matrix = [];

  for (let i = 0; i < rows; i++) {
    result[i] = [];
    for (let j = 0; j < cols; j++) {
      let sum = 0;
      for (let k = 0; k < common; k++) {
        sum += a[i][k] * b[k][j];
      }
      result[i][j] = roundPrecision(sum);
    }
  }
  return result;
}

export function scalarMultiply(matrix: Matrix, scalar: number): Matrix {
  return matrix.map(row => row.map(val => roundPrecision(val * scalar)));
}

export function transpose(matrix: Matrix): Matrix {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result: Matrix = [];
  for (let j = 0; j < cols; j++) {
    result[j] = [];
    for (let i = 0; i < rows; i++) {
      result[j][i] = matrix[i][j];
    }
  }
  return result;
}

export function trace(matrix: Matrix): number | null {
  if (matrix.length !== matrix[0].length) return null;
  let tr = 0;
  for (let i = 0; i < matrix.length; i++) {
    tr += matrix[i][i];
  }
  return roundPrecision(tr);
}

export function determinant(matrix: Matrix): number | null {
  const n = matrix.length;
  if (n !== matrix[0].length) return null;
  if (n === 1) return roundPrecision(matrix[0][0]);
  if (n === 2) {
    return roundPrecision(matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]);
  }
  if (n === 3) {
    const val =
      matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
      matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
      matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);
    return roundPrecision(val);
  }

  // Gaussian elimination for larger dimensions
  const m = matrix.map(row => [...row]);
  let det = 1;
  for (let i = 0; i < n; i++) {
    let pivot = i;
    while (pivot < n && Math.abs(m[pivot][i]) < 1e-12) pivot++;
    if (pivot === n) return 0;

    if (pivot !== i) {
      [m[i], m[pivot]] = [m[pivot], m[i]];
      det = -det;
    }

    det *= m[i][i];
    for (let j = i + 1; j < n; j++) {
      const factor = m[j][i] / m[i][i];
      for (let k = i; k < n; k++) {
        m[j][k] -= factor * m[i][k];
      }
    }
  }
  return roundPrecision(det);
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
  if (det === null || Math.abs(det) < 1e-12) return null;
  const n = matrix.length;
  if (n === 1) return [[roundPrecision(1 / matrix[0][0])]];

  const adjugate: Matrix = [];
  for (let i = 0; i < n; i++) {
    adjugate[i] = [];
    for (let j = 0; j < n; j++) {
      adjugate[i][j] = roundPrecision(cofactor(matrix, j, i) / det);
    }
  }
  return adjugate;
}

export function matrixPower(matrix: Matrix, power: number): Matrix | null {
  const n = matrix.length;
  if (n !== matrix[0].length || power < 0 || !Number.isInteger(power)) return null;
  if (power === 0) return identityMatrix(n);
  if (power === 1) return matrix;

  let result = identityMatrix(n);
  let base = matrix;
  let p = power;

  while (p > 0) {
    if (p % 2 === 1) {
      const next = multiplyMatrices(result, base);
      if (!next) return null;
      result = next;
    }
    p = Math.floor(p / 2);
    if (p > 0) {
      const nextBase = multiplyMatrices(base, base);
      if (!nextBase) return null;
      base = nextBase;
    }
  }

  return result;
}

export function matrixRank(matrix: Matrix): number {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const m = matrix.map(r => [...r]);
  let rank = 0;

  for (let col = 0; col < cols && rank < rows; col++) {
    let pivot = rank;
    while (pivot < rows && Math.abs(m[pivot][col]) < 1e-12) pivot++;
    if (pivot === rows) continue;

    [m[rank], m[pivot]] = [m[pivot], m[rank]];

    for (let r = 0; r < rows; r++) {
      if (r !== rank && Math.abs(m[r][col]) > 1e-12) {
        const factor = m[r][col] / m[rank][col];
        for (let c = col; c < cols; c++) {
          m[r][c] -= factor * m[rank][c];
        }
      }
    }
    rank++;
  }

  return rank;
}

export function identityMatrix(size: number): Matrix {
  return Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => (i === j ? 1 : 0))
  );
}

export function zeroMatrix(rows: number, cols: number): Matrix {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));
}

export function randomMatrix(rows: number, cols: number, min = -5, max = 10): Matrix {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.floor(Math.random() * (max - min + 1)) + min)
  );
}

function roundPrecision(val: number): number {
  if (Math.abs(val) < 1e-12) return 0;
  return parseFloat(val.toFixed(8));
}

function formatNumber(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return parseFloat(n.toFixed(4)).toString();
}

export const MATRIX_OPERATIONS = [
  { value: "add", label: "A + B (Addition)" },
  { value: "subtract", label: "A - B (Subtraction)" },
  { value: "multiply", label: "A × B (Multiplication)" },
  { value: "scalar", label: "k × A (Scalar Multiply)" },
  { value: "power", label: "Aᵏ (Matrix Power)" },
  { value: "transpose", label: "Aᵀ (Transpose)" },
  { value: "determinant", label: "det(A) (Determinant)" },
  { value: "inverse", label: "A⁻¹ (Inverse)" },
  { value: "trace", label: "tr(A) (Trace)" },
  { value: "rank", label: "rank(A) (Matrix Rank)" },
] as const;