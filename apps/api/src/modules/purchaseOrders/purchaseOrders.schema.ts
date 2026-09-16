import { z } from "zod";

export const createPurchaseOrderSchema = z.object({
  supplierId: z.string().cuid(),
  items: z
    .array(
      z.object({
        productId: z.string().cuid(),
        quantityOrdered: z.number().int().positive(),
        unitCost: z.number().positive().max(1_000_000),
      })
    )
    .min(1),
});

export const receiveItemsSchema = z.object({
  items: z
    .array(
      z.object({
        itemId: z.string().cuid(),
        quantityReceived: z.number().int().positive(),
      })
    )
    .min(1),
});

export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>;
export type ReceiveItemsInput = z.infer<typeof receiveItemsSchema>;
