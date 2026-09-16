"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useProducts } from "@/hooks/useProducts";
import { useCreatePurchaseOrder } from "@/hooks/usePurchaseOrders";
import { ApiError } from "@/lib/apiClient";

interface LineItem {
  productId: string;
  quantityOrdered: number;
  unitCost: number;
}

export function NewPurchaseOrderForm({ onClose }: { onClose: () => void }) {
  const { data: suppliers } = useSuppliers();
  const { data: products } = useProducts();
  const createPurchaseOrder = useCreatePurchaseOrder();

  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ productId: "", quantityOrdered: 1, unitCost: 0 }]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addItem() {
    setItems((prev) => [...prev, { productId: "", quantityOrdered: 1, unitCost: 0 }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage(null);

    const validItems = items.filter((item) => item.productId);
    if (validItems.length === 0) {
      setErrorMessage("Add at least one line item");
      return;
    }

    createPurchaseOrder.mutate(
      { supplierId, items: validItems },
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
        className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">New purchase order</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Supplier</label>
            <select
              required
              value={supplierId}
              onChange={(event) => setSupplierId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
            >
              <option value="" disabled>
                Select supplier
              </option>
              {suppliers?.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Line items</label>
            {items.map((item, index) => (
              <div key={index} className="flex items-end gap-2 rounded-lg border border-slate-200 p-3">
                <div className="flex-1">
                  <label className="block text-xs text-slate-500">Product</label>
                  <select
                    required
                    value={item.productId}
                    onChange={(event) => updateItem(index, { productId: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    {products?.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.sku} &middot; {product.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-20">
                  <label className="block text-xs text-slate-500">Qty</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={item.quantityOrdered}
                    onChange={(event) => updateItem(index, { quantityOrdered: Number(event.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs text-slate-500">Unit cost</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={item.unitCost}
                    onChange={(event) => updateItem(index, { unitCost: Number(event.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="mb-1.5 text-xs font-medium text-rose-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="text-sm font-medium text-amber-600 hover:underline"
            >
              + Add line item
            </button>
          </div>

          {errorMessage && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>
          )}

          <Button type="submit" className="w-full" disabled={createPurchaseOrder.isPending}>
            {createPurchaseOrder.isPending ? "Creating..." : "Create draft order"}
          </Button>
        </form>
      </div>
    </div>
  );
}
