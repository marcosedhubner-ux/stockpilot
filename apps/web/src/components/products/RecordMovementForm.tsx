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
        <label className="block text-sm font-medium text-text-secondary">Movement type</label>
        <select
          value={type}
          onChange={(event) => setType(event.target.value as MovementType)}
          className="field mt-1 w-full px-3 py-2 text-sm"
        >
          <option value="RECEIVED">Received (stock in)</option>
          <option value="SOLD">Sold (stock out)</option>
          <option value="RETURNED">Returned (stock in)</option>
          {isAdmin && <option value="ADJUSTED">Manual adjustment</option>}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary">
          {type === "ADJUSTED" ? "Delta (use a negative number to reduce)" : "Quantity"}
        </label>
        <input
          type="number"
          required
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          className="field mt-1 w-full px-3 py-2 text-sm font-mono"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary">Note (optional)</label>
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="field mt-1 w-full px-3 py-2 text-sm"
        />
      </div>

      {errorMessage && (
        <p className="rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
          {errorMessage}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={recordMovement.isPending}>
        {recordMovement.isPending ? "Recording..." : "Record movement"}
      </Button>
    </form>
  );
}
