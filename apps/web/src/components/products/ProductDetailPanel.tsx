"use client";

import { Badge } from "@/components/ui/Badge";
import { useProductMovements } from "@/hooks/useProducts";
import { RecordMovementForm } from "./RecordMovementForm";
import type { Product } from "@/lib/types";

const MOVEMENT_TONE: Record<string, "success" | "danger" | "warning"> = {
  RECEIVED: "success",
  RETURNED: "success",
  SOLD: "danger",
  ADJUSTED: "warning",
};

export function ProductDetailPanel({
  product,
  isAdmin,
  onClose,
}: {
  product: Product;
  isAdmin: boolean;
  onClose: () => void;
}) {
  const { data: movements, isLoading } = useProductMovements(product.id);

  return (
    <div className="fixed inset-0 z-20 flex justify-end bg-black/50" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto border-l border-border bg-surface p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text">{product.name}</h2>
            <p className="font-mono text-xs text-text-secondary">{product.sku}</p>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-text">
            Close
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-md border border-accent/20 bg-accent-soft p-3">
          <div>
            <p className="text-xs text-text-secondary">On hand</p>
            <p className="font-mono text-2xl font-bold text-text">{product.quantityOnHand}</p>
          </div>
          {product.isBelowReorderPoint && <Badge tone="danger">Below reorder point</Badge>}
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-text">Record a movement</h3>
          <div className="mt-3">
            <RecordMovementForm productId={product.id} isAdmin={isAdmin} />
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-text">History</h3>
          {isLoading ? (
            <p className="mt-2 text-sm text-text-secondary">Loading...</p>
          ) : (
            <ul className="mt-2 divide-y divide-border">
              {movements?.map((movement) => (
                <li key={movement.id} className="py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <Badge tone={MOVEMENT_TONE[movement.type]}>{movement.type}</Badge>
                    <span className="font-mono font-semibold text-text">
                      {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">
                    {new Date(movement.createdAt).toLocaleString()} &middot; {movement.recordedBy.fullName}
                  </p>
                  {movement.note && <p className="text-xs text-text-secondary">{movement.note}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
