"use client";

import { useState, useTransition, type FormEvent } from "react";
import { createStep, deleteStep, reorderSteps, updateStep } from "@/lib/chains/actions";
import type { ModelRow, StepRow } from "@/lib/chains/data";
import { moveStep, moveStepTo } from "@/lib/chains/order";

const VARIABLES = "${previousOutput} ${captionCount} ${examples} ${note}";

function StepFields({
  step,
  models,
  submitLabel,
  onSubmit,
  pending,
}: {
  step: StepRow | null;
  models: ModelRow[];
  submitLabel: string;
  onSubmit: (input: {
    name: string;
    llmModelId: string;
    temperature: number;
    systemPrompt: string;
    userPrompt: string;
    usesImage: boolean;
  }) => void;
  pending: boolean;
}) {
  const [name, setName] = useState(step?.name ?? "");
  const [llmModelId, setLlmModelId] = useState(step?.llm_model_id ?? models[0]?.id ?? "");
  const [temperature, setTemperature] = useState(step ? Number(step.temperature) : 1);
  const [systemPrompt, setSystemPrompt] = useState(step?.system_prompt ?? "");
  const [userPrompt, setUserPrompt] = useState(step?.user_prompt ?? "");
  const [usesImage, setUsesImage] = useState(step?.uses_image ?? true);

  function submit(event: FormEvent) {
    event.preventDefault();
    onSubmit({ name, llmModelId, temperature, systemPrompt, userPrompt, usesImage });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Step name
          <input value={name} onChange={(e) => setName(e.target.value)} className="field w-56" maxLength={80} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Model
          <select value={llmModelId} onChange={(e) => setLlmModelId(e.target.value)} className="field">
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
                {model.is_active ? "" : " (inactive)"}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Temperature
          <input
            type="number"
            min={0}
            max={2}
            step={0.1}
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="field w-20"
          />
        </label>
        <label className="flex items-center gap-1 pb-1.5 text-sm">
          <input type="checkbox" checked={usesImage} onChange={(e) => setUsesImage(e.target.checked)} /> Sees the photo
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        System prompt (optional)
        <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={2} className="field font-mono text-xs" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>
          Prompt <span className="text-muted">Variables: {VARIABLES}</span>
        </span>
        <textarea value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} rows={5} className="field font-mono text-xs" />
      </label>
      <div>
        <button type="submit" disabled={pending} className="btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export function StepEditor({
  chainId,
  step,
  stepIds,
  models,
}: {
  chainId: string;
  step: StepRow;
  // Every step id of the chain, in order, so moves can be computed here.
  stepIds: string[];
  models: ModelRow[];
}) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const index = stepIds.indexOf(step.id);
  const model = models.find((m) => m.id === step.llm_model_id);

  function run(action: () => Promise<{ ok: true } | { ok: false; errors: string[] }>, after?: () => void) {
    setErrors([]);
    setSaved(false);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setErrors(result.errors);
      else after?.();
    });
  }

  function move(next: string[] | null) {
    if (next) run(() => reorderSteps(chainId, next));
  }

  return (
    <li className="panel flex flex-col gap-3 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-foreground px-2 py-0.5 text-xs text-background">Step {index + 1}</span>
        <span className="font-semibold">{step.name}</span>
        <span className="text-sm text-muted">
          {model?.name ?? "missing model"} · temp {Number(step.temperature)} · {step.uses_image ? "sees the photo" : "text only"}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-1">
          <button
            type="button"
            aria-label={`Move ${step.name} up`}
            disabled={pending || index === 0}
            onClick={() => move(moveStep(stepIds, step.id, "up"))}
            className="btn-outline btn-xs"
          >
            ↑ Up
          </button>
          <button
            type="button"
            aria-label={`Move ${step.name} down`}
            disabled={pending || index === stepIds.length - 1}
            onClick={() => move(moveStep(stepIds, step.id, "down"))}
            className="btn-outline btn-xs"
          >
            ↓ Down
          </button>
          <label className="flex items-center gap-1 text-xs text-muted">
            Move to
            <select
              aria-label={`Move ${step.name} to position`}
              value={index + 1}
              disabled={pending || stepIds.length < 2}
              onChange={(e) => move(moveStepTo(stepIds, step.id, Number(e.target.value)))}
              className="field w-14 py-0.5 text-xs"
            >
              {stepIds.map((id, i) => (
                <option key={id} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={() => setOpen(!open)} className="btn-outline btn-xs">
            {open ? "Close" : "Edit"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (window.confirm(`Delete step "${step.name}"?`)) run(() => deleteStep(chainId, step.id));
            }}
            className="btn-outline btn-xs"
          >
            Delete
          </button>
        </div>
      </div>
      {!open && <pre className="whitespace-pre-wrap rounded bg-surface p-2 text-xs">{step.user_prompt}</pre>}
      {open && (
        <StepFields
          key={step.id}
          step={step}
          models={models}
          submitLabel="Save step"
          pending={pending}
          onSubmit={(input) => run(() => updateStep(step.id, input), () => setSaved(true))}
        />
      )}
      {saved && <p className="text-sm">Saved.</p>}
      {errors.length > 0 && (
        <ul role="alert" className="list-disc pl-5 text-sm font-semibold">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
    </li>
  );
}

export function AddStep({ chainId, models, nextNumber }: { chainId: string; models: ModelRow[]; nextNumber: number }) {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  if (models.length === 0) {
    return <p className="text-sm">Add a model in the admin area before creating steps.</p>;
  }
  if (!open) {
    return (
      <div>
        <button type="button" onClick={() => setOpen(true)} className="btn-primary">
          Add step {nextNumber}
        </button>
      </div>
    );
  }
  return (
    <div className="panel flex flex-col gap-3 p-3">
      <div className="flex items-center gap-2">
        <span className="font-semibold">New step {nextNumber}</span>
        <button type="button" onClick={() => setOpen(false)} className="ml-auto text-sm underline">
          Cancel
        </button>
      </div>
      <StepFields
        key={formKey}
        step={null}
        models={models}
        submitLabel="Add step"
        pending={pending}
        onSubmit={(input) => {
          setErrors([]);
          startTransition(async () => {
            const result = await createStep(chainId, input);
            if (!result.ok) {
              setErrors(result.errors);
              return;
            }
            setFormKey((key) => key + 1);
            setOpen(false);
          });
        }}
      />
      {errors.length > 0 && (
        <ul role="alert" className="list-disc pl-5 text-sm font-semibold">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
