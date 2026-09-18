"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { NewPurchaseOrderForm } from "@/components/purchaseOrders/NewPurchaseOrderForm";
import { PurchaseOrderDetailPanel } from "@/components/purchaseOrders/PurchaseOrderDetailPanel";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { useSession } from "@/hooks/useAuth";
import type { PurchaseOrder } from "@/lib/types";

const STATUS_TONE: Record<string, "neutral" | "warning" | "success" | "danger"> = {
  DRAFT: "neutral",
  SUBMITTED: "warning",
  RECEIVED: "success",
  CANCELLED: "danger",
};

function PurchaseOrdersView() {
  const { data: session } = useSession();
  const { data: orders, isLoading } = usePurchaseOrders();
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const isAdmin = session?.staff.role === "ADMIN";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Purchase orders</h1>
        {isAdmin && <Button onClick={() => setIsCreating(true)}>New purchase order</Button>}
      </div>

      {isLoading ? (
        <p className="text-sm text-text-secondary">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orders?.map((order) => (
            <button
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="flex flex-col gap-2 rounded-md border border-border bg-surface p-4 text-left hover:border-accent/50"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text">{order.supplier.name}</span>
                <Badge tone={STATUS_TONE[order.status]}>{order.status}</Badge>
              </div>
              <p className="text-xs text-text-secondary">
                {order.items.length} item{order.items.length === 1 ? "" : "s"} &middot;{" "}
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      )}

      {selectedOrder && (
        <PurchaseOrderDetailPanel
          order={orders?.find((o) => o.id === selectedOrder.id) ?? selectedOrder}
          isAdmin={isAdmin}
          onClose={() => setSelectedOrder(null)}
        />
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
