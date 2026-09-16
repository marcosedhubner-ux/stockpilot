"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { useRecordMovement } from "@/hooks/useProducts";
import { ApiError } from "@/lib/apiClient";
import type { MovementType } from "@/lib/types";

export function RecordMovementForm({ productId, isAdmin }: { productId: string; isAdmin: boolean }) {
  const recordMovement = useRecordMovement();
  const [type, setType] = useState<MovementType>("RECEIVED");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage(null);

    const input =
      type === "ADJUSTED"
        ? { type: "ADJUSTED" as const, delta: quantity, note: note || undefined }
        : { type, quantity: Math.abs(quantity), note: note || undefined };

    recordMovement.mutate(
      { productId, input },
      {
        onSuccess: () => {
          setQuantity(1);
          setNote("");
        },
        onError: (err) => {
          setErrorMessage(err instanceof ApiError ? err.message : "Something went wrong");
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-700">Movement type</label>
        <select
          value={type}
          onChange={(event) => setType(event.target.value as MovementType)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
        >
          <option value="RECEIVED">Received (stock in)</option>
          <option value="SOLD">Sold (stock out)</option>
          <option value="RETURNED">Returned (stock in)</option>
          {isAdmin && <option value="ADJUSTED">Manual adjustment</option>}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          {type === "ADJUSTED" ? "Delta (use a negative number to reduce)" : "Quantity"}
        </label>
        <input
          type="number"
          required
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Note (optional)</label>
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
        />
      </div>

      {errorMessage && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>
      )}

      <Button type="submit" className="w-full" disabled={recordMovement.isPending}>
        {recordMovement.isPending ? "Recording..." : "Record movement"}
      </Button>
    </form>
  );
}
