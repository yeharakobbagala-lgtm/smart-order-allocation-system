"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/states";
import type { UserRole } from "@/lib/types";

export function RequireAuth({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: UserRole;
}) {
  const { user, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (role && user.role !== role) {
      router.replace(user.role === "admin" ? "/admin" : "/products");
    }
  }, [user, isHydrated, role, router]);

  if (!isHydrated) return <LoadingSpinner label="Loading session..." />;
  if (!user) return <LoadingSpinner label="Redirecting to login..." />;
  if (role && user.role !== role) {
    return <LoadingSpinner label="Redirecting..." />;
  }

  return <>{children}</>;
}
