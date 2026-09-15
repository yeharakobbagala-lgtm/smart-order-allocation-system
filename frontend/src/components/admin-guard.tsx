"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/app-provider";
import { LoadingState } from "@/components/ui";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.replace("/login");
    } else if (user.role !== "admin") {
      router.replace("/products");
    }
  }, [user, router]);

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <LoadingState message="Checking access…" />
      </div>
    );
  }

  return <>{children}</>;
}
