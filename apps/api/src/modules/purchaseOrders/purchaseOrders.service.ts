import { prisma } from "../../db/client.js";
import * as purchaseOrdersRepository from "./purchaseOrders.repository.js";
import { ConflictError, NotFoundError } from "../../domain/errors.js";
import type { CreatePurchaseOrderInput, ReceiveItemsInput } from "./purchaseOrders.schema.js";

export function listPurchaseOrders() {
  return purchaseOrdersRepository.findAll();
}

export async function createPurchaseOrder(input: CreatePurchaseOrderInput) {
  const productIds = input.items.map((item) => item.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  if (products.length !== new Set(productIds).size) {
    throw new NotFoundError("One or more products");
  }

  return purchaseOrdersRepository.create(input.supplierId, input.items);
}

export async function submitPurchaseOrder(id: string) {
  const order = await purchaseOrdersRepository.findById(id);
  if (!order) {
    throw new NotFoundError("Purchase order");
  }
  if (order.status !== "DRAFT") {
    throw new ConflictError(`Only draft purchase orders can be submitted (this one is ${order.status})`);
  }

  return purchaseOrdersRepository.submit(id);
}

export async function receiveItems(id: string, input: ReceiveItemsInput, staffId: string) {
  const order = await purchaseOrdersRepository.findById(id);
  if (!order) {
    throw new NotFoundError("Purchase order");
  }
  if (order.status !== "SUBMITTED") {
    throw new ConflictError(`Only submitted purchase orders can receive stock (this one is ${order.status})`);
  }

  const itemsById = new Map(order.items.map((item) => [item.id, item]));

  for (const receipt of input.items) {
    const item = itemsById.get(receipt.itemId);
    if (!item) {
      throw new NotFoundError(`Purchase order item ${receipt.itemId}`);
    }
    const remaining = item.quantityOrdered - item.quantityReceived;
    if (receipt.quantityReceived > remaining) {
      throw new ConflictError(
        `${item.product.name}: only ${remaining} units are still expected on this order`
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    for (const receipt of input.items) {
      const item = itemsById.get(receipt.itemId);
      if (!item) continue;

      await tx.purchaseOrderItem.update({
        where: { id: item.id },
        data: { quantityReceived: { increment: receipt.quantityReceived } },
      });

      await tx.product.update({
        where: { id: item.productId },
        data: { quantityOnHand: { increment: receipt.quantityReceived } },
      });

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          type: "RECEIVED",
          quantity: receipt.quantityReceived,
          note: `Purchase order ${id}`,
          recordedById: staffId,
        },
      });
    }

    const refreshedItems = await tx.purchaseOrderItem.findMany({ where: { purchaseOrderId: id } });
    const fullyReceived = refreshedItems.every((item) => item.quantityReceived >= item.quantityOrdered);

    if (fullyReceived) {
      await tx.purchaseOrder.update({
        where: { id },
        data: { status: "RECEIVED", receivedAt: new Date() },
      });
    }
  });

  return purchaseOrdersRepository.findById(id);
}
