"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowRight, ArrowDown, ArrowUp, Plus, Play, Square, Save, Download, Upload, Trash2, Copy, CheckCircle2, AlertTriangle, Loader2, GitBranch, ShieldCheck, FileInput, PackageCheck, Search, Settings2, FolderOpen, X, GripVertical, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { OPERATIONS, ASSET_KINDS, operationById, newStep, validateWorkflow, type Workflow, type Artifact, type StepReport, type InputKind } from "./model";
import { WORKFLOW_PRESETS } from "./presets";
import { readSavedWorkflows, saveWorkflow, removeSavedWorkflow, importWorkflow, type SavedWorkflow } from "./storage";
import { inferKind, safeName } from "./runner";

function bytes(value: number) { if (value < 1000) return `${value} B`; const unit = value < 1_000_000 ? "KB" : "MB", divisor = unit === "KB" ? 1000 : 1_000_000; return `${Math.floor(value / divisor * 100) / 100} ${unit}`; }
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob), anchor = document.createElement("a"); anchor.href = url; anchor.download = safeName(name); document.body.append(anchor); anchor.click();
  setTimeout(() => { URL.revokeObjectURL(url); anchor.remove(); }, 1000);
}
function copyWorkflow(workflow: Workflow): Workflow { return { ...workflow, steps: workflow.steps.map((step) => ({ ...step, options: { ...step.options } })) }; }

