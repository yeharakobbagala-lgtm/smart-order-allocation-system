"use client";

import React, { useState } from "react";
import type { Order, Page } from "@/lib/types";
import { formatCurrency } from "@/lib/currency";
import {
  orderHasFutureItems,
  resolveItemFulfillmentType,
} from "@/lib/fulfillment";
import { Card, StatusBadge, EmptyState, IconPackage, IconChevronRight } from "@/components/ui";

interface Props {
  orders: Order[];
  navigate: (page: Page, id?: string) => void;
}

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "ALLOCATED", label: "Allocated" },
  { key: "PROCESSING", label: "Processing" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
];

export const MyOrders: React.FC<Props> = ({ orders, navigate }) => {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-[#0F172A]">My Orders</h1>
        <p className="text-[#64748B] mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
      </div>

      {/* Filter tabs - scrollable on mobile */}
      <div className="overflow-x-auto pb-2 mb-6">
        <div className="flex gap-1.5 min-w-max">
          {STATUS_FILTERS.map((f) => {
            const count = f.key === "all" ? orders.length : orders.filter((o) => o.status === f.key).length;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${filter === f.key ? "bg-[#4F46E5] text-white border-[#4F46E5]" : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#4F46E5]/30"}`}
              >
                {f.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f.key ? "bg-white/20 text-white" : "bg-[#F1F5F9] text-[#64748B]"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<IconPackage size={24} />}
          title="No orders found"
          description={filter === "all" ? "You haven't placed any orders yet." : `No orders with status "${filter}".`}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <Card
              key={order.id}
              className="p-5 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate("order-details", order.id)}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-4">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item, i) => (
                      <img
                        key={i}
                        src={item.image}
                        alt={item.productName}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-white bg-[#F1F5F9]"
                        style={{ zIndex: 3 - i }}
                      />
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] border-2 border-white flex items-center justify-center text-xs font-bold text-[#64748B]">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-mono-data text-sm font-medium text-[#64748B]">{order.id}</p>
                    <p className="font-display font-bold text-[#0F172A] mt-0.5">
                      {order.items.length === 1 ? order.items[0].productName : `${order.items[0].productName} +${order.items.length - 1} more`}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {order.status !== "CANCELLED" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#ECFDF5] text-[#065F46]">
                          Confirmed
                        </span>
                      )}
                      <StatusBadge status={order.status} />
                      <StatusBadge status={order.paymentStatus} />
                    </div>
                    {order.status !== "CANCELLED" && (
                      <div className="mt-2 space-y-0.5">
                        {order.items.map((item) => {
                          const fulfillment = resolveItemFulfillmentType(
                            item,
                            order
                          );
                          return (
                            <p
                              key={item.productId}
                              className="text-xs text-[#64748B]"
                            >
                              {item.productName} ×{item.quantity}
                              {" · "}
                              {fulfillment === "FUTURE"
                                ? "⏳ Awaiting Restock"
                                : "✓ Current stock"}
                            </p>
                          );
                        })}
                        {orderHasFutureItems(order) && (
                          <p className="text-xs text-[#92400E]">
                            Order confirmed — some items await restock
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <p className="font-display font-bold text-xl text-[#0F172A]">{formatCurrency(order.total)}</p>
                  <p className="text-xs text-[#94A3B8]">{new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  <p className="text-xs text-[#64748B]">{order.branchName}</p>
                  <IconChevronRight size={16} className="text-[#94A3B8]" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
