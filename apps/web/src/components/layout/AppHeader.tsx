"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { useLogout, useSession } from "@/hooks/useAuth";

const NAV_ITEMS = [
  { href: "/products", label: "Products", roles: ["ADMIN", "STAFF"] },
  { href: "/purchase-orders", label: "Purchase Orders", roles: ["ADMIN", "STAFF"] },
  { href: "/suppliers", label: "Suppliers", roles: ["ADMIN"] },
  { href: "/dashboard", label: "Dashboard", roles: ["ADMIN", "STAFF"] },
];

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useSession();
  const logout = useLogout();

  const role = data?.staff.role;
  const visibleItems = NAV_ITEMS.filter((item) => !role || item.roles.includes(role));

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <span className="flex items-center gap-2 text-lg font-bold tracking-tight text-text">
            <span aria-hidden className="flex h-4 items-end gap-[2px]">
              <span className="h-full w-[2px] bg-accent" />
              <span className="h-2/3 w-[1px] bg-accent/60" />
              <span className="h-full w-[3px] bg-accent" />
              <span className="h-1/2 w-[1px] bg-accent/50" />
            </span>
            Onhand
          </span>
          <nav className="flex gap-1">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "rounded-md px-3 py-1.5 text-sm font-medium",
                  pathname === item.href
                    ? "bg-accent text-[#0e1216]"
                    : "text-text-secondary hover:bg-white/5 hover:text-text"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        {data?.staff && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-text">{data.staff.fullName}</p>
              <p className="text-xs text-text-secondary">{data.staff.role}</p>
            </div>
            <button
              onClick={() => logout.mutate(undefined, { onSuccess: () => router.push("/login") })}
              className="text-sm font-medium text-text-secondary hover:text-text"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
