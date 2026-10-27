import { fork } from "node:child_process";

export class TranslationRunner {
  constructor({ maxMinutes, batchSeconds, worker = new URL("./translation-worker.mjs", import.meta.url) }) {
    this.maxMinutes = maxMinutes; this.batchSeconds = batchSeconds; this.worker = worker;
    this.sequence = 0; this.pending = new Map(); this.deadline = Date.now() + maxMinutes * 60_000;
  }
  remainingMs() { return Math.max(0, this.deadline - Date.now()); }
  translate(inputs, language, cacheDirectory) {
    if (!this.remainingMs()) return Promise.reject(new Error("Translation run time limit reached"));
    if (!this.child) {
      this.child = fork(this.worker, { stdio: ["ignore", "ignore", "pipe", "ipc"] });
      this.diagnostics = "";
      this.child.stderr.on("data", (chunk) => { this.diagnostics = (this.diagnostics + chunk).slice(-2000); });
      this.child.on("message", ({ id, results, error }) => {
        const pending = this.pending.get(id); if (!pending) return;
        clearTimeout(pending.timer); this.pending.delete(id);
        if (error) pending.reject(new Error(error)); else pending.resolve(results);
      });
      this.child.on("error", (error) => this.rejectAll(error));
      this.child.on("exit", (code) => { this.child = null; this.rejectAll(new Error(`Translation worker exited (${code}). ${this.diagnostics}`)); });
    }
    return new Promise((resolve, reject) => {
      const id = ++this.sequence;
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Translation batch exceeded ${this.batchSeconds}s; checkpoint preserved`));
        this.close();
      }, Math.min(this.remainingMs(), this.batchSeconds * 1000));
      this.pending.set(id, { resolve, reject, timer });
      this.child.send({ id, inputs, language, cacheDirectory }, (error) => {
        if (error) { clearTimeout(timer); this.pending.delete(id); reject(error); }
      });
    });
  }
  rejectAll(error) { for (const pending of this.pending.values()) { clearTimeout(pending.timer); pending.reject(error); } this.pending.clear(); }
  close() { this.child?.kill(); this.rejectAll(new Error("Translation runner stopped")); }
}
