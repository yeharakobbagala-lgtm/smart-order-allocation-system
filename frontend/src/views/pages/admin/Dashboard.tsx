"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Branch, Order, Page, Product } from "@/lib/types";
import {
  fetchAllOrders,
  fetchAdminUsers,
  fetchBranchStock,
  fetchBranches,
  fetchProducts,
  fetchStockAvailability,
  ApiError,
} from "@/lib/api";
import { mapApiProduct } from "@/lib/mappers";
import { formatCurrency } from "@/lib/currency";
import { enrichApiOrders } from "@/lib/order-enrichment";
import {
  Card,
  StatCard,
  StatusBadge,
  Badge,
  LoadingState,
  ErrorState,
  IconPackage,
  IconUsers,
  IconBranch,
  IconInventory,
  IconTruck,
  IconAlert,
} from "@/components/ui";

interface Props {
  navigate: (page: Page, id?: string) => void;
}

export const AdminDashboard: React.FC<Props> = ({ navigate }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [lowStock, setLowStock] = useState<
    { name: string; branch: string; available: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [apiOrders, apiProducts, apiBranches, apiStock, users] =
        await Promise.all([
          fetchAllOrders(),
          fetchProducts(),
          fetchBranches(),
          fetchBranchStock(),
          fetchAdminUsers().catch(() => []),
        ]);
      const mappedProducts = apiProducts.map(mapApiProduct);
      const mappedBranches: Branch[] = apiBranches.map((b) => ({
        id: String(b.id),
        name: b.name,
        address: b.address,
        city: b.address,
        lat: b.latitude,
        lng: b.longitude,
        capacity: b.capacity,
        active: b.active,
        currentWorkload: 0,
      }));
      const mappedOrders = await enrichApiOrders(apiOrders);
      setOrders(mappedOrders);
      setProducts(mappedProducts);
      setBranches(mappedBranches);
      setUserCount(users.length);

      const branchNames = Object.fromEntries(
        mappedBranches.map((b) => [b.id, b.name])
      );
      const productNames = Object.fromEntries(
        mappedProducts.map((p) => [p.id, p.name])
      );
      const low: { name: string; branch: string; available: number }[] = [];
      for (const row of apiStock.slice(0, 30)) {
        if (row.quantity <= 0) continue;
        try {
          const avail = await fetchStockAvailability(
            row.branch_id,
            row.product_id,
            row.quantity
          );
          if (avail.available_quantity < 10) {
            low.push({
              name:
                productNames[String(row.product_id)] ||
                `Product #${row.product_id}`,
              branch:
                branchNames[String(row.branch_id)] ||
                `Branch #${row.branch_id}`,
              available: avail.available_quantity,
            });
          }
        } catch {
          /* skip */
        }
      }
      setLowStock(low.slice(0, 5));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const branchWorkload = useMemo(() => {
    return branches
      .filter((b) => b.active)
      .map((b) => {
        const orderCount = orders.filter(
          (o) =>
            o.branchId === b.id &&
            o.status !== "DELIVERED" &&
            o.status !== "CANCELLED"
        ).length;
        const pct =
          b.capacity > 0
            ? Math.round((orderCount / b.capacity) * 100)
            : 0;
        return { ...b, pct, orderCount, currentWorkload: orderCount };
      });
  }, [branches, orders]);

  const totalOrders = orders.length;
  const pending = orders.filter((o) => o.status === "ALLOCATED").length;
  const processing = orders.filter((o) => o.status === "PROCESSING").length;
  const delivered = orders.filter((o) => o.status === "DELIVERED").length;
  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  if (loading) return <LoadingState message="Loading dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-[#0F172A]">Dashboard</h1>
        <p className="text-[#64748B] mt-1">Welcome back — here&apos;s a real-time overview of your operations.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={totalOrders} icon={<IconPackage size={18} />} color="#4F46E5" />
        <StatCard label="Allocated" value={pending} icon={<IconTruck size={18} />} color="#3B82F6" />
        <StatCard label="Processing" value={processing} icon={<IconInventory size={18} />} color="#F59E0B" />
        <StatCard label="Delivered" value={delivered} icon={<IconPackage size={18} />} color="#10B981" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Products" value={products.filter((p) => p.active).length} icon={<IconInventory size={18} />} color="#8B5CF6" />
        <StatCard label="Active Branches" value={branches.filter((b) => b.active).length} icon={<IconBranch size={18} />} color="#06B6D4" />
        <StatCard label="Users" value={userCount} icon={<IconUsers size={18} />} color="#EC4899" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <h2 className="font-display font-bold text-[#0F172A]">Recent Orders</h2>
              <button onClick={() => navigate("admin-orders")} className="text-sm text-[#4F46E5] hover:text-[#4338CA] font-medium">
                View all
              </button>
            </div>
            <div className="divide-y divide-[#F8FAFC]">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                  onClick={() => navigate("admin-order-details", order.id)}
                >
                  <div className="w-9 h-9 bg-[#EEF2FF] rounded-xl flex items-center justify-center shrink-0">
                    <IconPackage size={16} className="text-[#4F46E5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono-data text-xs text-[#94A3B8]">{order.id}</p>
                    <p className="font-medium text-[#0F172A] text-sm truncate">{order.customerName}</p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-xs text-[#94A3B8]">{order.branchName}</p>
                  </div>
                  <StatusBadge status={order.status} />
                  <span className="font-bold text-[#0F172A] text-sm shrink-0">{formatCurrency(order.total)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <h2 className="font-display font-bold text-[#0F172A]">Branch Workload</h2>
            </div>
            <div className="p-5 space-y-4">
              {branchWorkload.map((b) => (
                <div key={b.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-[#0F172A] truncate">{b.name}</span>
                    <span className={`text-xs font-bold ${b.pct > 80 ? "text-[#EF4444]" : b.pct > 60 ? "text-[#F59E0B]" : "text-[#10B981]"}`}>{b.pct}%</span>
                  </div>
                  <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(b.pct, 100)}%`,
                        backgroundColor: b.pct > 80 ? "#EF4444" : b.pct > 60 ? "#F59E0B" : "#10B981",
                      }}
                    />
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-1">{b.currentWorkload}/{b.capacity} open orders</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-2">
              <IconAlert size={16} className="text-[#F59E0B]" />
              <h2 className="font-display font-bold text-[#0F172A]">Low Stock</h2>
            </div>
            <div className="p-4 space-y-3">
              {lowStock.length === 0 ? (
                <p className="text-xs text-[#94A3B8]">No low-stock alerts right now.</p>
              ) : (
                lowStock.map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#0F172A] leading-tight truncate">{item.name}</p>
                      <p className="text-xs text-[#94A3B8]">{item.branch}</p>
                    </div>
                    <Badge variant="warning">{item.available} left</Badge>
                  </div>
                ))
              )}
              <button onClick={() => navigate("admin-stock")} className="text-xs text-[#4F46E5] hover:text-[#4338CA] font-medium w-full text-center mt-1">
                Manage stock →
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
