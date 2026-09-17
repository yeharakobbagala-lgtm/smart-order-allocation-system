"use client";

import React from "react";
import type { Order, Page } from "@/lib/types";
import { formatCurrency } from "@/lib/currency";
import { orderHasFutureItems } from "@/lib/fulfillment";
import { OrderItemFulfillment } from "@/components/OrderItemFulfillment";
import { Button, Card, StatusBadge, IconCheck, IconChevronRight } from "@/components/ui";

interface Props {
  order: Order;
  navigate: (page: Page, id?: string) => void;
}

export const OrderConfirmation: React.FC<Props> = ({ order, navigate }) => {
  const hasFuture = orderHasFutureItems(order);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      {/* Success Banner */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-[#ECFDF5] rounded-full flex items-center justify-center mx-auto mb-5">
          <div className="w-14 h-14 bg-[#10B981] rounded-full flex items-center justify-center">
            <IconCheck size={28} className="text-white" />
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold text-[#0F172A] mb-2">Order placed!</h1>
        <p className="text-[#64748B]">
          Your order has been confirmed and will be dispatched from{" "}
          <strong className="text-[#334155]">{order.branchName}</strong>.
        </p>
      </div>

      <Card className="p-6 mb-5">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <p className="text-xs text-[#94A3B8]">Order Number</p>
            <p className="font-mono-data font-bold text-[#0F172A] mt-0.5">{order.id}</p>
          </div>
          <div>
            <p className="text-xs text-[#94A3B8]">Status</p>
            <div className="mt-0.5 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#ECFDF5] text-[#065F46]">
                Confirmed
              </span>
              <StatusBadge status={order.status} />
            </div>
          </div>
          <div>
            <p className="text-xs text-[#94A3B8]">Fulfillment Branch</p>
            <p className="font-medium text-[#0F172A] mt-0.5 text-sm">{order.branchName}</p>
          </div>
          <div>
            <p className="text-xs text-[#94A3B8]">Estimated Delivery</p>
            <p className="font-medium text-[#10B981] mt-0.5 text-sm">{new Date(order.estimatedDelivery).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
          </div>
          <div>
            <p className="text-xs text-[#94A3B8]">Payment Method</p>
            <p className="font-medium text-[#0F172A] mt-0.5 text-sm">Cash on Delivery</p>
          </div>
          <div>
            <p className="text-xs text-[#94A3B8]">Payment Status</p>
            <div className="mt-0.5"><StatusBadge status={order.paymentStatus} /></div>
          </div>
        </div>

        {hasFuture && (
          <div className="mb-4 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2.5 text-xs text-[#92400E]">
            This confirmed order includes one or more items awaiting restock.
            Item-level status is shown below.
          </div>
        )}

        <div className="border-t border-[#E2E8F0] pt-4 mb-4">
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">Items</p>
          <div className="divide-y divide-[#F1F5F9]">
            {order.items.map((item) => (
              <OrderItemFulfillment
                key={item.productId}
                order={order}
                item={item}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-between font-display font-bold text-xl text-[#0F172A] border-t border-[#E2E8F0] pt-4">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          className="flex-1"
          onClick={() => navigate("order-details", order.id)}
          iconRight={<IconChevronRight size={16} />}
        >
          Track Your Order
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => navigate("products")}>
          Continue Shopping
        </Button>
      </div>
    </div>
  );
};
