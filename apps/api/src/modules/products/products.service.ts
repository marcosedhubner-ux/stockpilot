import { Prisma } from "@prisma/client";
import * as productsRepository from "./products.repository.js";
import { ConflictError, NotFoundError } from "../../domain/errors.js";
import { computeDelta } from "../../domain/stockLedger.js";
import type { CreateProductInput, RecordMovementInput } from "./products.schema.js";

export async function listProducts() {
  const products = await productsRepository.findAllProducts();
  return products.map((product) => ({
    ...product,
    isBelowReorderPoint: product.quantityOnHand <= product.reorderPoint,
  }));
}

export async function createProduct(input: CreateProductInput) {
  try {
    const { initialQuantity, ...productFields } = input;
    return await productsRepository.createProduct({
      ...productFields,
      quantityOnHand: initialQuantity,
      supplier: input.supplierId ? { connect: { id: input.supplierId } } : undefined,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ConflictError(`SKU ${input.sku} is already in use`);
    }
    throw err;
  }
}

export async function recordMovement(productId: string, input: RecordMovementInput, staffId: string) {
  const product = await productsRepository.findProductById(productId);
  if (!product) {
    throw new NotFoundError("Product");
  }

  const delta = computeDelta(input);

  const result = await productsRepository.applyMovement(productId, delta, {
    type: input.type,
    quantity: delta,
    note: input.note,
    recordedById: staffId,
  });

  if (!result.applied) {
    const requested = "quantity" in input ? input.quantity : Math.abs(input.delta);
    throw new ConflictError(`${product.name} only has ${product.quantityOnHand} units on hand, cannot remove ${requested}`);
  }

  return result.movement;
}

export function listMovements(productId: string) {
  return productsRepository.findMovementsForProduct(productId);
}
