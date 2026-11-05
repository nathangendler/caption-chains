// Shape of the main app's /api/chains/run response, checked before it is rendered.

export type StepRun = {
  stepId: string;
  position: number;
  name: string;
  model: string;
  prompt: string;
  response: string | null;
  error: string | null;
  latencyMs: number;
};

export type RunResult = {
  ok: boolean;
  steps: StepRun[];
  captions: string[];
  generationId: string | null;
  note: string | null;
};

function isStepRun(value: unknown): value is StepRun {
  if (!value || typeof value !== "object") return false;
  const step = value as Record<string, unknown>;
  return (
    typeof step.stepId === "string" &&
    typeof step.position === "number" &&
    typeof step.name === "string" &&
    typeof step.model === "string" &&
    typeof step.prompt === "string" &&
    (step.response === null || typeof step.response === "string") &&
    (step.error === null || typeof step.error === "string") &&
    typeof step.latencyMs === "number"
  );
}

export function parseRunResult(value: unknown): RunResult | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  if (
    typeof body.ok !== "boolean" ||
    !Array.isArray(body.steps) ||
    !body.steps.every(isStepRun) ||
    !Array.isArray(body.captions) ||
    !body.captions.every((caption) => typeof caption === "string") ||
    !(body.generationId === null || typeof body.generationId === "string") ||
    !(body.note === null || body.note === undefined || typeof body.note === "string")
  ) {
    return null;
  }
  return {
    ok: body.ok,
    steps: body.steps,
    captions: body.captions,
    generationId: body.generationId,
    note: typeof body.note === "string" ? body.note : null,
  };
}

// A readable message from an error response: { error, details? }.
export function parseRunError(value: unknown, status: number): string {
  if (value && typeof value === "object") {
    const body = value as Record<string, unknown>;
    const details = Array.isArray(body.details) ? body.details.filter((d) => typeof d === "string").join(" ") : "";
    if (typeof body.error === "string") return details ? `${body.error} ${details}` : body.error;
  }
  return `The run failed (HTTP ${status}).`;
}
