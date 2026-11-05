// Pure helpers for reordering a chain's steps.

export type Direction = "up" | "down";

// The id list after moving one step one place. Null when the move is impossible
// (unknown step, or already first/last), so callers can disable the control.
export function moveStep(stepIds: string[], stepId: string, direction: Direction): string[] | null {
  const index = stepIds.indexOf(stepId);
  if (index < 0) return null;
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= stepIds.length) return null;
  const next = [...stepIds];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

// The id list after moving a step to a 1-based position, as in "move step 2 to step 1".
export function moveStepTo(stepIds: string[], stepId: string, position: number): string[] | null {
  const index = stepIds.indexOf(stepId);
  if (index < 0 || !Number.isInteger(position) || position < 1 || position > stepIds.length) return null;
  if (index === position - 1) return null;
  const next = stepIds.filter((id) => id !== stepId);
  next.splice(position - 1, 0, stepId);
  return next;
}

// True when `proposed` is the same set of ids as `current`, each exactly once.
export function isSameSteps(current: string[], proposed: string[]): boolean {
  if (current.length !== proposed.length) return false;
  const seen = new Set(proposed);
  return seen.size === proposed.length && current.every((id) => seen.has(id));
}
