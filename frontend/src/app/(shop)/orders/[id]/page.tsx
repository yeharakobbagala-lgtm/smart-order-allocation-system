"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OrderDetails } from "@/views/pages/customer/OrderDetails";
import { useApp } from "@/context/app-provider";
import { LoadingState } from "@/components/ui";

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const {
    getOrderById,
    loadOrder,
    cancelCustomerOrder,
    navigate,
    user,
    authLoading,
  } = useApp();
  const [loading, setLoading] = useState(true);
  const order = getOrderById(id);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    async function ensure() {
      if (order) {
        setLoading(false);
        return;
      }
      const loaded = await loadOrder(id);
      if (cancelled) return;
      if (!loaded) router.replace("/orders");
      setLoading(false);
    }
    void ensure();
    return () => {
      cancelled = true;
    };
  }, [id, loadOrder, order, router, authLoading, user]);

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <LoadingState message="Loading order…" />
      </div>
    );
  }

  if (!user) return null;

  const resolved = getOrderById(id);
  if (!resolved) return null;

  return (
    <OrderDetails
      order={resolved}
      navigate={navigate}
      onCancelOrder={cancelCustomerOrder}
    />
  );
}
