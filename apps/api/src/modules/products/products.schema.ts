import { z } from "zod";

export const createProductSchema = z.object({
  sku: z.string().min(2).max(40),
  name: z.string().min(2).max(120),
  category: z.string().min(2).max(60),
  unitCost: z.number().positive().max(1_000_000),
  reorderPoint: z.number().int().min(0),
  reorderQuantity: z.number().int().min(1),
  supplierId: z.string().cuid().optional(),
  initialQuantity: z.number().int().min(0).default(0),
});

export const recordMovementSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("RECEIVED"), quantity: z.number().int().positive(), note: z.string().max(280).optional() }),
  z.object({ type: z.literal("SOLD"), quantity: z.number().int().positive(), note: z.string().max(280).optional() }),
  z.object({ type: z.literal("RETURNED"), quantity: z.number().int().positive(), note: z.string().max(280).optional() }),
  z.object({ type: z.literal("ADJUSTED"), delta: z.number().int().refine((v) => v !== 0, "delta must not be zero"), note: z.string().max(280).optional() }),
]);

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type RecordMovementInput = z.infer<typeof recordMovementSchema>;
