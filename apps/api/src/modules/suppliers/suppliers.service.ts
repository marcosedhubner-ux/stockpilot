import { prisma } from "../../db/client.js";
import type { CreateSupplierInput } from "./suppliers.schema.js";

export function listSuppliers() {
  return prisma.supplier.findMany({ orderBy: { name: "asc" } });
}

export function createSupplier(input: CreateSupplierInput) {
  return prisma.supplier.create({ data: input });
}
