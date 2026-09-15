"use client";

import React from "react";
import type { Order, Page } from "@/lib/types";
import { Button, Card, StatusBadge, IconCheck, IconChevronRight } from "@/components/ui";

interface Props {
  order: Order;
  navigate: (page: Page, id?: string) => void;
}

export const OrderConfirmation: React.FC<Props> = ({ order, navigate }) => {
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
            <div className="mt-0.5"><StatusBadge status={order.status} /></div>
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

        <div className="border-t border-[#E2E8F0] pt-4 mb-4">
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">Items</p>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-[#64748B]">{item.productName} ×{item.quantity}</span>
                <span className="font-medium text-[#0F172A]">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between font-display font-bold text-xl text-[#0F172A] border-t border-[#E2E8F0] pt-4">
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
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
