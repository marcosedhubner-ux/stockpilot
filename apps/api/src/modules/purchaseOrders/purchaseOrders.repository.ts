import { prisma } from "../../db/client.js";
import type { Prisma } from "@prisma/client";

const purchaseOrderInclude = {
  supplier: true,
  items: { include: { product: true } },
} satisfies Prisma.PurchaseOrderInclude;

export function findAll() {
  return prisma.purchaseOrder.findMany({
    include: purchaseOrderInclude,
    orderBy: { createdAt: "desc" },
  });
}

export function findById(id: string) {
  return prisma.purchaseOrder.findUnique({ where: { id }, include: purchaseOrderInclude });
}

export function create(supplierId: string, items: { productId: string; quantityOrdered: number; unitCost: number }[]) {
  return prisma.purchaseOrder.create({
    data: {
      supplierId,
      items: { create: items },
    },
    include: purchaseOrderInclude,
  });
}

export function submit(id: string) {
  return prisma.purchaseOrder.update({
    where: { id },
    data: { status: "SUBMITTED", submittedAt: new Date() },
    include: purchaseOrderInclude,
  });
}

export const include = purchaseOrderInclude;
