import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { InventorySummary } from "@/lib/types";

export function useInventorySummary() {
  return useQuery({
    queryKey: ["analytics", "inventory-summary"],
    queryFn: () => apiClient.get<InventorySummary>("/analytics/inventory-summary"),
  });
}
