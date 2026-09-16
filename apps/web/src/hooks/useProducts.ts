import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { Product, StockMovement } from "@/lib/types";

type MovementInput =
  | { type: "RECEIVED" | "SOLD" | "RETURNED"; quantity: number; note?: string }
  | { type: "ADJUSTED"; delta: number; note?: string };

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => apiClient.get<{ products: Product[] }>("/products"),
    select: (data) => data.products,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      sku: string;
      name: string;
      category: string;
      unitCost: number;
      reorderPoint: number;
      reorderQuantity: number;
      supplierId?: string;
      initialQuantity: number;
    }) => apiClient.post<{ product: Product }>("/products", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useProductMovements(productId: string | null) {
  return useQuery({
    queryKey: ["products", productId, "movements"],
    queryFn: () => apiClient.get<{ movements: StockMovement[] }>(`/products/${productId}/movements`),
    select: (data) => data.movements,
    enabled: Boolean(productId),
  });
}

export function useRecordMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, input }: { productId: string; input: MovementInput }) =>
      apiClient.post<{ movement: StockMovement }>(`/products/${productId}/movements`, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", variables.productId, "movements"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
