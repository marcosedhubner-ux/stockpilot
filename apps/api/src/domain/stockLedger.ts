import { ConflictError } from "./errors.js";

export type MovementInput =
  | { type: "RECEIVED" | "RETURNED"; quantity: number }
  | { type: "SOLD"; quantity: number }
  | { type: "ADJUSTED"; delta: number };

export function computeDelta(input: MovementInput): number {
  switch (input.type) {
    case "RECEIVED":
    case "RETURNED":
      return input.quantity;
    case "SOLD":
      return -input.quantity;
    case "ADJUSTED":
      return input.delta;
  }
}

export class InsufficientStockError extends ConflictError {
  constructor(productName: string, available: number, requested: number) {
    super(`${productName} only has ${available} units on hand, cannot remove ${requested}`);
  }
}

export function assertSufficientStock(currentQuantity: number, delta: number, productName: string): void {
  if (currentQuantity + delta < 0) {
    throw new InsufficientStockError(productName, currentQuantity, -delta);
  }
}

export function isBelowReorderPoint(quantityOnHand: number, reorderPoint: number): boolean {
  return quantityOnHand <= reorderPoint;
}
