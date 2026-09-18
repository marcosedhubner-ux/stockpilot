"use client";

import { AuthGuard } from "@/components/layout/AuthGuard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/dashboard/StatCard";
import { useInventorySummary } from "@/hooks/useAnalytics";

function DashboardView() {
  const { data, isLoading } = useInventorySummary();

  if (isLoading || !data) {
    return <p className="text-sm text-text-secondary">Loading dashboard...</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-text">Inventory overview</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total SKUs" value={String(data.totalSkus)} />
        <StatCard label="Inventory value" value={`$${data.totalInventoryValue.toFixed(2)}`} />
        <StatCard label="Below reorder point" value={String(data.lowStockCount)} />
      </div>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-text">Reorder suggestions</h2>
        {data.reorderSuggestions.length === 0 ? (
          <p className="mt-3 text-sm text-text-secondary">Everything is stocked above its reorder point.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {data.reorderSuggestions.map((suggestion) => (
              <li key={suggestion.productId} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-text">{suggestion.name}</p>
                  <p className="text-xs text-text-secondary">
                    {suggestion.sku} &middot; {suggestion.supplierName ?? "No supplier set"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone="danger">
                    {suggestion.quantityOnHand} / {suggestion.reorderPoint}
                  </Badge>
                  <span className="text-xs text-text-secondary">
                    Suggest ordering {suggestion.suggestedQuantity}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN", "STAFF"]}>
      <DashboardView />
    </AuthGuard>
  );
}
