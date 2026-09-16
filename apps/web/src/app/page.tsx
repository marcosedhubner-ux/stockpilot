"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useAuth";

export default function HomePage() {
  const router = useRouter();
  const { data, isLoading, isError } = useSession();

  useEffect(() => {
    if (isLoading) return;
    if (isError || !data?.staff) {
      router.replace("/login");
      return;
    }
    router.replace("/products");
  }, [data, isLoading, isError, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
      Loading...
    </div>
  );
}
