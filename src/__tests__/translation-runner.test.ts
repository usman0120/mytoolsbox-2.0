import { EventEmitter } from "node:events";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TranslationRunner } from "../../scripts/translation-runner.mjs";

const mocks = vi.hoisted(() => ({ fork: vi.fn() }));
vi.mock("node:child_process", () => ({ fork: mocks.fork, default: { fork: mocks.fork } }));

let child: EventEmitter & { stderr: EventEmitter; send: ReturnType<typeof vi.fn>; kill: ReturnType<typeof vi.fn> };
beforeEach(() => {
  vi.useFakeTimers();
  child = Object.assign(new EventEmitter(), { stderr: new EventEmitter(), send: vi.fn(), kill: vi.fn() });
  mocks.fork.mockReturnValue(child);
});
afterEach(() => { vi.useRealTimers(); vi.clearAllMocks(); });

describe("translation job deadlines", () => {
  it("terminates the worker when an inference batch does not respond", async () => {
    const runner = new TranslationRunner({ maxMinutes: 5, batchSeconds: 1 });
    const result = runner.translate(["Save"], "es", "cache").catch((error: Error) => error);
    await vi.advanceTimersByTimeAsync(1000);
    const error = await result;
    expect(error).toBeInstanceOf(Error);
    expect(error instanceof Error ? error.message : "").toContain("exceeded");
    expect(child.kill).toHaveBeenCalledOnce();
    expect(runner.pending.size).toBe(0);
  });
  it("uses the overall run deadline even when the per-batch limit is longer", async () => {
    const runner = new TranslationRunner({ maxMinutes: 0.01, batchSeconds: 60 });
    const result = runner.translate(["Save"], "es", "cache").catch((error: Error) => error);
    await vi.advanceTimersByTimeAsync(600);
    expect(await result).toBeInstanceOf(Error);
    expect(child.kill).toHaveBeenCalledOnce();
  });
  it("clears the watchdog after a successful batch", async () => {
    const runner = new TranslationRunner({ maxMinutes: 5, batchSeconds: 1 });
    const result = runner.translate(["Save"], "es", "cache");
    child.emit("message", { id: 1, results: ["Guardar"] });
    expect(await result).toEqual(["Guardar"]);
    await vi.advanceTimersByTimeAsync(1000);
    expect(child.kill).not.toHaveBeenCalled();
    runner.close();
  });
});
