import { z } from "zod";

export const createSupplierSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
