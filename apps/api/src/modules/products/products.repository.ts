import { prisma } from "../../db/client.js";
import type { Prisma } from "@prisma/client";

export function findAllProducts() {
  return prisma.product.findMany({
    include: { supplier: true },
    orderBy: { name: "asc" },
  });
}

export function findProductById(id: string) {
  return prisma.product.findUnique({ where: { id } });
}

export function createProduct(data: Prisma.ProductCreateInput) {
  return prisma.product.create({ data });
}

export function findMovementsForProduct(productId: string) {
  return prisma.stockMovement.findMany({
    where: { productId },
    include: { recordedBy: { select: { id: true, fullName: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function applyMovement(
  productId: string,
  delta: number,
  movementData: Omit<Prisma.StockMovementUncheckedCreateInput, "productId">
) {
  return prisma.$transaction(async (tx) => {
    const updateResult = await tx.product.updateMany({
      where: { id: productId, quantityOnHand: { gte: -delta } },
      data: { quantityOnHand: { increment: delta } },
    });

    if (updateResult.count === 0) {
      return { applied: false as const };
    }

    const movement = await tx.stockMovement.create({ data: { ...movementData, productId } });
    return { applied: true as const, movement };
  });
}
