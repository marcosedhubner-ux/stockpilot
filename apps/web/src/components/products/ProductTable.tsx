import clsx from "clsx";
import { Badge } from "@/components/ui/Badge";
import type { Product } from "@/lib/types";

export function ProductTable({
  products,
  selectedId,
  onSelect,
}: {
  products: Product[];
  selectedId?: string | null;
  onSelect: (product: Product) => void;
}) {
  return (
    <ul className="divide-y divide-border">
      {products.map((product) => {
        const isSelected = product.id === selectedId;
        const isCritical =
          product.isBelowReorderPoint &&
          (product.quantityOnHand <= 0 || product.quantityOnHand <= product.reorderPoint * 0.5);
        return (
          <li key={product.id}>
            <button
              type="button"
              onClick={() => onSelect(product)}
              aria-current={isSelected}
              className={clsx(
                "group flex w-full items-stretch gap-3 px-3 py-3 text-left transition-colors duration-150 ease-out",
                isSelected ? "bg-accent-soft" : "hover:bg-accent-soft/40"
              )}
            >
              <span
                aria-hidden
                className={clsx(
                  "w-[3px] shrink-0 self-stretch rounded-full transition-colors duration-150 ease-out",
                  isSelected ? "bg-accent" : "bg-transparent group-hover:bg-accent/50"
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="truncate font-medium text-text">{product.name}</span>
                  <span className="shrink-0 font-mono font-semibold text-text">{product.quantityOnHand}</span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="truncate font-mono text-xs text-text-secondary">{product.sku}</span>
                  {product.isBelowReorderPoint && (
                    <Badge tone="danger" pulse={isCritical}>
                      Low stock
                    </Badge>
                  )}
                </div>
                <p className="mt-1.5 truncate text-xs text-text-secondary">
                  {product.category} &middot; ${Number(product.unitCost).toFixed(2)} &middot;{" "}
                  {product.supplier?.name ?? "No supplier"}
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
