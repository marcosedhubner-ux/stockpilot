"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/apiClient";

const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@stockpilot.dev" },
  { role: "Staff", email: "staff@stockpilot.dev" },
];

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage(null);
    login.mutate(
      { email, password },
      {
        onSuccess: () => router.push("/"),
        onError: (err) => {
          setErrorMessage(err instanceof ApiError ? err.message : "Something went wrong");
        },
      }
    );
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-bg lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r border-border bg-surface lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="barcode-stripes absolute inset-0 opacity-[0.14]" />
        <div className="relative z-10">
          <span className="flex items-center gap-2 text-2xl font-bold text-text">
            <span aria-hidden className="flex h-5 items-end gap-[2px]">
              <span className="h-full w-[2px] bg-accent" />
              <span className="h-2/3 w-[1px] bg-accent/60" />
              <span className="h-full w-[3px] bg-accent" />
              <span className="h-1/2 w-[1px] bg-accent/50" />
              <span className="h-full w-[2px] bg-accent" />
            </span>
            Onhand
          </span>
        </div>
        <div className="relative z-10 space-y-4">
          <p className="max-w-md text-3xl font-semibold leading-tight text-text">
            Inventory that keeps receipts.
          </p>
          <p className="max-w-sm text-sm text-text-secondary">
            Every count is rebuilt from a movement ledger, not a number you can just overwrite —
            so you always know what happened and who did it.
          </p>
        </div>
      </div>

      <div className="ledger-grid flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-text">Sign in</h1>
          <p className="mt-1 text-sm text-text-secondary">Use your warehouse account to continue.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="field mt-1 w-full px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="field mt-1 w-full px-3 py-2 text-sm"
              />
            </div>

            {errorMessage && (
              <p className="rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
                {errorMessage}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-8 rounded-md border border-dashed border-border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              Demo accounts (password: Passw0rd!123)
            </p>
            <ul className="mt-2 space-y-1">
              {DEMO_ACCOUNTS.map((account) => (
                <li key={account.email} className="flex justify-between text-xs text-text-secondary">
                  <span>{account.role}</span>
                  <span className="font-mono text-text">{account.email}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
