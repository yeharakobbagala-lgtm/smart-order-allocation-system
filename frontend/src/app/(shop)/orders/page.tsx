"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MyOrders } from "@/views/pages/customer/MyOrders";
import { useApp } from "@/context/app-provider";
import { LoadingState } from "@/components/ui";

export default function OrdersPage() {
  const router = useRouter();
  const { customerOrders, navigate, refreshOrders, user, authLoading } =
    useApp();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
    if (!authLoading && user) {
      void refreshOrders();
    }
  }, [authLoading, user, refreshOrders, router]);

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <LoadingState message="Loading…" />
      </div>
    );
  }

  if (!user) return null;

  return <MyOrders orders={customerOrders} navigate={navigate} />;
}
