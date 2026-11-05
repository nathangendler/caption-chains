import { describe, expect, it } from "vitest";
import { validateChain, validateStep } from "../validation";

const MODEL = "11111111-1111-4111-8111-111111111111";

describe("validateChain", () => {
  it("trims and accepts a valid chain", () => {
    expect(validateChain({ name: "  Three step  ", description: " ", mixWeight: 10, isActive: true })).toEqual({
      ok: true,
      value: { name: "Three step", description: null, mixWeight: 10, isActive: true },
    });
  });
  it("reports every problem at once", () => {
    expect(
      validateChain({ name: "", description: "x".repeat(301), mixWeight: -1, isActive: "yes" })
    ).toEqual({
      ok: false,
      errors: [
        "Give the chain a name.",
        "Keep the description under 300 characters.",
        "Weight must be a whole number of zero or more.",
        "Active must be on or off.",
      ],
    });
  });
  it("rejects fractional weights and over-long names", () => {
    expect(validateChain({ name: "ok", description: "", mixWeight: 1.5, isActive: true }).ok).toBe(false);
    expect(validateChain({ name: "x".repeat(81), description: "", mixWeight: 1, isActive: true }).ok).toBe(false);
  });
});

describe("validateStep", () => {
  const valid = {
    name: "Describe the photo",
    llmModelId: MODEL,
    temperature: 0.7,
    systemPrompt: "",
    userPrompt: "Describe this photo in two sentences.",
    usesImage: true,
  };
  it("accepts a valid step and keeps prompt whitespace as written", () => {
    expect(validateStep({ ...valid, userPrompt: "Line one\n  Line two\n" })).toEqual({
      ok: true,
      value: { ...valid, userPrompt: "Line one\n  Line two\n" },
    });
  });
  it("reports every problem at once", () => {
    expect(
      validateStep({ name: " ", llmModelId: "nope", temperature: 3, systemPrompt: "", userPrompt: "  ", usesImage: null })
    ).toEqual({
      ok: false,
      errors: [
        "Give the step a name.",
        "Pick a model.",
        "Temperature must be between 0 and 2.",
        "Write the prompt for this step.",
        "Say whether this step sees the photo.",
      ],
    });
  });
  it("accepts the temperature bounds and rejects non-numbers", () => {
    expect(validateStep({ ...valid, temperature: 0 }).ok).toBe(true);
    expect(validateStep({ ...valid, temperature: 2 }).ok).toBe(true);
    expect(validateStep({ ...valid, temperature: Number.NaN }).ok).toBe(false);
    expect(validateStep({ ...valid, temperature: "1" }).ok).toBe(false);
  });
});
