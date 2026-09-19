// Scientific Calculator utility functions

export type TrigUnit = "deg" | "rad";

export function evaluateExpression(expression: string, trigUnit: TrigUnit = "deg"): string {
  try {
    // Replace mathematical constants
    let expr = expression
      .replace(/π/g, String(Math.PI))
      .replace(/pi/g, String(Math.PI))
      .replace(/e(?![xp])/g, String(Math.E));

    // Handle trig functions with unit conversion
    expr = handleTrigFunctions(expr, trigUnit);

    // Handle factorial
    expr = expr.replace(/(\d+)!/g, (_, n) => String(factorial(Number(n))));

    // Handle power operator ^
    expr = expr.replace(/(\d+(?:\.\d+)?)\s*\^\s*(\d+(?:\.\d+)?)/g, (_, a, b) => String(Math.pow(Number(a), Number(b))));

    // Handle sqrt
    expr = expr.replace(/sqrt\(([^)]+)\)/g, (_, inner) => String(Math.sqrt(evaluateSimple(inner))));

    // Handle log10
    expr = expr.replace(/log10\(([^)]+)\)/g, (_, inner) => String(Math.log10(evaluateSimple(inner))));

    // Handle ln
    expr = expr.replace(/ln\(([^)]+)\)/g, (_, inner) => String(Math.log(evaluateSimple(inner))));

    // Handle abs
    expr = expr.replace(/abs\(([^)]+)\)/g, (_, inner) => String(Math.abs(evaluateSimple(inner))));

    const result = evaluateSimple(expr);
    if (!isFinite(result)) return "Error: Division by zero or invalid operation";
    return formatResult(result);
  } catch {
    return "Error: Invalid expression";
  }
}

function handleTrigFunctions(expr: string, unit: TrigUnit): string {
  const toRad = unit === "deg" ? (v: number) => (v * Math.PI) / 180 : (v: number) => v;
  const toAngle = unit === "deg" ? (v: number) => (v * 180) / Math.PI : (v: number) => v;

  expr = expr.replace(/sin\(([^)]+)\)/g, (_, inner) => String(Math.sin(toRad(evaluateSimple(inner)))));
  expr = expr.replace(/cos\(([^)]+)\)/g, (_, inner) => String(Math.cos(toRad(evaluateSimple(inner)))));
  expr = expr.replace(/tan\(([^)]+)\)/g, (_, inner) => String(Math.tan(toRad(evaluateSimple(inner)))));
  expr = expr.replace(/asin\(([^)]+)\)/g, (_, inner) => String(toAngle(Math.asin(evaluateSimple(inner)))));
  expr = expr.replace(/acos\(([^)]+)\)/g, (_, inner) => String(toAngle(Math.acos(evaluateSimple(inner)))));
  expr = expr.replace(/atan\(([^)]+)\)/g, (_, inner) => String(toAngle(Math.atan(evaluateSimple(inner)))));

  return expr;
}

function evaluateSimple(expr: string): number {
  // Safe evaluation using Function constructor
  // Only allow numbers, operators, and decimal points
  const sanitized = expr.replace(/[^0-9+\-*/().%\s]/g, "");
  if (!sanitized) return NaN;
  try {
    const result = new Function(`return (${sanitized})`)();
    return typeof result === "number" ? result : NaN;
  } catch {
    return NaN;
  }
}

function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function formatResult(n: number): string {
  if (Number.isInteger(n)) return String(n);
  // Round to 10 decimal places and trim trailing zeros
  return parseFloat(n.toPrecision(12)).toString();
}

export const SCIENTIFIC_BUTTONS = [
  ["sin", "cos", "tan", "log10", "ln"],
  ["asin", "acos", "atan", "sqrt", "x^y"],
  ["π", "e", "(", ")", "n!"],
  ["7", "8", "9", "÷", "C"],
  ["4", "5", "6", "×", "⌫"],
  ["1", "2", "3", "-", "%"],
  ["0", ".", "=", "+", "±"],
] as const;