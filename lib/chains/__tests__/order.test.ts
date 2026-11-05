import { describe, expect, it } from "vitest";
import { isSameSteps, moveStep, moveStepTo } from "../order";

const steps = ["describe", "joke", "captions"];

describe("moveStep", () => {
  it("swaps a step with its neighbour", () => {
    expect(moveStep(steps, "joke", "up")).toEqual(["joke", "describe", "captions"]);
    expect(moveStep(steps, "joke", "down")).toEqual(["describe", "captions", "joke"]);
  });
  it("refuses to move past either end or an unknown step", () => {
    expect(moveStep(steps, "describe", "up")).toBeNull();
    expect(moveStep(steps, "captions", "down")).toBeNull();
    expect(moveStep(steps, "missing", "up")).toBeNull();
  });
  it("does not change the list it was given", () => {
    moveStep(steps, "joke", "up");
    expect(steps).toEqual(["describe", "joke", "captions"]);
  });
});

describe("moveStepTo", () => {
  it("moves step 2 to step 1", () => {
    expect(moveStepTo(steps, "joke", 1)).toEqual(["joke", "describe", "captions"]);
  });
  it("moves a step across several places", () => {
    expect(moveStepTo(steps, "describe", 3)).toEqual(["joke", "captions", "describe"]);
    expect(moveStepTo(steps, "captions", 1)).toEqual(["captions", "describe", "joke"]);
  });
  it("refuses a position outside the chain, a no-op, or an unknown step", () => {
    expect(moveStepTo(steps, "joke", 0)).toBeNull();
    expect(moveStepTo(steps, "joke", 4)).toBeNull();
    expect(moveStepTo(steps, "joke", 1.5)).toBeNull();
    expect(moveStepTo(steps, "joke", 2)).toBeNull();
    expect(moveStepTo(steps, "missing", 1)).toBeNull();
  });
});

describe("isSameSteps", () => {
  it("accepts any reordering of the same ids", () => {
    expect(isSameSteps(steps, ["captions", "describe", "joke"])).toBe(true);
  });
  it("rejects missing, extra, or repeated ids", () => {
    expect(isSameSteps(steps, ["describe", "joke"])).toBe(false);
    expect(isSameSteps(steps, ["describe", "joke", "captions", "extra"])).toBe(false);
    expect(isSameSteps(steps, ["describe", "joke", "joke"])).toBe(false);
  });
});
