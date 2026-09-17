"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminOrderDetails } from "@/views/pages/admin/AdminOrderDetails";
import { useApp } from "@/context/app-provider";
import {
  fetchAllOrders,
  updateOrderStatus,
  ApiError,
} from "@/lib/api";
import { enrichApiOrders } from "@/lib/order-enrichment";
import type { Order, OrderStatus } from "@/lib/types";
import { LoadingState, ErrorState } from "@/components/ui";

export default function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { navigate } = useApp();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const apiOrders = await fetchAllOrders();
      const mapped = await enrichApiOrders(apiOrders);
      const found = mapped.find((o) => o.id === id) ?? null;
      if (!found) {
        router.replace("/admin/orders");
        return;
      }
      setOrder(found);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load order."
      );
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    const updated = await updateOrderStatus(Number(orderId), status);
    const mapped = (await enrichApiOrders([updated]))[0];
    setOrder(mapped);
  };

  if (loading) return <LoadingState message="Loading order…" />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!order) return null;

  return (
    <AdminOrderDetails
      order={order}
      navigate={navigate}
      onStatusChange={handleStatusChange}
    />
  );
}
