import { prisma } from "../../db/client.js";
import { isBelowReorderPoint } from "../../domain/stockLedger.js";

export async function getInventorySummary() {
  const products = await prisma.product.findMany({ include: { supplier: true } });

  const totalSkus = products.length;
  const totalInventoryValue = products.reduce(
    (sum, product) => sum + product.quantityOnHand * Number(product.unitCost),
    0
  );

  const reorderSuggestions = products
    .filter((product) => isBelowReorderPoint(product.quantityOnHand, product.reorderPoint))
    .map((product) => ({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      quantityOnHand: product.quantityOnHand,
      reorderPoint: product.reorderPoint,
      suggestedQuantity: product.reorderQuantity,
      supplierName: product.supplier?.name ?? null,
    }));

  return {
    totalSkus,
    totalInventoryValue,
    lowStockCount: reorderSuggestions.length,
    reorderSuggestions,
  };
}
