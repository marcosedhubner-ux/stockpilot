"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { useCreateSupplier } from "@/hooks/useSuppliers";
import { ApiError } from "@/lib/apiClient";

export function NewSupplierForm() {
  const createSupplier = useCreateSupplier();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage(null);

    createSupplier.mutate(
      { name, email, phone: phone || undefined },
      {
        onSuccess: () => {
          setName("");
          setEmail("");
          setPhone("");
        },
        onError: (err) => {
          setErrorMessage(err instanceof ApiError ? err.message : "Something went wrong");
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
        <label className="block text-sm font-medium text-text-secondary">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="field mt-1 w-full px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary">Phone (optional)</label>
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className="field mt-1 w-full px-3 py-2 text-sm"
        />
      </div>

      {errorMessage && (
        <p className="sm:col-span-3 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
          {errorMessage}
        </p>
      )}

      <div className="sm:col-span-3">
        <Button type="submit" disabled={createSupplier.isPending}>
          {createSupplier.isPending ? "Adding..." : "Add supplier"}
        </Button>
      </div>
    </form>
  );
}
