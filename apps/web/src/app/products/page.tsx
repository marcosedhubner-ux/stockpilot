"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Button } from "@/components/ui/Button";
import { ProductTable } from "@/components/products/ProductTable";
import { ProductDetailPanel } from "@/components/products/ProductDetailPanel";
import { NewProductForm } from "@/components/products/NewProductForm";
import { useProducts } from "@/hooks/useProducts";
import { useSession } from "@/hooks/useAuth";
import type { Product } from "@/lib/types";

function ProductsView() {
  const { data: session } = useSession();
  const { data: products, isLoading } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const isAdmin = session?.staff.role === "ADMIN";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Products</h1>
        {isAdmin && <Button onClick={() => setIsCreating(true)}>New product</Button>}
      </div>

      {isLoading ? (
        <p className="text-sm text-text-secondary">Loading products...</p>
      ) : (
        <ProductTable products={products ?? []} onSelect={setSelectedProduct} />
      )}

      {selectedProduct && (
        <ProductDetailPanel
          product={products?.find((p) => p.id === selectedProduct.id) ?? selectedProduct}
          isAdmin={isAdmin}
          onClose={() => setSelectedProduct(null)}
        />
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
