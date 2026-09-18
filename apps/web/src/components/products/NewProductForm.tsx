"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { useCreateProduct } from "@/hooks/useProducts";
import { useSuppliers } from "@/hooks/useSuppliers";
import { ApiError } from "@/lib/apiClient";

export function NewProductForm({ onClose }: { onClose: () => void }) {
  const createProduct = useCreateProduct();
  const { data: suppliers } = useSuppliers();

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [unitCost, setUnitCost] = useState(0);
  const [reorderPoint, setReorderPoint] = useState(10);
  const [reorderQuantity, setReorderQuantity] = useState(50);
  const [initialQuantity, setInitialQuantity] = useState(0);
  const [supplierId, setSupplierId] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage(null);

    createProduct.mutate(
      {
        sku,
        name,
        category,
        unitCost,
        reorderPoint,
        reorderQuantity,
        initialQuantity,
        supplierId: supplierId || undefined,
      },
      {
        onSuccess: onClose,
        onError: (err) => {
          setErrorMessage(err instanceof ApiError ? err.message : "Something went wrong");
        },
      }
    );
  }

  return (
    <div className="fixed inset-0 z-20 flex justify-end bg-black/50" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto border-l border-border bg-surface p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-text">New product</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary">SKU</label>
            <input
              required
              value={sku}
              onChange={(event) => setSku(event.target.value)}
              className="field mt-1 w-full px-3 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary">Name</label>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="field mt-1 w-full px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary">Category</label>
            <input
              required
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="field mt-1 w-full px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary">Supplier</label>
            <select
              value={supplierId}
              onChange={(event) => setSupplierId(event.target.value)}
              className="field mt-1 w-full px-3 py-2 text-sm"
            >
              <option value="">No supplier</option>
              {suppliers?.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-secondary">Unit cost</label>
              <input
                type="number"
                required
                min={0}
                step="0.01"
                value={unitCost}
                onChange={(event) => setUnitCost(Number(event.target.value))}
                className="field mt-1 w-full px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">Initial qty</label>
              <input
                type="number"
                required
                min={0}
                value={initialQuantity}
                onChange={(event) => setInitialQuantity(Number(event.target.value))}
                className="field mt-1 w-full px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">Reorder point</label>
              <input
                type="number"
                required
                min={0}
                value={reorderPoint}
                onChange={(event) => setReorderPoint(Number(event.target.value))}
                className="field mt-1 w-full px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">Reorder qty</label>
              <input
                type="number"
                required
                min={1}
                value={reorderQuantity}
                onChange={(event) => setReorderQuantity(Number(event.target.value))}
                className="field mt-1 w-full px-3 py-2 text-sm font-mono"
              />
            </div>
          </div>

          {errorMessage && (
            <p className="rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
              {errorMessage}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={createProduct.isPending}>
            {createProduct.isPending ? "Creating..." : "Create product"}
          </Button>
        </form>
      </div>
    </div>
  );
}
