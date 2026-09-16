"use client";

import { AuthGuard } from "@/components/layout/AuthGuard";
import { Card } from "@/components/ui/Card";
import { NewSupplierForm } from "@/components/suppliers/NewSupplierForm";
import { useSuppliers } from "@/hooks/useSuppliers";

function SuppliersView() {
  const { data: suppliers, isLoading } = useSuppliers();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Suppliers</h1>

      <Card>
        <h2 className="text-sm font-semibold text-slate-700">Add a supplier</h2>
        <div className="mt-4">
          <NewSupplierForm />
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-slate-700">All suppliers</h2>
        {isLoading ? (
          <p className="mt-3 text-sm text-slate-400">Loading...</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {suppliers?.map((supplier) => (
              <li key={supplier.id} className="py-2 text-sm">
                <p className="font-medium text-slate-800">{supplier.name}</p>
                <p className="text-xs text-slate-400">
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
