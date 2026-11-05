"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { parseRunError, parseRunResult, type RunResult } from "@/lib/chains/run";

const BUCKET = "moments";
const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_EDGE = 1600;

// Shrinks large photos in the browser so the upload and the model request stay small.
async function downscale(file: File): Promise<Blob> {
  if (typeof createImageBitmap !== "function") return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }
  const longest = Math.max(bitmap.width, bitmap.height);
  if (longest <= MAX_EDGE) {
    bitmap.close();
    return file;
  }
  const scale = MAX_EDGE / longest;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return file;
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
  return blob ?? file;
}

export function RunPanel({
  chainId,
  userId,
  stepCount,
  mainAppUrl,
}: {
  chainId: string;
  userId: string;
  stepCount: number;
  mainAppUrl: string;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [captionCount, setCaptionCount] = useState(5);
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [pending, startTransition] = useTransition();

  function generate() {
    if (!file) return;
    if (!TYPES.includes(file.type)) {
      setStatus("Use a JPEG, PNG, or WebP.");
      return;
    }
    setResult(null);
    startTransition(async () => {
      try {
        setStatus("Uploading the photo…");
        const upload = await downscale(file);
        if (upload.size > MAX_BYTES) {
          setStatus("That photo is still over 5 MB after resizing. Try a smaller one.");
          return;
        }
        const supabase = createClient();
        const ext = upload.type === "image/png" ? "png" : upload.type === "image/webp" ? "webp" : "jpg";
        const imagePath = `${userId}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(imagePath, upload, { contentType: upload.type });
        if (uploadError) {
          setStatus(`Upload failed: ${uploadError.message}`);
          return;
        }
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          setStatus("Your session has expired. Sign in again.");
          return;
        }

        setStatus(`Running ${stepCount} ${stepCount === 1 ? "step" : "steps"}…`);
        // The main app holds the provider keys and runs the chain; this is a cross-site call.
        const response = await fetch(`${mainAppUrl}/api/chains/run`, {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ chainId, imagePath, note, captionCount }),
        });
        const body: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          setStatus(parseRunError(body, response.status));
          return;
        }
        const parsed = parseRunResult(body);
        if (!parsed) {
          setStatus("The app answered in a shape this tool does not understand.");
          return;
        }
        setResult(parsed);
        setStatus(null);
        router.refresh();
      } catch (error) {
        setStatus(error instanceof Error ? `The run could not be completed: ${error.message}` : "The run could not be completed.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Photo
          <input type="file" accept={TYPES.join(",")} onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Note, available to steps as {"${note}"} (optional)
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} className="field min-w-56" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Captions wanted
          <input
            type="number"
            min={1}
            max={16}
            value={captionCount}
            onChange={(e) => setCaptionCount(Math.min(16, Math.max(1, Math.floor(Number(e.target.value) || 1))))}
            className="field w-20"
          />
        </label>
        <button type="button" disabled={pending || !file || stepCount === 0} onClick={generate} className="btn-primary">
          {pending ? "Generating…" : "Generate"}
        </button>
      </div>
      {stepCount === 0 && <p className="text-sm">Add at least one step before generating.</p>}
      {status && (
        <p role="status" className="text-sm font-semibold">
          {status}
        </p>
      )}

      {result && (
        <div className="flex flex-col gap-3">
          {result.captions.length > 0 && (
            <div className="panel p-3">
              <p className="mb-2 font-semibold">
                {result.captions.length} {result.captions.length === 1 ? "caption" : "captions"}
              </p>
              <ol className="list-decimal pl-5 text-sm">
                {result.captions.map((caption) => (
                  <li key={caption}>{caption}</li>
                ))}
              </ol>
            </div>
          )}
          {result.note && <p className="text-sm font-semibold">{result.note}</p>}
          <p className="text-sm font-semibold">Step by step</p>
          <ol className="flex flex-col gap-2">
            {result.steps.map((step, index) => (
              <li key={step.stepId} className="panel p-3 text-sm">
                <p className="flex flex-wrap gap-x-3">
                  <span className="font-semibold">
                    {index + 1}. {step.name}
                  </span>
                  <span className="text-muted">{step.model}</span>
                  <span className="text-muted">{step.latencyMs} ms</span>
                </p>
                {step.error ? (
                  <p className="mt-2 font-semibold">Failed: {step.error}</p>
                ) : (
                  <pre className="mt-2 whitespace-pre-wrap rounded bg-surface p-2 text-xs">{step.response}</pre>
                )}
                <details className="mt-2">
                  <summary className="cursor-pointer text-muted">Prompt as sent</summary>
                  <pre className="mt-1 whitespace-pre-wrap rounded bg-surface p-2 text-xs">{step.prompt}</pre>
                </details>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
