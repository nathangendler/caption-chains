"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createChain, deleteChain, updateChain } from "@/lib/chains/actions";
import type { ChainRow } from "@/lib/chains/data";

export function ChainForm({ chain }: { chain: ChainRow | null }) {
  const router = useRouter();
  const [name, setName] = useState(chain?.name ?? "");
  const [description, setDescription] = useState(chain?.description ?? "");
  const [mixWeight, setMixWeight] = useState(chain?.mix_weight ?? 0);
  const [isActive, setIsActive] = useState(chain?.is_active ?? true);
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent) {
    event.preventDefault();
    setErrors([]);
    setSaved(false);
    const input = { name, description, mixWeight, isActive };
    startTransition(async () => {
      if (chain) {
        const result = await updateChain(chain.id, input);
        if (!result.ok) setErrors(result.errors);
        else setSaved(true);
        return;
      }
      const result = await createChain(input);
      if (!result.ok) setErrors(result.errors);
      else router.push(`/chains/${result.value.id}`);
    });
  }

  function remove() {
    if (!chain) return;
    if (!window.confirm(`Delete "${chain.name}" and all of its steps? Media it already generated is kept.`)) return;
    setErrors([]);
    startTransition(async () => {
      const result = await deleteChain(chain.id);
      if (!result.ok) setErrors(result.errors);
      else router.push("/");
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} className="field w-64" maxLength={80} />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Description
          <input value={description} onChange={(e) => setDescription(e.target.value)} className="field min-w-64" maxLength={300} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Mix weight
          <input
            type="number"
            min={0}
            value={mixWeight}
            onChange={(e) => setMixWeight(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
            className="field w-24"
          />
        </label>
        <label className="flex items-center gap-1 pb-1.5 text-sm">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Active
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn-primary">
          {chain ? "Save chain" : "Create chain"}
        </button>
        {chain && (
          <button type="button" disabled={pending} onClick={remove} className="btn-outline">
            Delete chain
          </button>
        )}
        {saved && <span className="text-sm">Saved.</span>}
      </div>
      {errors.length > 0 && (
        <ul role="alert" className="list-disc pl-5 text-sm font-semibold">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
      {chain && (
        <p className="text-xs text-muted">
          Weight sets how often the app picks this chain for new moments, relative to other active chains. Zero keeps
          it out of the app while you test it here.
        </p>
      )}
    </form>
  );
}
