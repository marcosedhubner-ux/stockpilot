"use client";

import { useMemo, useState } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Button } from "@/components/ui/Button";
import { ProductTable } from "@/components/products/ProductTable";
import { ProductDetailPanel } from "@/components/products/ProductDetailPanel";
import { NewProductForm } from "@/components/products/NewProductForm";
import { useProducts } from "@/hooks/useProducts";
import { useSession } from "@/hooks/useAuth";

function ProductsView() {
  const { data: session } = useSession();
  const { data: products, isLoading } = useProducts();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const isAdmin = session?.staff.role === "ADMIN";

  const selectedProduct = useMemo(
    () => products?.find((product) => product.id === selectedId) ?? null,
    [products, selectedId]
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Products</h1>
        {isAdmin && <Button onClick={() => setIsCreating(true)}>New product</Button>}
      </div>

      {isLoading ? (
        <p className="text-sm text-text-secondary">Loading products...</p>
      ) : (
        <div className="flex h-[calc(100vh-14rem)] min-h-[480px] gap-4">
          <div className="w-[380px] shrink-0 overflow-y-auto rounded-md border border-border bg-surface">
            {products && products.length > 0 ? (
              <ProductTable products={products} selectedId={selectedId} onSelect={(product) => setSelectedId(product.id)} />
            ) : (
              <p className="p-4 text-sm text-text-secondary">No products yet.</p>
            )}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-surface">
            <ProductDetailPanel product={selectedProduct} isAdmin={isAdmin} />
          </div>
        </div>
      )}

      {isCreating && <NewProductForm onClose={() => setIsCreating(false)} />}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN", "STAFF"]}>
      <ProductsView />
    </AuthGuard>
  );
}