export function WorkflowsClient() {
  const params = useSearchParams();
  const initial = WORKFLOW_PRESETS.find((preset) => preset.id === params.get("preset")) ?? WORKFLOW_PRESETS[0];
  const [draft, setDraft] = useState<Workflow>(() => copyWorkflow(initial));
  const [saved, setSaved] = useState<SavedWorkflow[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [storageError, setStorageError] = useState("");
  const [selected, setSelected] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("");
  const [category, setCategory] = useState("All");
  const [library, setLibrary] = useState<"presets" | "saved">("presets");
  const [operationFilter, setOperationFilter] = useState("");
  const [results, setResults] = useState<Artifact[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [reports, setReports] = useState<StepReport[]>([]);
  const [percent, setPercent] = useState(0);
  const [phase, setPhase] = useState<"idle" | "running" | "canceling" | "success" | "error" | "canceled">("idle");
  const [error, setError] = useState("");
  const [duration, setDuration] = useState(0);
  const [revision, setRevision] = useState(0), [outputRevision, setOutputRevision] = useState(0);
  const [packaging, setPackaging] = useState(false);
  const [packagingPercent, setPackagingPercent] = useState(0);
  const [draggedStep, setDraggedStep] = useState<number | null>(null);
  const lock = useRef(false), controller = useRef<AbortController | null>(null);
  const requestedPreset = params.get("preset");
  const previousPreset = useRef(requestedPreset);
  const uploadRef = useRef<HTMLInputElement>(null), importRef = useRef<HTMLInputElement>(null), builderRef = useRef<HTMLDivElement>(null);
  const busy = phase === "running" || phase === "canceling" || packaging;
  const validation = useMemo(() => validateWorkflow(draft), [draft]);
  const active = draft.steps[selected];
  const activeDefinition = active ? operationById(active.operation) : undefined;
  const outputKinds = validation.outputs.length ? validation.outputs : draft.input === "files" ? [...ASSET_KINDS] : [draft.input];
  const canPaste = ["text", "json", "csv"].includes(draft.input);
  const inputBytes = files.reduce((total, file) => total + file.size, 0) + (canPaste ? new Blob([text]).size : 0);
  const source = library === "presets" ? WORKFLOW_PRESETS : saved.map((item) => item.workflow);
  const visible = source.filter((workflow) => (category === "All" || workflow.category === category) && `${workflow.name} ${workflow.description}`.toLowerCase().includes(filter.toLowerCase()));
  const categories = ["All", "PDF", "Images", "Text", "Data", "Files"];

  useEffect(() => {
    queueMicrotask(() => { try { setSaved(readSavedWorkflows()); } catch (reason) { setStorageError(reason instanceof Error ? reason.message : "Browser storage is unavailable."); } });
    return () => controller.current?.abort();
  }, []);
  useEffect(() => {
    const urls = Object.fromEntries(results.filter((asset) => asset.kind === "image").map((asset) => [asset.id, URL.createObjectURL(asset.blob)]));
    queueMicrotask(() => setPreviewUrls(urls)); return () => Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
  }, [results]);
  useEffect(() => {
    if (requestedPreset === previousPreset.current) return;
    previousPreset.current = requestedPreset;
    const preset = WORKFLOW_PRESETS.find((item) => item.id === requestedPreset);
    if (!preset || lock.current) return;
    queueMicrotask(() => { if (!lock.current) { setDraft(copyWorkflow(preset)); setSavedId(null); setSelected(0); setResults([]); setReports([]); setError(""); setPhase("idle"); } });
  }, [requestedPreset]);

  const edit = (update: Partial<Workflow>) => { if (!lock.current) { setDraft((previous) => ({ ...previous, ...update })); setRevision((value) => value + 1); } };
  const load = (workflow: Workflow, id: string | null = null) => {
    if (lock.current) return;
    setDraft(copyWorkflow(workflow)); setSavedId(id); setSelected(0); setReports([]); setResults([]); setError(""); setPhase("idle");
    builderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const moveStep = (from: number, to: number) => {
    if (busy || to < 0 || to >= draft.steps.length || from === to) return;
    const steps = [...draft.steps], [step] = steps.splice(from, 1); steps.splice(to, 0, step); edit({ steps }); setSelected(to);
  };
  const updateOption = (key: string, value: string | number | boolean) => {
    edit({ steps: draft.steps.map((step, index) => index === selected ? { ...step, options: { ...step.options, [key]: value } } : step) });
  };
  const save = (asCopy = false) => {
    try {
      const workflow = { ...draft, id: asCopy || !savedId ? crypto.randomUUID() : savedId };
      setSaved(saveWorkflow(workflow)); setDraft(workflow); setSavedId(workflow.id); toast.success(asCopy ? "Workflow saved as a new copy on this device." : "Workflow saved on this device.");
    } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Could not save workflow."); }
  };
  const addFiles = (incoming: File[]) => {
    if (busy) return;
    const next = [...files, ...incoming];
    if (next.length > 30 || next.reduce((sum, file) => sum + file.size, 0) > 100_000_000) { toast.error("Use no more than 30 files totaling 100 MB."); return; }
    setFiles(next); setRevision((value) => value + 1); setResults([]); setError(""); setPhase("idle");
  };
  const run = async () => {
    if (lock.current || !validation.workflow) return;
    lock.current = true; const abort = new AbortController(); controller.current = abort;
    setPhase("running"); setError(""); setReports([]); setResults([]); setPercent(0);
    const started = performance.now();
    const timeout = setTimeout(() => abort.abort(new DOMException("Processing exceeded five minutes. Use a smaller batch.", "TimeoutError")), 5 * 60_000);
    try {
      const inputs = [...files];
      if (canPaste && text) inputs.push(new File([text], `pasted-input.${draft.input === "json" ? "json" : draft.input === "csv" ? "csv" : "txt"}`, { type: draft.input === "json" ? "application/json" : draft.input === "csv" ? "text/csv" : "text/plain" }));
      const { runWorkflow } = await import("./runner");
      const output = await runWorkflow(draft, inputs, abort.signal, (report, value) => {
        setReports((previous) => { const index = previous.findIndex((item) => item.id === report.id); return index < 0 ? [...previous, report] : previous.map((item) => item.id === report.id ? report : item); });
        setPercent(Math.min(100, Math.max(0, value)));
      });
      setResults(output); setOutputRevision(revision); setPhase("success"); setPercent(100); toast.success("Workflow complete. Your outputs are ready to download.");
    } catch (reason) {
      const timedOut = abort.signal.aborted && abort.signal.reason?.name === "TimeoutError";
      const message = timedOut ? abort.signal.reason.message : abort.signal.aborted ? "Canceled. Input files remain available for another run." : reason instanceof Error ? reason.message : "Workflow failed.";
      setError(message); setPhase(abort.signal.aborted && !timedOut ? "canceled" : "error"); if (!abort.signal.aborted || timedOut) toast.error(message);
    } finally { clearTimeout(timeout); setDuration(performance.now() - started); lock.current = false; controller.current = null; }
  };
  const downloadAll = async () => {
    if (lock.current) return;
    lock.current = true; setPackaging(true); setPackagingPercent(0);
    const abort = new AbortController(); controller.current = abort;
    const timeout = setTimeout(() => abort.abort(), 5 * 60_000);
    try {
      const { executeStep } = await import("./runner");
      const output = await executeStep(results, { id: "download-all", operation: "zip", options: { name: safeName(draft.name) } }, abort.signal, (done, total) => setPackagingPercent(Math.floor(done / Math.max(1, total) * 100)));
      download(output[0].blob, output[0].name);
    } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Could not package files."); }
    finally { clearTimeout(timeout); controller.current = null; lock.current = false; setPackaging(false); setPhase("success"); }
  };

  return <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
    <header className="mb-10 grid gap-8 rounded-3xl border bg-linear-to-br from-primary/10 via-card to-card p-6 sm:p-10 lg:grid-cols-[1.3fr_1fr]">
      <div><p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary"><GitBranch className="size-4" />Connected tools. One result.</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">A better way to<br /><span className="font-editorial italic text-primary">finish the whole job.</span></h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">Upload once. Connect local processors. Let each tool pass its output to the next—then download the finished result. No intermediate downloads or server file storage.</p>
        <div className="mt-6 flex flex-wrap gap-3"><Button className="h-11 px-5" onClick={() => builderRef.current?.scrollIntoView({ behavior: "smooth" })}><Play className="size-4" />Open builder</Button><Button className="h-11 px-5" variant="outline" onClick={() => load(WORKFLOW_PRESETS[0])}>PDF → images under 200 KB<ArrowRight className="size-4" /></Button></div>
        <div className="mt-6 flex flex-wrap gap-5 text-xs text-muted-foreground"><span>{WORKFLOW_PRESETS.length} built-in workflows</span><span>{OPERATIONS.length} local operations</span><span className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-primary" />Files stay on your device</span></div>
      </div>
      <div className="self-center space-y-3 rounded-2xl border bg-background/70 p-5">
        {[[FileInput, "01", "Your PDF", "Choose the source once"], [GitBranch, "02", "Render → compress", "Outputs connect automatically"], [PackageCheck, "03", "Finished image pack", "Verified byte limits, one download"]].map(([Icon, number, title, subtitle], index) => { const Visual = Icon as typeof FileInput; return <div key={String(number)}><div className="flex items-center gap-4 rounded-xl border bg-card p-4"><div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Visual className="size-5" /></div><div><p className="text-sm font-semibold">{String(title)}</p><p className="mt-1 text-xs text-muted-foreground">{String(subtitle)}</p></div><span className="ml-auto text-xs font-mono text-muted-foreground">{String(number)}</span></div>{index < 2 && <ArrowDown className="mx-auto mt-3 size-4 text-primary" />}</div>; })}
      </div>
    </header>

    <section className="mb-10" aria-label="Workflow library">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-2xl font-semibold tracking-tight">Start with a workflow</h2><p className="mt-1 text-sm text-muted-foreground">Practical presets you can run, customize, and save.</p></div><div className="flex rounded-xl border p-1"><Button variant={library === "presets" ? "secondary" : "ghost"} onClick={() => setLibrary("presets")}>Built-in ({WORKFLOW_PRESETS.length})</Button><Button variant={library === "saved" ? "secondary" : "ghost"} onClick={() => setLibrary("saved")}>Saved on this device ({saved.length})</Button></div></div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row"><div className="relative sm:w-80"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input className="h-10 pl-9" aria-label="Search workflows" placeholder="Search workflows..." value={filter} onChange={(event) => setFilter(event.target.value)} /></div><div className="flex flex-wrap gap-2">{categories.map((item) => <Button key={item} variant={category === item ? "default" : "outline"} onClick={() => setCategory(item)}>{item}</Button>)}</div></div>
      {storageError && <div role="alert" className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">{storageError} You can still run workflows and export definitions without saving locally.</div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visible.map((workflow) => <article key={workflow.id} className="flex flex-col rounded-2xl border bg-card p-5 transition-colors hover:border-primary/40">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-primary">{workflow.category} · {workflow.steps.length} steps</p><h3 className="text-sm font-semibold leading-6">{workflow.name}</h3><p className="mt-2 flex-1 text-xs leading-6 text-muted-foreground">{workflow.description}</p>
        <div className="mt-4 flex flex-wrap gap-1">{workflow.steps.map((step, index) => <span key={step.id} className="rounded-md bg-muted px-2 py-1 text-[10px]">{index + 1}. {operationById(step.operation)?.name}</span>)}</div>
        <div className="mt-5 flex items-center gap-2"><Button disabled={busy} variant="outline" className="flex-1" onClick={() => load(workflow, library === "saved" ? workflow.id : null)}><FolderOpen className="size-3.5" />{library === "saved" ? "Edit & run" : "Use workflow"}</Button>{library === "saved" && <Button aria-label={`Delete ${workflow.name}`} size="icon" variant="ghost" disabled={busy} onClick={() => { if (confirm("Delete this saved workflow definition? Input files are not stored and are unaffected.")) { try { setSaved(removeSavedWorkflow(workflow.id)); if (savedId === workflow.id) setSavedId(null); } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Could not delete workflow."); } } }}><Trash2 className="size-4" /></Button>}</div>
      </article>)}</div>
      {!visible.length && <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">{library === "saved" ? "No matching saved workflows. Create one in the builder and save it on this device." : "No matching workflows. Try another search or category."}</div>}
    </section>

    <section id="builder" ref={builderRef} className="scroll-mt-24" aria-label="Workflow builder">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-2xl font-semibold tracking-tight">Workflow builder</h2><p className="mt-1 text-sm text-muted-foreground">A typed pipeline, not a collection of upload screens.</p></div><div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={busy} onClick={() => load({ version: 1, id: "new-workflow", name: "Untitled workflow", description: "", category: "Files", input: "pdf", steps: [] })}><Plus className="size-4" />New</Button>
        <Button variant="outline" disabled={busy} onClick={() => importRef.current?.click()}><Upload className="size-4" />Import JSON</Button>
        <Button variant="outline" disabled={busy || !validation.workflow} onClick={() => download(new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" }), `${safeName(draft.name)}.workflow.json`)}><Download className="size-4" />Export</Button>
        <Button disabled={busy || !validation.workflow || !!storageError} onClick={() => save()}><Save className="size-4" />{savedId ? "Update saved" : "Save workflow"}</Button>
        {savedId && <Button variant="outline" disabled={busy || !validation.workflow} onClick={() => save(true)}><Copy className="size-4" />Save copy</Button>}
      </div></div>
      <input ref={importRef} type="file" accept="application/json,.json" hidden onChange={async (event) => { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; try { if (file.size > 100000) throw new Error("Workflow definitions must be below 100 KB."); load(importWorkflow(await file.text())); toast.success("Workflow imported. Save it locally if you want to keep it."); } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Invalid workflow definition."); } }} />
      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
        <aside className="rounded-2xl border bg-card p-4"><h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Plus className="size-4 text-primary" />Add an operation</h3><p className="mb-4 text-xs leading-5 text-muted-foreground">Only compatible connections can run. Add converters where needed.</p><Input aria-label="Search operations" placeholder="Search operations..." value={operationFilter} onChange={(event) => setOperationFilter(event.target.value)} className="mb-4" />
          <div className="max-h-[650px] space-y-1 overflow-y-auto pr-1">{OPERATIONS.filter((operation) => `${operation.name} ${operation.category}`.toLowerCase().includes(operationFilter.toLowerCase())).map((operation) => { const compatible = outputKinds.every((kind) => operation.accepts.includes(kind)); return <button type="button" key={operation.id} disabled={busy || draft.steps.length >= 16} onClick={() => { edit({ steps: [...draft.steps, newStep(operation.id)] }); setSelected(draft.steps.length); }} className="w-full rounded-xl border border-transparent p-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/5 disabled:opacity-40"><span className="flex items-center justify-between gap-2 text-xs font-semibold">{operation.name}<Plus className="size-3.5 shrink-0" /></span><span className="mt-1 block text-[10px] text-muted-foreground">{operation.category} · {compatible ? "Compatible next step" : "Needs a different input type"}</span></button>; })}</div>
        </aside>

        <div className="min-w-0 space-y-5">
          <div className="rounded-2xl border bg-card p-5"><div className="grid gap-4 sm:grid-cols-[1fr_160px]"><label className="space-y-1.5 text-xs font-medium">Workflow name<Input value={draft.name} onChange={(event) => edit({ name: event.target.value })} disabled={busy} maxLength={100} /></label><label className="space-y-1.5 text-xs font-medium">Starting input<select value={draft.input} disabled={busy} onChange={(event) => edit({ input: event.target.value as InputKind })} className="h-8 w-full rounded-lg border bg-background px-2 text-sm">{["pdf", "image", "text", "json", "csv", "files"].map((kind) => <option key={kind} value={kind}>{kind === "files" ? "Any files" : kind.toUpperCase()}</option>)}</select></label></div><label className="mt-4 block space-y-1.5 text-xs font-medium">Description<Textarea value={draft.description} onChange={(event) => edit({ description: event.target.value })} disabled={busy} maxLength={800} className="min-h-16" /></label></div>
          <div className="rounded-2xl border bg-linear-to-b from-primary/5 to-card p-5"><div className="mb-4 flex items-center justify-between"><h3 className="text-sm font-semibold">Connected pipeline</h3><span className="text-xs text-muted-foreground">{draft.steps.length} / 16 steps</span></div>
            <div className="mb-3 flex items-center gap-3 rounded-xl border bg-background p-3 text-sm"><FileInput className="size-5 text-primary" /><span>{draft.input.toUpperCase()} input</span><span className="ml-auto text-[10px] text-muted-foreground">Upload once</span></div>
            {draft.steps.map((step, index) => { const definition = operationById(step.operation), report = reports.find((item) => item.id === step.id); return <div key={step.id} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (draggedStep !== null) moveStep(draggedStep, index); setDraggedStep(null); }}><ArrowDown className="mx-auto my-2 size-4 text-primary/60" /><div draggable={!busy} onDragStart={() => setDraggedStep(index)} onDragEnd={() => setDraggedStep(null)} className={`flex items-center gap-3 rounded-xl border p-3 ${selected === index ? "border-primary/50 bg-primary/10" : "bg-background"}`}>
              <GripVertical className="hidden size-4 shrink-0 cursor-grab text-muted-foreground sm:block" /><button className="min-w-0 flex-1 text-left" onClick={() => setSelected(index)}><span className="text-[10px] text-primary">Step {index + 1}</span><span className="block text-sm font-semibold">{definition?.name ?? "Unknown operation"}</span><span className="block text-[10px] text-muted-foreground">{definition?.accepts.join(" / ")} → {definition?.output}</span></button>
              {report?.state === "running" ? <Loader2 className="size-4 animate-spin text-primary" /> : report?.state === "success" ? <CheckCircle2 className="size-4 text-primary" /> : report?.state === "error" ? <AlertTriangle className="size-4 text-destructive" /> : null}
              <div className="flex shrink-0 gap-0.5"><Button variant="ghost" size="icon-sm" aria-label={`Move step ${index + 1} up`} disabled={busy || index === 0} onClick={() => moveStep(index, index - 1)}><ArrowUp className="size-3.5" /></Button><Button variant="ghost" size="icon-sm" aria-label={`Move step ${index + 1} down`} disabled={busy || index === draft.steps.length - 1} onClick={() => moveStep(index, index + 1)}><ArrowDown className="size-3.5" /></Button><Button variant="ghost" size="icon-sm" aria-label={`Delete step ${index + 1}`} disabled={busy} onClick={() => { edit({ steps: draft.steps.filter((_, item) => item !== index) }); setSelected(Math.max(0, Math.min(selected, draft.steps.length - 2))); }}><Trash2 className="size-3.5" /></Button></div>
            </div></div>; })}
            {!draft.steps.length && <div className="py-8 text-center text-sm text-muted-foreground">Add your first operation from the palette.</div>}
            <ArrowDown className="mx-auto my-3 size-4 text-primary/60" /><div className="flex items-center gap-3 rounded-xl border bg-background p-3 text-sm"><PackageCheck className="size-5 text-primary" /><span>{validation.outputs.join(" + ").toUpperCase() || "Final"} output</span></div>
            {validation.errors.length ? <div role="alert" className="mt-4 space-y-1 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-5">{validation.errors.slice(0, 5).map((message, index) => <p key={index}>{message}</p>)}</div> : <p className="mt-4 flex items-center gap-2 text-xs text-primary"><CheckCircle2 className="size-4" />Connections and settings are valid.</p>}
          </div>
        </div>

        <aside className="space-y-5"><div className="rounded-2xl border bg-card p-5"><h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Settings2 className="size-4 text-primary" />Step settings</h3>{activeDefinition ? <><p className="mb-4 text-xs leading-6 text-muted-foreground">{activeDefinition.description}</p><div className="space-y-4">{activeDefinition.fields.map((field) => <label key={field.key} className="block space-y-1.5 text-xs font-medium">{field.type === "boolean" ? <span className="flex items-start gap-2"><input type="checkbox" checked={!!active.options[field.key]} disabled={busy} onChange={(event) => updateOption(field.key, event.target.checked)} className="mt-0.5" />{field.label}</span> : <><span>{field.label}</span>{field.type === "select" ? <select className="h-9 w-full rounded-lg border bg-background px-2" value={String(active.options[field.key])} disabled={busy} onChange={(event) => updateOption(field.key, event.target.value)}>{field.choices?.map((choice) => <option key={choice} value={choice}>{choice === "jpeg" ? "JPEG" : choice === "webp" ? "WebP" : choice === "png" ? "PNG" : choice}</option>)}</select> : <Input type={field.type === "number" ? "number" : "text"} value={String(active.options[field.key] ?? "")} disabled={busy} min={field.min} max={field.max} step={field.type === "number" && Number(field.value) < 1 ? 0.05 : 1} onChange={(event) => updateOption(field.key, field.type === "number" ? Number(event.target.value) : event.target.value)} />}{field.help && <span className="block text-[11px] font-normal leading-5 text-muted-foreground">{field.help}</span>}</>}</label>)}</div>{!activeDefinition.fields.length && <p className="text-xs text-muted-foreground">This operation has no configurable options.</p>}</> : <p className="text-xs text-muted-foreground">Select a step to configure it.</p>}</div>
          <div className="rounded-2xl border bg-primary/5 p-5 text-xs leading-6 text-muted-foreground"><ShieldCheck className="mb-2 size-5 text-primary" /><strong className="text-foreground">Local by design.</strong><p>Workflow definitions save on this device. Input files and intermediate outputs stay in browser memory and are not saved to servers.</p><p className="mt-2">AI and cloud-only tools are deliberately excluded. Large batches and unsupported codecs can fail; inspect outputs before relying on them.</p></div>
        </aside>
      </div>
    </section>

    <section className="mt-6 rounded-2xl border bg-card p-5 sm:p-6" aria-label="Run workflow">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">Run your workflow</h2><p className="mt-1 text-xs text-muted-foreground">Up to 30 input files / 100 MB total. Page rendering: up to 100 pages per PDF. A run is limited to five minutes.</p></div><span className="rounded-lg border px-3 py-2 text-xs text-muted-foreground">{files.length} files · {bytes(inputBytes)}</span></div>
      <div className="grid gap-5 md:grid-cols-2"><div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles([...event.dataTransfer.files]); }} className="rounded-xl border-2 border-dashed bg-muted/20 p-6 text-center"><Upload className="mx-auto mb-3 size-7 text-primary" /><p className="text-sm font-medium">Drop your {draft.input === "files" ? "files" : draft.input.toUpperCase() + " files"} here</p><p className="mt-1 text-xs text-muted-foreground">Files stay on your device. Input order is preserved.</p><Button variant="outline" className="mt-4" disabled={busy} onClick={() => uploadRef.current?.click()}>Choose files</Button><input ref={uploadRef} type="file" multiple hidden onChange={(event) => { addFiles([...event.target.files ?? []]); event.target.value = ""; }} /></div>
        {canPaste ? <label className="space-y-2 text-sm font-medium">Or paste {draft.input.toUpperCase()}<Textarea className="min-h-44 font-mono text-xs" value={text} onChange={(event) => { setText(event.target.value); setRevision((value) => value + 1); }} disabled={busy} placeholder={draft.input === "json" ? '[{"name":"Ada","score":95}]' : draft.input === "csv" ? "name,score\nAda,95" : "Your text stays in your browser..."} /><span className="block text-xs font-normal text-muted-foreground">Pasted content is added as an in-memory file for this run.</span></label> : <div className="rounded-xl border bg-muted/20 p-5 text-xs leading-6 text-muted-foreground"><strong className="text-foreground">No re-uploading between steps.</strong><p>Each operation receives the previous operation’s actual files. Output names and sizes are shown after processing.</p><p className="mt-2">Compression may resize images. Rasterizing a PDF removes searchable text and can change file size. Signed/encrypted PDFs may require a separate workflow.</p></div>}
      </div>
      {!!files.length && <ol className="mt-4 divide-y rounded-xl border">{files.map((file, index) => <li key={`${index}-${file.name}`} className="flex items-center gap-3 px-3 py-2 text-xs"><span className="text-muted-foreground">{index + 1}</span><span className="min-w-0 flex-1 truncate">{file.name}</span><span className="text-muted-foreground">{inferKind(file).toUpperCase()} · {bytes(file.size)}</span><Button size="icon-sm" variant="ghost" aria-label={`Move input ${index + 1} up`} disabled={busy || !index} onClick={() => { const next = [...files]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; setFiles(next); setRevision((value) => value + 1); }}><ArrowUp className="size-3.5" /></Button><Button size="icon-sm" variant="ghost" aria-label={`Remove ${file.name}`} disabled={busy} onClick={() => { setFiles((previous) => previous.filter((_, item) => item !== index)); setRevision((value) => value + 1); }}><X className="size-3.5" /></Button></li>)}</ol>}
      <div className="mt-5 flex flex-wrap items-center gap-3"><Button className="h-11 px-6" disabled={busy || !validation.workflow || (!files.length && !(canPaste && text))} onClick={run}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}{busy ? "Processing locally..." : "Run workflow"}</Button>{busy && <Button className="h-11" variant="outline" disabled={phase === "canceling"} onClick={() => { setPhase("canceling"); controller.current?.abort(); }}><Square className="size-4" />{phase === "canceling" ? "Canceling..." : "Cancel"}</Button>}<Button variant="ghost" disabled={busy} onClick={() => { setFiles([]); setText(""); setResults([]); setReports([]); setError(""); setPhase("idle"); }}><RotateCcw className="size-4" />Clear run data</Button><span className="text-xs text-muted-foreground">No account required · No file uploads to a server</span></div>
      {(busy || reports.length > 0) && <div className="mt-5"><div role="progressbar" aria-label="Workflow progress" aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100} className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-[width]" style={{ width: `${percent}%` }} /></div><p role="status" className="mt-2 text-xs text-muted-foreground">{phase === "success" ? `Complete in ${(duration / 1000).toFixed(1)} seconds` : phase === "canceling" ? "Cancel requested. Some browser encodes finish before cancellation takes effect." : `${Math.floor(percent)}% · ${phase}`}</p></div>}
      {!!reports.length && <div className="mt-4 space-y-2">{reports.map((report) => <div key={report.id} className="flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-xs">{report.state === "success" ? <CheckCircle2 className="size-4 text-primary" /> : report.state === "error" ? <AlertTriangle className="size-4 text-destructive" /> : <Loader2 className="size-4 animate-spin text-primary" />}<strong>{report.name}</strong><span className="text-muted-foreground">{report.inputCount} input{report.inputCount !== 1 ? "s" : ""}{report.outputCount !== undefined ? ` → ${report.outputCount} outputs · ${bytes(report.bytes ?? 0)}` : ""}</span>{report.error && <span className="text-destructive">{report.error}</span>}</div>)}</div>}
      {error && <div role="alert" className={`mt-4 rounded-xl border p-4 text-sm leading-6 ${phase === "canceled" ? "bg-muted/30" : "border-destructive/30 bg-destructive/5 text-destructive"}`}>{error}<p className="mt-1 text-xs">Your original inputs remain available. Adjust the workflow and run again—no re-upload needed.</p></div>}
      {reports.filter((report) => report.state === "success" && report.targetBytes).map((report) => <p key={`${report.id}-target`} className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs leading-6 text-primary">Verified at the compression step: every image below {(report.targetBytes ?? 0) / 1000} KB. Largest image: {(report.largestOutputBytes ?? 0).toLocaleString("en-US")} bytes. Subsequent edits can change file sizes.</p>)}
    </section>

      {!!results.length && <section className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-6" aria-label="Workflow outputs">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-xl font-semibold">Your finished outputs</h2><p className="mt-1 text-xs text-muted-foreground">{results.length} download{results.length !== 1 ? "s" : ""} · {bytes(results.reduce((sum, asset) => sum + asset.blob.size, 0))} · Inspect results before sharing.</p></div>
          {results.length > 1 && <Button disabled={busy} onClick={downloadAll}>{packaging ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}{packaging ? `Packaging ${packagingPercent}%...` : "Download all as ZIP"}</Button>}
        </div>
        {outputRevision !== revision && <p role="status" className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs">These outputs are from the previous run. Inputs or settings have changed; run again to generate updated outputs. The previous files remain downloadable.</p>}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{results.map((asset) => <article key={asset.id} className="flex items-center gap-3 rounded-xl border bg-background p-4">
          {previewUrls[asset.id] ? <Image unoptimized src={previewUrls[asset.id]} width={64} height={64} alt={`Preview of ${asset.name}`} className="size-16 rounded-lg border object-contain" /> : <PackageCheck className="size-8 shrink-0 text-primary" />}
          <div className="min-w-0 flex-1"><h3 className="truncate text-xs font-semibold" title={asset.name}>{asset.name}</h3><p className="mt-1 text-[11px] text-muted-foreground">{bytes(asset.blob.size)} · {asset.blob.size.toLocaleString("en-US")} bytes{asset.width ? ` · ${asset.width} × ${asset.height}` : ""}</p>
            {asset.targetBytes && <p className="mt-1 text-[10px] font-semibold text-primary">Verified below {asset.targetBytes / 1000} KB</p>}
            <Button className="mt-2" variant="outline" size="sm" disabled={packaging} onClick={() => download(asset.blob, asset.name)}><Download className="size-3.5" />Download</Button>
          </div>
        </article>)}</div>
      </section>}
    <p className="mt-8 text-center text-xs leading-6 text-muted-foreground">Definitions save locally, not to your account. Keep an exported JSON backup. Input files are not saved between page reloads.</p>
  </div>;
}
