import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { PurchaseOrder } from "@/lib/types";

export function usePurchaseOrders() {
  return useQuery({
    queryKey: ["purchase-orders"],
    queryFn: () => apiClient.get<{ purchaseOrders: PurchaseOrder[] }>("/purchase-orders"),
    select: (data) => data.purchaseOrders,
  });
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
  queryClient.invalidateQueries({ queryKey: ["products"] });
  queryClient.invalidateQueries({ queryKey: ["analytics"] });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      supplierId: string;
      items: { productId: string; quantityOrdered: number; unitCost: number }[];
    }) => apiClient.post<{ purchaseOrder: PurchaseOrder }>("/purchase-orders", input),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useSubmitPurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post<{ purchaseOrder: PurchaseOrder }>(`/purchase-orders/${id}/submit`),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useReceivePurchaseOrderItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, items }: { id: string; items: { itemId: string; quantityReceived: number }[] }) =>
      apiClient.post<{ purchaseOrder: PurchaseOrder }>(`/purchase-orders/${id}/receive`, { items }),
    onSuccess: () => invalidate(queryClient),
  });
}
