"use client";

import React from "react";
import type { Order, Page } from "@/lib/types";
import { MOCK_PRODUCTS, MOCK_BRANCHES, MOCK_USERS } from "@/lib/data";
import { Card, StatCard, StatusBadge, Badge, IconPackage, IconUsers, IconBranch, IconInventory, IconTruck, IconAlert } from "@/components/ui";

interface Props {
  orders: Order[];
  navigate: (page: Page, id?: string) => void;
}

export const AdminDashboard: React.FC<Props> = ({ orders, navigate }) => {
  const totalOrders = orders.length;
  const pending = orders.filter((o) => o.status === "ALLOCATED").length;
  const processing = orders.filter((o) => o.status === "PROCESSING").length;
  const delivered = orders.filter((o) => o.status === "DELIVERED").length;
  const activeUsers = MOCK_USERS.filter((u) => u.status === "active").length;

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const branchWorkload = MOCK_BRANCHES.filter((b) => b.active).map((b) => ({
    ...b,
    pct: Math.round((b.currentWorkload / b.capacity) * 100),
    orderCount: orders.filter((o) => o.branchId === b.id).length,
  }));

  const lowStock = [
    { name: "Ergonomic Office Chair", branch: "Downtown Hub", available: 7 },
    { name: "Apple MacBook Air M3", branch: "Downtown Hub", available: 10 },
    { name: "Apple MacBook Air M3", branch: "North Bay Depot", available: 17 },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-[#0F172A]">Dashboard</h1>
        <p className="text-[#64748B] mt-1">Welcome back — here's a real-time overview of your operations.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={totalOrders} icon={<IconPackage size={18} />} color="#4F46E5" change="+12% this week" />
        <StatCard label="Allocated" value={pending} icon={<IconTruck size={18} />} color="#3B82F6" />
        <StatCard label="Processing" value={processing} icon={<IconInventory size={18} />} color="#F59E0B" />
        <StatCard label="Delivered" value={delivered} icon={<IconPackage size={18} />} color="#10B981" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Products" value={MOCK_PRODUCTS.filter((p) => p.active).length} icon={<IconInventory size={18} />} color="#8B5CF6" />
        <StatCard label="Active Branches" value={MOCK_BRANCHES.filter((b) => b.active).length} icon={<IconBranch size={18} />} color="#06B6D4" />
        <StatCard label="Active Users" value={activeUsers} icon={<IconUsers size={18} />} color="#EC4899" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
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
                  <span className="font-bold text-[#0F172A] text-sm shrink-0">${order.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Branch Workload */}
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
                        width: `${b.pct}%`,
                        backgroundColor: b.pct > 80 ? "#EF4444" : b.pct > 60 ? "#F59E0B" : "#10B981",
                      }}
                    />
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-1">{b.currentWorkload}/{b.capacity} orders · {b.orderCount} today</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Low Stock Alert */}
          <Card>
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-2">
              <IconAlert size={16} className="text-[#F59E0B]" />
              <h2 className="font-display font-bold text-[#0F172A]">Low Stock</h2>
            </div>
            <div className="p-4 space-y-3">
              {lowStock.map((item, i) => (
                <div key={i} className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#0F172A] leading-tight truncate">{item.name}</p>
                    <p className="text-xs text-[#94A3B8]">{item.branch}</p>
                  </div>
                  <Badge variant="warning">{item.available} left</Badge>
                </div>
              ))}
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
