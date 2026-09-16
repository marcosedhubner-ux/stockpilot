"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useReceivePurchaseOrderItems, useSubmitPurchaseOrder } from "@/hooks/usePurchaseOrders";
import { ApiError } from "@/lib/apiClient";
import type { PurchaseOrder } from "@/lib/types";

export function PurchaseOrderDetailPanel({
  order,
  isAdmin,
  onClose,
}: {
  order: PurchaseOrder;
  isAdmin: boolean;
  onClose: () => void;
}) {
  const submitOrder = useSubmitPurchaseOrder();
  const receiveItems = useReceivePurchaseOrderItems();
  const [receiveQuantities, setReceiveQuantities] = useState<Record<string, number>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleReceive() {
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

  return (
    <div className="fixed inset-0 z-20 flex justify-end bg-slate-900/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{order.supplier.name}</h2>
            <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            Close
          </button>
        </div>

        <div className="mt-3">
          <Badge tone={order.status === "RECEIVED" ? "success" : order.status === "DRAFT" ? "neutral" : "warning"}>
            {order.status}
          </Badge>
        </div>

        <ul className="mt-4 divide-y divide-slate-100">
          {order.items.map((item) => {
            const remaining = item.quantityOrdered - item.quantityReceived;
            return (
              <li key={item.id} className="py-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-800">{item.product.name}</p>
                  <p className="text-slate-500">
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
                      className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                    />
                    <span className="text-xs text-slate-400">units arriving now</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {errorMessage && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>
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
    </div>
  );
}
