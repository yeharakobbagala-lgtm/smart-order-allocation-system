import React, { useState } from "react";
import type { Order, Page } from "../../types";
import { Card, StatusBadge, EmptyState, IconSearch, IconFilter, IconPackage, IconEye } from "../../components/ui";
import { MOCK_BRANCHES } from "../../data";

interface Props {
  orders: Order[];
  navigate: (page: Page, id?: string) => void;
}

export const AdminOrders: React.FC<Props> = ({ orders, navigate }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");

  const filtered = orders.filter((o) => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase()) || o.customerEmail.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchBranch = branchFilter === "all" || o.branchId === branchFilter;
    return matchSearch && matchStatus && matchBranch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-[#0F172A]">Orders</h1>
        <p className="text-[#64748B] mt-1">{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"><IconSearch size={16} /></span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID or customer..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-sm placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
          >
            <option value="all">All Statuses</option>
            {["ALLOCATED", "PROCESSING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"].map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="appearance-none px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
          >
            <option value="all">All Branches</option>
            {MOCK_BRANCHES.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      </Card>

      {/* Table — scrollable on mobile */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {["Order ID", "Customer", "Date", "Branch", "Items", "Total", "Status", "Payment", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8FAFC]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12">
                    <EmptyState icon={<IconPackage size={24} />} title="No orders found" description="Try adjusting your search or filters." />
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F8FAFC] transition-colors cursor-pointer" onClick={() => navigate("admin-order-details", order.id)}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono-data text-xs text-[#64748B]">{order.id}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-[#0F172A]">{order.customerName}</p>
                        <p className="text-xs text-[#94A3B8]">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#64748B] text-xs">
                      {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-[#334155]">{order.branchName}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#64748B] text-sm">
                      {order.items.length}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-bold text-[#0F172A]">${order.total.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={order.paymentStatus} /></td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate("admin-order-details", order.id); }}
                        className="p-2 rounded-lg hover:bg-[#EEF2FF] text-[#94A3B8] hover:text-[#4F46E5] transition-colors"
                      >
                        <IconEye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile: card fallback hint */}
      <p className="text-xs text-center text-[#94A3B8]">
        {filtered.length} order{filtered.length !== 1 ? "s" : ""} shown
      </p>
    </div>
  );
};
