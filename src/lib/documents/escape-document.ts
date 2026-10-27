export function escapeDocumentStrings<T>(value: T): T {
  if (typeof value === "string") return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!) as T;
  if (Array.isArray(value)) return value.map(escapeDocumentStrings) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, escapeDocumentStrings(item)])) as T;
  return value;
}
