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
    <div className="fixed inset-0 z-20 flex justify-end bg-slate-900/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">New product</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">SKU</label>
            <input
              required
              value={sku}
              onChange={(event) => setSku(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Category</label>
            <input
              required
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Supplier</label>
            <select
              value={supplierId}
              onChange={(event) => setSupplierId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
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
              <label className="block text-sm font-medium text-slate-700">Unit cost</label>
              <input
                type="number"
                required
                min={0}
                step="0.01"
                value={unitCost}
                onChange={(event) => setUnitCost(Number(event.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Initial qty</label>
              <input
                type="number"
                required
                min={0}
                value={initialQuantity}
                onChange={(event) => setInitialQuantity(Number(event.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Reorder point</label>
              <input
                type="number"
                required
                min={0}
                value={reorderPoint}
                onChange={(event) => setReorderPoint(Number(event.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Reorder qty</label>
              <input
                type="number"
                required
                min={1}
                value={reorderQuantity}
                onChange={(event) => setReorderQuantity(Number(event.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
            </div>
          </div>

          {errorMessage && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>
          )}

          <Button type="submit" className="w-full" disabled={createProduct.isPending}>
            {createProduct.isPending ? "Creating..." : "Create product"}
          </Button>
        </form>
      </div>
    </div>
  );
}
