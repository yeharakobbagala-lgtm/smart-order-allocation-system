"use client";

import React from "react";
import type { Order, OrderItem } from "@/lib/types";
import { formatCurrency } from "@/lib/currency";
import {
  formatEstimatedDelivery,
  formatRestockDate,
  resolveItemFulfillmentType,
} from "@/lib/fulfillment";

interface Props {
  order: Order;
  item: OrderItem;
  showPrice?: boolean;
}

export const OrderItemFulfillment: React.FC<Props> = ({
  order,
  item,
  showPrice = true,
}) => {
  const fulfillment = resolveItemFulfillmentType(item, order);
  const restockLabel = formatRestockDate(item.restockDate);
  const etaLabel = formatEstimatedDelivery(order.estimatedDelivery);

  return (
    <div className="flex items-start gap-3 py-3">
      {item.image ? (
        <img
          src={item.image}
          alt={item.productName}
          className="w-12 h-12 rounded-xl object-cover bg-[#F1F5F9] shrink-0"
        />
      ) : null}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[#0F172A] text-sm">
          {item.productName} ×{item.quantity}
        </p>
        {fulfillment === "CURRENT" ? (
          <div className="mt-1 space-y-0.5">
            <p className="text-xs font-medium text-[#065F46]">
              ✓ Confirmed from current stock
            </p>
            <p className="text-xs text-[#64748B]">
              Reserved — Ready from Current Stock
            </p>
            {etaLabel && (
              <p className="text-xs text-[#94A3B8]">
                Estimated delivery: {etaLabel}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-1 space-y-0.5">
            <p className="text-xs font-medium text-[#92400E]">
              ⏳ Awaiting Restock
            </p>
            <p className="text-xs text-[#64748B]">
              Confirmed — Awaiting Restock
            </p>
            <p className="text-xs text-[#64748B]">
              Your item is reserved from the upcoming restock.
            </p>
            {restockLabel && (
              <p className="text-xs text-[#334155]">
                Expected restock: {restockLabel}
              </p>
            )}
            {etaLabel && (
              <p className="text-xs text-[#94A3B8]">
                Estimated delivery: {etaLabel}
              </p>
            )}
          </div>
        )}
      </div>
      {showPrice && (
        <p className="font-display font-bold text-[#0F172A] text-sm shrink-0">
          {formatCurrency(item.price * item.quantity)}
        </p>
      )}
    </div>
  );
};
