import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type T = Database["public"]["Tables"];
export type ChainRow = T["prompt_chains"]["Row"];
export type StepRow = T["prompt_chain_steps"]["Row"];
export type ModelRow = T["llm_models"]["Row"];

export type ChainSummary = ChainRow & { stepCount: number; mediaCount: number };

export const loadChains = cache(async (): Promise<ChainSummary[]> => {
  const supabase = await createClient();
  const [chains, steps, media] = await Promise.all([
    supabase.from("prompt_chains").select("*").order("name"),
    supabase.from("prompt_chain_steps").select("chain_id"),
    supabase.from("generations").select("prompt_chain_id").not("prompt_chain_id", "is", null),
  ]);
  if (chains.error) throw new Error(`Failed to load chains: ${chains.error.message}`);
  if (steps.error) throw new Error(`Failed to load steps: ${steps.error.message}`);
  if (media.error) throw new Error(`Failed to load media counts: ${media.error.message}`);
  const stepCounts = new Map<string, number>();
  for (const step of steps.data) stepCounts.set(step.chain_id, (stepCounts.get(step.chain_id) ?? 0) + 1);
  const mediaCounts = new Map<string, number>();
  for (const row of media.data) {
    if (row.prompt_chain_id) mediaCounts.set(row.prompt_chain_id, (mediaCounts.get(row.prompt_chain_id) ?? 0) + 1);
  }
  return chains.data.map((chain) => ({
    ...chain,
    stepCount: stepCounts.get(chain.id) ?? 0,
    mediaCount: mediaCounts.get(chain.id) ?? 0,
  }));
});

export async function loadChain(
  id: string
): Promise<{ chain: ChainRow; steps: StepRow[]; models: ModelRow[] } | null> {
  const supabase = await createClient();
  const [chain, steps, models] = await Promise.all([
    supabase.from("prompt_chains").select("*").eq("id", id).maybeSingle(),
    supabase.from("prompt_chain_steps").select("*").eq("chain_id", id).order("position"),
    // Active models first, so the step form never offers an unusable one by default.
    supabase.from("llm_models").select("*").order("is_active", { ascending: false }).order("name"),
  ]);
  if (chain.error) throw new Error(`Failed to load the chain: ${chain.error.message}`);
  if (steps.error) throw new Error(`Failed to load its steps: ${steps.error.message}`);
  if (models.error) throw new Error(`Failed to load models: ${models.error.message}`);
  if (!chain.data) return null;
  return { chain: chain.data, steps: steps.data, models: models.data };
}

export type ChainMedia = {
  id: string;
  imageUrl: string;
  note: string | null;
  createdAt: string;
  isTest: boolean;
  isPosted: boolean;
  model: string;
  captions: Array<{ position: number; text: string; isWinner: boolean }>;
};

// Everything a chain has generated: test runs from this tool and real moments from the app.
export async function loadChainMedia(chainId: string, limit: number): Promise<ChainMedia[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("generations")
    .select(
      "id, image_url, user_note, created_at, is_test, posted_at, model, winner_caption_id, captions!captions_generation_id_fkey(id, position, text)"
    )
    .eq("prompt_chain_id", chainId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Failed to load generated media: ${error.message}`);
  return data.map((row) => ({
    id: row.id,
    imageUrl: row.image_url,
    note: row.user_note,
    createdAt: row.created_at,
    isTest: row.is_test,
    isPosted: row.posted_at !== null,
    model: row.model,
    captions: [...row.captions]
      .sort((a, b) => a.position - b.position)
      .map((caption) => ({
        position: caption.position,
        text: caption.text,
        isWinner: caption.id === row.winner_caption_id,
      })),
  }));
}
