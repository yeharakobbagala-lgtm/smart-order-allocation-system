"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Page } from "@/lib/types";
import type { ApiCheckoutHold } from "@/lib/api";
import {
  Button,
  Card,
  Alert,
  CountdownTimer,
  IconCheck,
  IconArrowLeft,
} from "@/components/ui";

interface Props {
  hold: ApiCheckoutHold;
  confirming: boolean;
  confirmError: string;
  onConfirmOrder: () => void;
  navigate: (page: Page) => void;
}

function formatHours(value: number): string {
  if (value < 1) return `${Math.round(value * 60)} min`;
  if (value < 48) return `${value.toFixed(1)} h`;
  return `${(value / 24).toFixed(1)} days`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function secondsUntil(iso: string): number {
  const end = new Date(iso).getTime();
  if (Number.isNaN(end)) return 0;
  return Math.max(0, Math.floor((end - Date.now()) / 1000));
}

export const Reservation: React.FC<Props> = ({
  hold,
  confirming,
  confirmError,
  onConfirmOrder,
  navigate,
}) => {
  const totalSeconds = useMemo(
    () => Math.max(1, secondsUntil(hold.expires_at) || 600),
    [hold.expires_at]
  );
  const [secondsLeft, setSecondsLeft] = useState(() =>
    secondsUntil(hold.expires_at)
  );
  const [expired, setExpired] = useState(() => secondsUntil(hold.expires_at) <= 0);

  useEffect(() => {
    setSecondsLeft(secondsUntil(hold.expires_at));
    setExpired(secondsUntil(hold.expires_at) <= 0);
  }, [hold.expires_at]);

  useEffect(() => {
    if (expired) return;

    const tick = () => {
      const left = secondsUntil(hold.expires_at);
      setSecondsLeft(left);
      if (left <= 0) {
        setExpired(true);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [hold.expires_at, expired]);

  const subtotal = Number(hold.subtotal);
  const delivery = Number(hold.delivery);
  const total = Number(hold.total);

  if (expired) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <Card className="p-8 text-center space-y-4">
          <Alert variant="danger" title="Reservation expired">
            Your 10-minute stock reservation has ended. No order was created.
            Return to checkout to allocate and reserve again.
          </Alert>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button onClick={() => navigate("checkout")}>
              Return to Checkout
            </Button>
            <Button variant="outline" onClick={() => navigate("cart")}>
              Back to Cart
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <button
        onClick={() => navigate("checkout")}
        className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#334155] font-medium"
      >
        <IconArrowLeft size={16} /> Back to Checkout
      </button>

      <Card className="p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-[#ECFDF5] text-[#065F46] px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <IconCheck size={14} />
            Stock temporarily reserved
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A] mb-2">
            Review your allocation
          </h1>
          <p className="text-[#64748B] text-sm max-w-md mx-auto">
            Stock is temporarily reserved for 10 minutes. Confirm your order
            before the reservation expires.
          </p>
        </div>

        <div className="flex justify-center mb-2">
          <CountdownTimer seconds={secondsLeft} total={totalSeconds} />
        </div>
        <p className="text-center text-xs text-[#94A3B8] mb-6">
          Expires at {formatDateTime(hold.expires_at)}
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2E8F0]">
            <p className="text-xs text-[#64748B] mb-1">Selected branch</p>
            <p className="font-display font-bold text-[#0F172A]">{hold.branch_name}</p>
          </div>
          <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2E8F0]">
            <p className="text-xs text-[#64748B] mb-1">Road distance</p>
            <p className="font-display font-bold text-[#0F172A]">
              {hold.distance_km.toFixed(1)} km
            </p>
          </div>
          <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2E8F0]">
            <p className="text-xs text-[#64748B] mb-1">Expected ETA</p>
            <p className="font-display font-bold text-[#0F172A]">
              {formatHours(hold.eta_hours)}
            </p>
          </div>
          <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2E8F0]">
            <p className="text-xs text-[#64748B] mb-1">Estimated delivery</p>
            <p className="font-display font-bold text-[#0F172A] text-sm">
              {formatDateTime(hold.estimated_delivery_date)}
              {hold.estimated_delivery_end &&
                hold.estimated_delivery_end !== hold.estimated_delivery_date && (
                  <>
                    {" "}
                    – {formatDateTime(hold.estimated_delivery_end)}
                  </>
                )}
            </p>
          </div>
        </div>

        <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden mb-6">
          <div className="bg-[#F8FAFC] px-4 py-2.5 border-b border-[#E2E8F0]">
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Order summary
            </p>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {hold.items.map((item) => (
              <div
                key={item.reservation_id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0F172A] truncate">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-[#94A3B8]">
                    Qty: {item.quantity} × ${Number(item.unit_price).toFixed(2)}
                  </p>
                </div>
                <p className="text-sm font-bold text-[#0F172A]">
                  ${Number(item.line_total).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0] space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-[#64748B]">Subtotal</span>
              <span className="font-medium text-[#0F172A]">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#64748B]">Delivery</span>
              <span className="font-medium text-[#0F172A]">
                ${delivery.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="font-display font-bold text-[#0F172A]">Total</span>
              <span className="font-display font-bold text-[#4F46E5] text-lg">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {confirmError && (
          <Alert variant="danger" className="mb-4">
            {confirmError}
          </Alert>
        )}

        <Button
          size="lg"
          className="w-full"
          loading={confirming}
          disabled={expired || confirming}
          onClick={onConfirmOrder}
        >
          Confirm Order
        </Button>
      </Card>

      <Alert variant="info">
        Your items are held for 10 minutes using a temporary stock reservation.
        If time runs out, return to checkout to allocate again.
      </Alert>
    </div>
  );
};
