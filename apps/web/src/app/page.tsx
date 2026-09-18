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
    <div className="flex min-h-screen items-center justify-center bg-bg text-sm text-text-secondary">
      Loading...
    </div>
  );
}
