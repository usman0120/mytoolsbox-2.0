import { validateWorkflow, type Workflow } from "./model";

const KEY = "mytoolsbox.workflows.v1";
export interface SavedWorkflow { workflow: Workflow; createdAt: number; updatedAt: number }
export function readSavedWorkflows(storage: Pick<Storage, "getItem"> = localStorage): SavedWorkflow[] {
  const raw = storage.getItem(KEY); if (!raw) return [];
  const items: unknown = JSON.parse(raw);
  if (!Array.isArray(items) || items.length > 100) throw new Error("Saved workflow data is invalid. Export or back up browser storage before repairing it.");
  return items.map((item) => {
    const parsed = validateWorkflow(item?.workflow);
    if (!parsed.workflow || typeof item.createdAt !== "number" || typeof item.updatedAt !== "number") throw new Error("A saved workflow is invalid; it was not silently discarded.");
    return { workflow: parsed.workflow, createdAt: item.createdAt, updatedAt: item.updatedAt };
  });
}
export function saveWorkflow(workflow: Workflow, storage: Pick<Storage, "getItem" | "setItem"> = localStorage): SavedWorkflow[] {
  const parsed = validateWorkflow(workflow); if (!parsed.workflow) throw new Error(parsed.errors.join("\n"));
  const items = readSavedWorkflows(storage); const existing = items.find((item) => item.workflow.id === workflow.id);
  if (!existing && items.length >= 100) throw new Error("You can save up to 100 workflows on this device. Export and remove older workflows first.");
  const updated = { workflow: parsed.workflow, createdAt: existing?.createdAt ?? Date.now(), updatedAt: Date.now() };
  const next = [updated, ...items.filter((item) => item.workflow.id !== workflow.id)];
  storage.setItem(KEY, JSON.stringify(next)); return next;
}
export function removeSavedWorkflow(id: string, storage: Pick<Storage, "getItem" | "setItem"> = localStorage): SavedWorkflow[] {
  const next = readSavedWorkflows(storage).filter((item) => item.workflow.id !== id); storage.setItem(KEY, JSON.stringify(next)); return next;
}
export function importWorkflow(json: string): Workflow {
  if (json.length > 100000) throw new Error("Workflow definitions must be below 100 KB.");
  const parsed = validateWorkflow(JSON.parse(json)); if (!parsed.workflow) throw new Error(parsed.errors.join("\n"));
  return { ...parsed.workflow, id: crypto.randomUUID(), steps: parsed.workflow.steps.map((step) => ({ ...step, id: crypto.randomUUID() })) };
}
