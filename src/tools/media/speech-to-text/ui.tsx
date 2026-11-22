"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FileDrop, Segmented } from "@/components/tools/file-drop";
import { baseName, download, formatBytes } from "@/lib/image/canvas";
import { formatTime } from "@/lib/media/plan";
import { fromChunks, toParagraphs, toSrt, toVtt, type Segment } from "@/lib/media/subtitles";
import { cancelTranscription, decodeTo16k, transcribe, type WhisperStatus } from "@/lib/ml/whisper";
import { LANGUAGES, WHISPER_MODELS, type WhisperModel } from "@/lib/ml/whisper-models";

// Phrases Whisper tends to invent for silence, music or noise.
const NO_SPEECH = /^s*(thank you( very much)?|thanks for watching|you|bye|.+|[?(music|silence|blank_audio)]?)[.!s]*$/i;

const ACCEPT = "audio/*,video/mp4,video/quicktime,video/webm,video/x-matroska,.m4a,.mp3,.wav,.ogg,.opus,.flac,.mkv,.mov";

export function SpeechToTextEngine() {
  const [source, setSource] = useState<"file" | "record">("file");
  const [file, setFile] = useState<File | null>(null);
  const [model, setModel] = useState<WhisperModel>("fast");
  const [language, setLanguage] = useState("");
  const [translate, setTranslate] = useState(false);
  const [status, setStatus] = useState<WhisperStatus | { phase: "decoding" } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [segments, setSegments] = useState<Segment[] | null>(null);
  const [text, setText] = useState("");
  const [showTimes, setShowTimes] = useState(false);
  const player = useRef<HTMLAudioElement & HTMLVideoElement>(null);

  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url]);
  useEffect(() => () => cancelTranscription(), []);

  const open = (f: File) => {
    setFile(f);
    setSegments(null);
    setText("");
    setError(null);
  };

  const run = async () => {
    if (!file) return;
    setError(null);
    setSegments(null);
    setText("");
    setStatus({ phase: "decoding" });
    try {
      const audio = await decodeTo16k(file);
      const duration = audio.length / 16000;
      if (duration < 0.3) throw new Error("This file has no audible sound.");
      const r = await transcribe(audio, { model, language, task: translate ? "translate" : "transcribe" }, setStatus);
      if (!r.text.trim() || NO_SPEECH.test(r.text)) throw new Error("No clear speech was found in this recording. Check that the file has spoken words, or pick the language.");
      const segs = fromChunks(r.chunks, duration);
      setSegments(segs);
      setText(segs.length ? toParagraphs(segs) : r.text);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Transcription failed.";
      if (msg !== "Stopped.") setError(/decode|Unable/i.test(msg) ? "This file couldn't be read. Use MP3, M4A, WAV, Ogg, MP4, MOV or WebM." : msg);
    } finally {
      setStatus(null);
    }
  };

  const running = status !== null;
  const live = status?.phase === "running" ? status.text : "";
  const name = file ? baseName(file.name) : "transcript";

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-3">
        {!file ? (
          source === "file" ? (
            <FileDrop accept={ACCEPT} onFile={open} title="Add a recording" hint="Voice notes, lectures, meetings, interviews or videos. Transcribed on your device; nothing is uploaded." button="Choose file" />
          ) : (
            <Recorder onDone={(f) => open(f)} />
          )
        ) : (
          <>
            <div className="rounded-xl border bg-card p-3">
              {url && (file.type.startsWith("video/") ? <video ref={player} src={url} controls playsInline className="max-h-[40vh] w-full rounded-lg bg-black" /> : <audio ref={player} src={url} controls className="w-full" />)}
              <div className="mt-2 flex items-center justify-between gap-2 text-sm text-muted-foreground">
                <span className="min-w-0 truncate">
                  {file.name} · {formatBytes(file.size)}
                </span>
                <Button variant="ghost" size="sm" disabled={running} onClick={() => (setFile(null), setSegments(null), setText(""))}>
                  Change
                </Button>
              </div>
            </div>

            {(segments || live) && (
              <div className="rounded-xl border bg-card">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Switch id="times" checked={showTimes} onCheckedChange={setShowTimes} disabled={!segments?.length} />
                    <Label htmlFor="times">Timestamps</Label>
                  </div>
                  {segments && (
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(text).then(() => toast.success("Copied"))}>
                        Copy
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => download(new Blob([text], { type: "text/plain" }), `${name}.txt`)}>
                        TXT
                      </Button>
                      <Button size="sm" variant="ghost" disabled={!segments.length} onClick={() => download(new Blob([toSrt(segments)], { type: "application/x-subrip" }), `${name}.srt`)}>
                        SRT
                      </Button>
                      <Button size="sm" variant="ghost" disabled={!segments.length} onClick={() => download(new Blob([toVtt(segments)], { type: "text/vtt" }), `${name}.vtt`)}>
                        VTT
                      </Button>
                    </div>
                  )}
                </div>
                {!segments ? (
                  <p aria-live="polite" className="max-h-[50vh] overflow-auto p-4 leading-7 whitespace-pre-wrap text-muted-foreground">
                    {live}
                  </p>
                ) : showTimes ? (
                  <ol className="max-h-[50vh] divide-y overflow-auto">
                    {segments.map((s, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => {
                            if (player.current) {
                              player.current.currentTime = s.start;
                              void player.current.play();
                            }
                          }}
                          className="flex w-full gap-3 px-4 py-2 text-left hover:bg-muted/60"
                        >
                          <span className="tabular w-14 shrink-0 text-xs leading-6 text-muted-foreground">{formatTime(s.start)}</span>
                          <span className="leading-6">{s.text.trim()}</span>
                        </button>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <textarea value={text} onChange={(e) => setText(e.target.value)} aria-label="Transcript" className="block min-h-64 w-full resize-y bg-transparent p-4 leading-7 outline-none" />
                )}
              </div>
            )}
          </>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <aside className="space-y-5 self-start rounded-xl border bg-card p-4" aria-label="Options">
        {!file && (
          <Segmented
            label="Source"
            value={source}
            onChange={setSource}
            options={[
              { value: "file", label: "Upload a file" },
              { value: "record", label: "Record" },
            ]}
          />
        )}
        <div className="space-y-2">
          <Label htmlFor="lang">Spoken language</Label>
          <select id="lang" value={language} onChange={(e) => setLanguage(e.target.value)} className="h-9 w-full rounded-lg border bg-background px-2 text-sm">
            {LANGUAGES.map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Model</Label>
          <Segmented
            label="Model"
            value={model}
            onChange={setModel}
            options={[
              { value: "fast", label: `Fast · ${WHISPER_MODELS.fast.sizeMb} MB` },
              { value: "accurate", label: `Accurate · ${WHISPER_MODELS.accurate.sizeMb} MB` },
            ]}
          />
          <p className="text-xs text-muted-foreground">Downloads once, then works offline. Accurate is better for accents, noise and non-English speech.</p>
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="translate">Translate to English</Label>
          <Switch id="translate" checked={translate} onCheckedChange={setTranslate} />
        </div>

        <div className="space-y-2 border-t pt-4">
          {!running ? (
            <Button className="w-full" disabled={!file} onClick={run}>
              {translate ? "Transcribe and translate" : "Transcribe"}
            </Button>
          ) : (
            <div role="status" className="space-y-2">
              <p className="text-sm">
                {status.phase === "decoding"
                  ? "Reading the audio…"
                  : status.phase === "download"
                    ? `Downloading the model (${WHISPER_MODELS[model].sizeMb} MB, first time only)… ${status.percent}%`
                    : `Transcribing… part ${Math.min(status.done + 1, status.total)} of ${status.total}`}
              </p>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground transition-[width]"
                  style={{ width: `${status.phase === "download" ? status.percent : status.phase === "running" ? Math.round((status.done / status.total) * 100) : 5}%` }}
                />
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={cancelTranscription}>
                Stop
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">Runs on your device. A one-hour recording can take several minutes on a laptop.</p>
        </div>
      </aside>
    </div>
  );
}

function Recorder({ onDone }: { onDone: (f: File) => void }) {
  const [rec, setRec] = useState<MediaRecorder | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rec) return;
    const started = Date.now();
    const t = setInterval(() => setSeconds((Date.now() - started) / 1000), 250);
    return () => clearInterval(t);
  }, [rec]);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const r = new MediaRecorder(stream);
      const parts: Blob[] = [];
      r.ondataavailable = (e) => e.data.size && parts.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const type = r.mimeType || "audio/webm";
        onDone(new File(parts, `recording-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}.${type.includes("mp4") ? "m4a" : "webm"}`, { type }));
      };
      r.start(1000);
      setSeconds(0);
      setRec(r);
    } catch {
      setError("Microphone access was blocked. Allow it in the browser's address bar and try again.");
    }
  };

  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-10 text-center">
      {rec ? (
        <>
          <p className="tabular text-4xl font-semibold">{formatTime(seconds).replace(/\.\d$/, "")}</p>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="size-2 animate-pulse rounded-full bg-red-500" /> Recording
          </p>
          <Button className="mt-5" onClick={() => (rec.stop(), setRec(null))}>
            Stop and use recording
          </Button>
        </>
      ) : (
        <>
          <p className="text-lg font-semibold">Record from your microphone</p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">The recording stays on this device and is transcribed here.</p>
          <Button className="mt-5" onClick={start}>
            Start recording
          </Button>
        </>
      )}
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </div>
  );
}
