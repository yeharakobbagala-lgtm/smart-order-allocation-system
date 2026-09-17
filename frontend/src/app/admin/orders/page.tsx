"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminOrders } from "@/views/pages/admin/Orders";
import { useApp } from "@/context/app-provider";
import { fetchAllOrders, fetchBranches, ApiError } from "@/lib/api";
import { enrichApiOrders } from "@/lib/order-enrichment";
import type { Branch, Order } from "@/lib/types";
import { LoadingState, ErrorState } from "@/components/ui";

export default function AdminOrdersPage() {
  const { navigate } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [apiOrders, apiBranches] = await Promise.all([
        fetchAllOrders(),
        fetchBranches(),
      ]);
      setOrders(await enrichApiOrders(apiOrders));
      setBranches(
        apiBranches.map((b) => ({
          id: String(b.id),
          name: b.name,
          address: b.address,
          city: b.address,
          lat: b.latitude,
          lng: b.longitude,
          capacity: b.capacity,
          active: b.active,
          currentWorkload: 0,
        }))
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load orders."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <LoadingState message="Loading orders…" />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  return (
    <AdminOrders orders={orders} branches={branches} navigate={navigate} />
  );
}
