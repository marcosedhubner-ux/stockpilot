import { Badge } from "@/components/ui/Badge";
import type { Product } from "@/lib/types";

export function ProductTable({
  products,
  onSelect,
}: {
  products: Product[];
  onSelect: (product: Product) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-border bg-surface">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead>
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
            <th className="px-4 py-3">SKU</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">On hand</th>
            <th className="px-4 py-3">Unit cost</th>
            <th className="px-4 py-3">Supplier</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {products.map((product) => (
            <tr
              key={product.id}
              onClick={() => onSelect(product)}
              className="cursor-pointer hover:bg-white/[0.03]"
            >
              <td className="px-4 py-3 font-mono text-xs text-text-secondary">{product.sku}</td>
              <td className="px-4 py-3 font-medium text-text">{product.name}</td>
              <td className="px-4 py-3 text-text-secondary">{product.category}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-text">{product.quantityOnHand}</span>
                  {product.isBelowReorderPoint && <Badge tone="danger">Low stock</Badge>}
                </div>
              </td>
              <td className="px-4 py-3 font-mono text-text-secondary">
                ${Number(product.unitCost).toFixed(2)}
              </td>
              <td className="px-4 py-3 text-text-secondary">{product.supplier?.name ?? "—"}</td>
              <td className="px-4 py-3 text-right text-xs font-medium text-accent">Manage</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
