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
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-slate-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,rgba(217,119,6,0.25)_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="relative z-10">
          <span className="text-2xl font-bold text-white">StockPilot</span>
        </div>
        <div className="relative z-10 space-y-4">
          <p className="max-w-md text-3xl font-semibold leading-tight text-white">
            Every unit accounted for, from the loading dock to the shelf.
          </p>
          <p className="max-w-sm text-sm text-slate-400">
            Stock levels are never edited directly — every change is a recorded movement, so you
            always know what happened and who did it.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Use your warehouse account to continue.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
            </div>

            {errorMessage && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>
            )}

            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-8 rounded-lg border border-dashed border-slate-300 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Demo accounts (password: Passw0rd!123)
            </p>
            <ul className="mt-2 space-y-1">
              {DEMO_ACCOUNTS.map((account) => (
                <li key={account.email} className="flex justify-between text-xs text-slate-600">
                  <span>{account.role}</span>
                  <span className="font-mono">{account.email}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
