"use server";

import { revalidatePath } from "next/cache";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSameSteps } from "./order";
import { isUuid, validateChain, validateStep } from "./validation";

export type ActionResult<T = undefined> =
  | (T extends undefined ? { ok: true } : { ok: true; value: T })
  | { ok: false; errors: string[] };

const fail = (...errors: string[]) => ({ ok: false as const, errors });

type RawChain = Parameters<typeof validateChain>[0];
type RawStep = Parameters<typeof validateStep>[0];

export async function createChain(raw: RawChain): Promise<ActionResult<{ id: string }>> {
  await requireSuperadmin();
  const checked = validateChain(raw);
  if (!checked.ok) return fail(...checked.errors);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prompt_chains")
    .insert({
      name: checked.value.name,
      description: checked.value.description,
      mix_weight: checked.value.mixWeight,
      is_active: checked.value.isActive,
    })
    .select("id")
    .single();
  if (error) return fail(error.code === "23505" ? "A chain with that name already exists." : error.message);
  revalidatePath("/", "layout");
  return { ok: true, value: { id: data.id } };
}

export async function updateChain(chainId: string, raw: RawChain): Promise<ActionResult> {
  await requireSuperadmin();
  if (!isUuid(chainId)) return fail("Unknown chain.");
  const checked = validateChain(raw);
  if (!checked.ok) return fail(...checked.errors);
  const supabase = await createClient();
  const { error } = await supabase
    .from("prompt_chains")
    .update({
      name: checked.value.name,
      description: checked.value.description,
      mix_weight: checked.value.mixWeight,
      is_active: checked.value.isActive,
    })
    .eq("id", chainId);
  if (error) return fail(error.code === "23505" ? "A chain with that name already exists." : error.message);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteChain(chainId: string): Promise<ActionResult> {
  await requireSuperadmin();
  if (!isUuid(chainId)) return fail("Unknown chain.");
  const supabase = await createClient();
  const { error } = await supabase.from("prompt_chains").delete().eq("id", chainId);
  if (error) return fail(error.message);
  revalidatePath("/", "layout");
  return { ok: true };
}

async function stepIdsInOrder(supabase: Awaited<ReturnType<typeof createClient>>, chainId: string) {
  const { data, error } = await supabase
    .from("prompt_chain_steps")
    .select("id, position")
    .eq("chain_id", chainId)
    .order("position");
  if (error) throw new Error(`Failed to read the chain's steps: ${error.message}`);
  return data;
}

// A new step goes on the end.
export async function createStep(chainId: string, raw: RawStep): Promise<ActionResult> {
  await requireSuperadmin();
  if (!isUuid(chainId)) return fail("Unknown chain.");
  const checked = validateStep(raw);
  if (!checked.ok) return fail(...checked.errors);
  const supabase = await createClient();
  const existing = await stepIdsInOrder(supabase, chainId);
  const position = (existing[existing.length - 1]?.position ?? 0) + 1;
  const { error } = await supabase.from("prompt_chain_steps").insert({
    chain_id: chainId,
    position,
    name: checked.value.name,
    llm_model_id: checked.value.llmModelId,
    temperature: checked.value.temperature,
    system_prompt: checked.value.systemPrompt,
    user_prompt: checked.value.userPrompt,
    uses_image: checked.value.usesImage,
  });
  if (error) return fail(error.message);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateStep(stepId: string, raw: RawStep): Promise<ActionResult> {
  await requireSuperadmin();
  if (!isUuid(stepId)) return fail("Unknown step.");
  const checked = validateStep(raw);
  if (!checked.ok) return fail(...checked.errors);
  const supabase = await createClient();
  const { error } = await supabase
    .from("prompt_chain_steps")
    .update({
      name: checked.value.name,
      llm_model_id: checked.value.llmModelId,
      temperature: checked.value.temperature,
      system_prompt: checked.value.systemPrompt,
      user_prompt: checked.value.userPrompt,
      uses_image: checked.value.usesImage,
    })
    .eq("id", stepId);
  if (error) return fail(error.message);
  revalidatePath("/", "layout");
  return { ok: true };
}

// Deleting a step closes the gap, so positions always read 1, 2, 3.
export async function deleteStep(chainId: string, stepId: string): Promise<ActionResult> {
  await requireSuperadmin();
  if (!isUuid(chainId) || !isUuid(stepId)) return fail("Unknown step.");
  const supabase = await createClient();
  const { error } = await supabase.from("prompt_chain_steps").delete().eq("id", stepId).eq("chain_id", chainId);
  if (error) return fail(error.message);
  const remaining = await stepIdsInOrder(supabase, chainId);
  if (remaining.length > 0) {
    const { error: reorderError } = await supabase.rpc("admin_reorder_chain_steps", {
      p_chain_id: chainId,
      p_step_ids: remaining.map((step) => step.id),
    });
    if (reorderError) return fail(reorderError.message);
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

// The database function applies the whole new order in one transaction.
export async function reorderSteps(chainId: string, stepIds: string[]): Promise<ActionResult> {
  await requireSuperadmin();
  if (!isUuid(chainId) || !Array.isArray(stepIds) || !stepIds.every(isUuid)) return fail("Unknown step.");
  const supabase = await createClient();
  const current = await stepIdsInOrder(supabase, chainId);
  if (!isSameSteps(current.map((step) => step.id), stepIds)) {
    return fail("The steps changed while you were reordering. Reload and try again.");
  }
  const { error } = await supabase.rpc("admin_reorder_chain_steps", { p_chain_id: chainId, p_step_ids: stepIds });
  if (error) return fail(error.message);
  revalidatePath("/", "layout");
  return { ok: true };
}
