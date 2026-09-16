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
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead>
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
            <th className="px-4 py-3">SKU</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">On hand</th>
            <th className="px-4 py-3">Unit cost</th>
            <th className="px-4 py-3">Supplier</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((product) => (
            <tr
              key={product.id}
              onClick={() => onSelect(product)}
              className="cursor-pointer hover:bg-slate-50"
            >
              <td className="px-4 py-3 font-mono text-xs text-slate-500">{product.sku}</td>
              <td className="px-4 py-3 font-medium text-slate-800">{product.name}</td>
              <td className="px-4 py-3 text-slate-500">{product.category}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{product.quantityOnHand}</span>
                  {product.isBelowReorderPoint && <Badge tone="danger">Low stock</Badge>}
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">${Number(product.unitCost).toFixed(2)}</td>
              <td className="px-4 py-3 text-slate-500">{product.supplier?.name ?? "—"}</td>
              <td className="px-4 py-3 text-right text-xs font-medium text-amber-600">Manage</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
