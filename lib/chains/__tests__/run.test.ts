import { describe, expect, it } from "vitest";
import { parseRunError, parseRunResult } from "../run";

const step = {
  stepId: "s1",
  position: 1,
  name: "Describe",
  model: "groq/qwen",
  prompt: "Describe this photo.",
  response: "A dog in a box.",
  error: null,
  latencyMs: 812,
};

describe("parseRunResult", () => {
  it("accepts a successful run", () => {
    const body = { ok: true, chain: { id: "c", name: "n" }, steps: [step], captions: ["one"], generationId: "g1", note: null };
    expect(parseRunResult(body)).toEqual({ ok: true, steps: [step], captions: ["one"], generationId: "g1", note: null });
  });
  it("accepts a run that stopped on a failing step", () => {
    const failed = { ...step, response: null, error: "The model returned an error (429)." };
    expect(parseRunResult({ ok: false, steps: [failed], captions: [], generationId: null })).toEqual({
      ok: false,
      steps: [failed],
      captions: [],
      generationId: null,
      note: null,
    });
  });
  it("rejects bodies in any other shape", () => {
    expect(parseRunResult(null)).toBeNull();
    expect(parseRunResult({ ok: true })).toBeNull();
    expect(parseRunResult({ ok: true, steps: [{ ...step, latencyMs: "fast" }], captions: [], generationId: null })).toBeNull();
    expect(parseRunResult({ ok: true, steps: [], captions: [1], generationId: null })).toBeNull();
  });
});

describe("parseRunError", () => {
  it("joins the error with its details", () => {
    expect(parseRunError({ error: "Invalid request.", details: ["chainId must be a chain id."] }, 400)).toBe(
      "Invalid request. chainId must be a chain id."
    );
  });
  it("falls back to the status when there is no message", () => {
    expect(parseRunError(null, 502)).toBe("The run failed (HTTP 502).");
    expect(parseRunError({ error: "Sign in first." }, 401)).toBe("Sign in first.");
  });
});
