"use client";

import React, { useState } from "react";
import type { Order, Page } from "@/lib/types";
import { formatCurrency } from "@/lib/currency";
import { Button, Card, StatusBadge, OrderTimeline, Modal, Alert, IconArrowLeft, IconMapPin, IconCalendar, IconBranch } from "@/components/ui";

interface Props {
  order: Order;
  navigate: (page: Page) => void;
  onCancelOrder?: (orderId: string) => Promise<void>;
}

const canCancel = (status: string) => status === "ALLOCATED" || status === "PROCESSING";

export const OrderDetails: React.FC<Props> = ({ order, navigate, onCancelOrder }) => {
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [localStatus, setLocalStatus] = useState<string | null>(null);

  const displayStatus = localStatus ?? order.status;

  const handleCancel = async () => {
    if (!onCancelOrder) return;
    setCancelling(true);
    setCancelError("");
    try {
      await onCancelOrder(order.id);
      setLocalStatus("CANCELLED");
      setCancelModal(false);
    } catch (err) {
      setCancelError(
        err instanceof Error ? err.message : "Could not cancel order."
      );
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate("my-orders")} className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#334155] mb-6 font-medium">
        <IconArrowLeft size={16} /> My Orders
      </button>

      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <p className="font-mono-data text-sm text-[#64748B]">Order ID</p>
          <h1 className="font-display text-2xl font-bold text-[#0F172A]">{order.id}</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={displayStatus} />
          <StatusBadge status={order.paymentStatus} />
          {canCancel(displayStatus) && onCancelOrder && (
            <Button variant="danger" size="sm" onClick={() => setCancelModal(true)}>
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {displayStatus === "CANCELLED" && localStatus === "CANCELLED" && (
        <Alert variant="success" className="mb-6">Your order has been successfully cancelled.</Alert>
      )}

      <Card className="p-6 mb-6">
        <h2 className="font-display font-bold text-[#0F172A] mb-5">Order Status</h2>
        <OrderTimeline status={displayStatus} />
      </Card>

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
            <IconMapPin size={16} className="text-[#4F46E5]" />
            Delivery Address
          </h2>
          <p className="text-sm font-medium text-[#0F172A]">{order.address}</p>
          {order.city && <p className="text-sm text-[#64748B]">{order.city}</p>}
          {order.note && <p className="text-xs text-[#94A3B8] mt-2 italic">&quot;{order.note}&quot;</p>}
        </Card>

        <Card className="p-5">
          <h2 className="font-display font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
            <IconBranch size={16} className="text-[#4F46E5]" />
            Fulfillment Branch
          </h2>
          <p className="text-sm font-medium text-[#0F172A]">{order.branchName}</p>
          <p className="text-xs text-[#94A3B8] mt-0.5">Auto-allocated by SmartOrder</p>
        </Card>

        <Card className="p-5">
          <h2 className="font-display font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
            <IconCalendar size={16} className="text-[#4F46E5]" />
            Estimated Delivery
          </h2>
          <p className="text-sm font-medium text-[#10B981]">
            {order.estimatedDelivery
              ? new Date(order.estimatedDelivery).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" })
              : "Pending"}
          </p>
          <p className="text-xs text-[#94A3B8] mt-0.5">Cash on Delivery — {order.paymentStatus === "PAID" ? "Paid" : "Pending"}</p>
        </Card>
      </div>

      <Card className="overflow-hidden mb-5">
        <div className="px-5 py-4 border-b border-[#E2E8F0]">
          <h2 className="font-display font-bold text-[#0F172A]">Order Items</h2>
        </div>
        <div className="divide-y divide-[#F1F5F9]">
          {order.items.map((item) => (
            <div key={item.productId} className="flex items-center gap-3 px-5 py-4">
              <img src={item.image} alt={item.productName} className="w-14 h-14 rounded-xl object-cover bg-[#F1F5F9] shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-[#0F172A] text-sm">{item.productName}</p>
                <p className="text-xs text-[#94A3B8]">{formatCurrency(item.price)} × {item.quantity}</p>
              </div>
              <p className="font-display font-bold text-[#0F172A]">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-between font-display font-bold text-xl text-[#0F172A]">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </Card>

      <Modal open={cancelModal} onClose={() => setCancelModal(false)} title="Cancel Order" size="sm">
        <p className="text-[#64748B] mb-5">
          Are you sure you want to cancel order <strong className="text-[#0F172A]">{order.id}</strong>? This action cannot be undone.
        </p>
        {cancelError && <Alert variant="danger" className="mb-4">{cancelError}</Alert>}
        <Alert variant="warning" className="mb-5">
          Once cancelled, reserved stock will be released and the order cannot be reinstated.
        </Alert>
        <div className="flex gap-3">
          <Button variant="danger" loading={cancelling} onClick={() => void handleCancel()} className="flex-1">
            Yes, cancel order
          </Button>
          <Button variant="outline" onClick={() => setCancelModal(false)} className="flex-1">
            Keep order
          </Button>
        </div>
      </Modal>
    </div>
  );
};
