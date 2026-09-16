import { describe, expect, it } from "vitest";
import {
  assertSufficientStock,
  computeDelta,
  InsufficientStockError,
  isBelowReorderPoint,
} from "../src/domain/stockLedger.js";

describe("computeDelta", () => {
  it("treats received stock as a positive delta", () => {
    expect(computeDelta({ type: "RECEIVED", quantity: 10 })).toBe(10);
  });

  it("treats returned stock as a positive delta", () => {
    expect(computeDelta({ type: "RETURNED", quantity: 3 })).toBe(3);
  });

  it("treats sold stock as a negative delta", () => {
    expect(computeDelta({ type: "SOLD", quantity: 4 })).toBe(-4);
  });

  it("passes an adjustment delta through as-is, positive or negative", () => {
    expect(computeDelta({ type: "ADJUSTED", delta: -2 })).toBe(-2);
    expect(computeDelta({ type: "ADJUSTED", delta: 5 })).toBe(5);
  });
});

describe("assertSufficientStock", () => {
  it("allows a movement that keeps stock at zero or above", () => {
    expect(() => assertSufficientStock(10, -10, "Widget")).not.toThrow();
  });

  it("rejects a movement that would drive stock negative", () => {
    expect(() => assertSufficientStock(5, -6, "Widget")).toThrow(InsufficientStockError);
  });

  it("always allows movements that increase stock", () => {
    expect(() => assertSufficientStock(0, 100, "Widget")).not.toThrow();
  });
});

describe("isBelowReorderPoint", () => {
  it("flags stock at or below the reorder point", () => {
    expect(isBelowReorderPoint(5, 5)).toBe(true);
    expect(isBelowReorderPoint(4, 5)).toBe(true);
  });

  it("does not flag stock above the reorder point", () => {
    expect(isBelowReorderPoint(6, 5)).toBe(false);
  });
});
