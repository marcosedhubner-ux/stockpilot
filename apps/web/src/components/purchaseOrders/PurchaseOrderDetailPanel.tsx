"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { BarcodeGlyph } from "@/components/ui/BarcodeGlyph";
import { Button } from "@/components/ui/Button";
import { useReceivePurchaseOrderItems, useSubmitPurchaseOrder } from "@/hooks/usePurchaseOrders";
import { ApiError } from "@/lib/apiClient";
import type { PurchaseOrder } from "@/lib/types";

export function PurchaseOrderDetailPanel({
  order,
  isAdmin,
}: {
  order: PurchaseOrder | null;
  isAdmin: boolean;
}) {
  const submitOrder = useSubmitPurchaseOrder();
  const receiveItems = useReceivePurchaseOrderItems();
  const [receiveQuantities, setReceiveQuantities] = useState<Record<string, number>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleReceive() {
    if (!order) return;
    setErrorMessage(null);
    const items = Object.entries(receiveQuantities)
      .filter(([, qty]) => qty > 0)
      .map(([itemId, quantityReceived]) => ({ itemId, quantityReceived }));

    if (items.length === 0) return;

    receiveItems.mutate(
      { id: order.id, items },
      {
        onSuccess: () => setReceiveQuantities({}),
        onError: (err) => {
          setErrorMessage(err instanceof ApiError ? err.message : "Something went wrong");
        },
      }
    );
  }

  if (!order) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <BarcodeGlyph className="h-7 w-auto text-accent/35" />
        <p className="text-sm text-text-secondary">Select a purchase order to view its line items and status.</p>
      </div>
    );
  }

  return (
    <div key={order.id} className="h-full overflow-y-auto p-6 animate-panel-in">
      <div>
        <h2 className="text-xl font-bold text-text">{order.supplier.name}</h2>
        <p className="text-xs text-text-secondary">{new Date(order.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="mt-3">
        <Badge tone={order.status === "RECEIVED" ? "success" : order.status === "DRAFT" ? "neutral" : "warning"}>
          {order.status}
        </Badge>
      </div>

      <ul className="mt-4 divide-y divide-border">
        {order.items.map((item) => {
          const remaining = item.quantityOrdered - item.quantityReceived;
          return (
            <li key={item.id} className="py-3 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-medium text-text">{item.product.name}</p>
                <p className="font-mono text-text-secondary">
                  {item.quantityReceived} / {item.quantityOrdered}
                </p>
              </div>
              {order.status === "SUBMITTED" && remaining > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={remaining}
                    placeholder={`up to ${remaining}`}
                    value={receiveQuantities[item.id] ?? ""}
                    onChange={(event) =>
                      setReceiveQuantities((prev) => ({ ...prev, [item.id]: Number(event.target.value) }))
                    }
                    className="field w-28 px-2 py-1 text-sm font-mono"
                  />
                  <span className="text-xs text-text-secondary">units arriving now</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {errorMessage && (
        <p className="mt-3 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
          {errorMessage}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-2">
        {order.status === "DRAFT" && isAdmin && (
          <Button onClick={() => submitOrder.mutate(order.id)} disabled={submitOrder.isPending}>
            {submitOrder.isPending ? "Submitting..." : "Submit to supplier"}
          </Button>
        )}
        {order.status === "SUBMITTED" && (
          <Button onClick={handleReceive} disabled={receiveItems.isPending}>
            {receiveItems.isPending ? "Recording..." : "Receive shipment"}
          </Button>
        )}
      </div>
    </div>
  );
}
