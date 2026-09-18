"use client";

import { AuthGuard } from "@/components/layout/AuthGuard";
import { Card } from "@/components/ui/Card";
import { NewSupplierForm } from "@/components/suppliers/NewSupplierForm";
import { useSuppliers } from "@/hooks/useSuppliers";

function SuppliersView() {
  const { data: suppliers, isLoading } = useSuppliers();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">Suppliers</h1>

      <Card>
        <h2 className="text-sm font-semibold text-text">Add a supplier</h2>
        <div className="mt-4">
          <NewSupplierForm />
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-text">All suppliers</h2>
        {isLoading ? (
          <p className="mt-3 text-sm text-text-secondary">Loading...</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {suppliers?.map((supplier) => (
              <li key={supplier.id} className="py-2 text-sm">
                <p className="font-medium text-text">{supplier.name}</p>
                <p className="text-xs text-text-secondary">
                  {supplier.email}
                  {supplier.phone ? ` · ${supplier.phone}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

export default function SuppliersPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <SuppliersView />
    </AuthGuard>
  );
}
