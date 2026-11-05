// Pure input checks for chains and steps. Every problem is reported at once.

export type ChainInput = { name: string; description: string | null; mixWeight: number; isActive: boolean };

export type StepInput = {
  name: string;
  llmModelId: string;
  temperature: number;
  systemPrompt: string;
  userPrompt: string;
  usesImage: boolean;
};

export type Validated<T> = { ok: true; value: T } | { ok: false; errors: string[] };

export const LIMITS = { name: 80, description: 300, prompt: 8000, maxTemperature: 2 } as const;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

export function validateChain(raw: {
  name: unknown;
  description: unknown;
  mixWeight: unknown;
  isActive: unknown;
}): Validated<ChainInput> {
  const errors: string[] = [];
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  if (!name) errors.push("Give the chain a name.");
  else if (name.length > LIMITS.name) errors.push(`Keep the name under ${LIMITS.name} characters.`);

  const description = typeof raw.description === "string" ? raw.description.trim() : "";
  if (description.length > LIMITS.description) {
    errors.push(`Keep the description under ${LIMITS.description} characters.`);
  }

  if (typeof raw.mixWeight !== "number" || !Number.isInteger(raw.mixWeight) || raw.mixWeight < 0) {
    errors.push("Weight must be a whole number of zero or more.");
  }
  if (typeof raw.isActive !== "boolean") errors.push("Active must be on or off.");

  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      name,
      description: description || null,
      mixWeight: raw.mixWeight as number,
      isActive: raw.isActive as boolean,
    },
  };
}

export function validateStep(raw: {
  name: unknown;
  llmModelId: unknown;
  temperature: unknown;
  systemPrompt: unknown;
  userPrompt: unknown;
  usesImage: unknown;
}): Validated<StepInput> {
  const errors: string[] = [];
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  if (!name) errors.push("Give the step a name.");
  else if (name.length > LIMITS.name) errors.push(`Keep the step name under ${LIMITS.name} characters.`);

  if (!isUuid(raw.llmModelId)) errors.push("Pick a model.");

  if (
    typeof raw.temperature !== "number" ||
    !Number.isFinite(raw.temperature) ||
    raw.temperature < 0 ||
    raw.temperature > LIMITS.maxTemperature
  ) {
    errors.push(`Temperature must be between 0 and ${LIMITS.maxTemperature}.`);
  }

  const systemPrompt = typeof raw.systemPrompt === "string" ? raw.systemPrompt : "";
  if (systemPrompt.length > LIMITS.prompt) errors.push(`Keep the system prompt under ${LIMITS.prompt} characters.`);

  const userPrompt = typeof raw.userPrompt === "string" ? raw.userPrompt : "";
  if (!userPrompt.trim()) errors.push("Write the prompt for this step.");
  else if (userPrompt.length > LIMITS.prompt) errors.push(`Keep the prompt under ${LIMITS.prompt} characters.`);

  if (typeof raw.usesImage !== "boolean") errors.push("Say whether this step sees the photo.");

  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      name,
      llmModelId: raw.llmModelId as string,
      temperature: raw.temperature as number,
      systemPrompt,
      userPrompt,
      usesImage: raw.usesImage as boolean,
    },
  };
}
