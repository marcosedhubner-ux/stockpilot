"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { NewPurchaseOrderForm } from "@/components/purchaseOrders/NewPurchaseOrderForm";
import { PurchaseOrderDetailPanel } from "@/components/purchaseOrders/PurchaseOrderDetailPanel";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { useSession } from "@/hooks/useAuth";

const STATUS_TONE: Record<string, "neutral" | "warning" | "success" | "danger"> = {
  DRAFT: "neutral",
  SUBMITTED: "warning",
  RECEIVED: "success",
  CANCELLED: "danger",
};

function PurchaseOrdersView() {
  const { data: session } = useSession();
  const { data: orders, isLoading } = usePurchaseOrders();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const isAdmin = session?.staff.role === "ADMIN";

  const selectedOrder = useMemo(
    () => orders?.find((order) => order.id === selectedId) ?? null,
    [orders, selectedId]
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Purchase orders</h1>
        {isAdmin && <Button onClick={() => setIsCreating(true)}>New purchase order</Button>}
      </div>

      {isLoading ? (
        <p className="text-sm text-text-secondary">Loading...</p>
      ) : (
        <div className="flex h-[calc(100vh-14rem)] min-h-[480px] gap-4">
          <div className="w-[380px] shrink-0 overflow-y-auto rounded-md border border-border bg-surface">
            {orders && orders.length > 0 ? (
              <ul className="divide-y divide-border">
                {orders.map((order) => {
                  const isSelected = order.id === selectedId;
                  return (
                    <li key={order.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(order.id)}
                        aria-current={isSelected}
                        className={clsx(
                          "flex w-full items-stretch gap-3 px-3 py-3 text-left transition-colors",
                          isSelected ? "bg-accent-soft" : "hover:bg-white/[0.03]"
                        )}
                      >
                        <span
                          aria-hidden
                          className={clsx(
                            "w-[3px] shrink-0 self-stretch rounded-full",
                            isSelected ? "bg-accent" : "bg-transparent"
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate font-medium text-text">{order.supplier.name}</span>
                            <Badge tone={STATUS_TONE[order.status]}>{order.status}</Badge>
                          </div>
                          <p className="mt-1.5 text-xs text-text-secondary">
                            {order.items.length} item{order.items.length === 1 ? "" : "s"} &middot;{" "}
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="p-4 text-sm text-text-secondary">No purchase orders yet.</p>
            )}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface">
            <PurchaseOrderDetailPanel order={selectedOrder} isAdmin={isAdmin} />
          </div>
        </div>
      )}

      {isCreating && <NewPurchaseOrderForm onClose={() => setIsCreating(false)} />}
    </div>
  );
}

export default function PurchaseOrdersPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN", "STAFF"]}>
      <PurchaseOrdersView />
    </AuthGuard>
  );
}
