"use client";

import React, { useEffect, useState } from "react";
import type { Page } from "@/lib/types";
import type { ApiCheckoutHold, ApiNoteClassification } from "@/lib/api";
import { ApiError, classifyCheckoutNote } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import {
  Button,
  Card,
  Alert,
  Textarea,
  CountdownTimer,
  IconArrowLeft,
} from "@/components/ui";
import {
  RESERVATION_DURATION_SECONDS,
  formatDeliveryDate,
  formatEtaHours,
  formatExpiryClock,
  formatProcessingTime,
  formatStockWait,
  formatTravelTime,
  secondsUntilExpiry,
} from "@/lib/datetime";

interface Props {
  hold: ApiCheckoutHold;
  confirming: boolean;
  confirmError: string;
  onConfirmOrder: () => void;
  navigate: (page: Page) => void;
}

export const Reservation: React.FC<Props> = ({
  hold,
  confirming,
  confirmError,
  onConfirmOrder,
  navigate,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    secondsUntilExpiry(hold.expires_at)
  );
  const [expired, setExpired] = useState(
    () => secondsUntilExpiry(hold.expires_at) <= 0
  );
  const [assistantMessage, setAssistantMessage] = useState("");
  const [analysing, setAnalysing] = useState(false);
  const [classification, setClassification] =
    useState<ApiNoteClassification | null>(null);
  const [assistantError, setAssistantError] = useState("");

  useEffect(() => {
    const left = secondsUntilExpiry(hold.expires_at);
    setSecondsLeft(left);
    setExpired(left <= 0);
  }, [hold.expires_at]);

  useEffect(() => {
    if (expired) return;

    const tick = () => {
      const left = secondsUntilExpiry(hold.expires_at);
      setSecondsLeft(left);
      if (left <= 0) setExpired(true);
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [hold.expires_at, expired]);

  const subtotal = Number(hold.subtotal);
  const delivery = Number(hold.delivery);
  const total = Number(hold.total);

  const handleAnalyse = async () => {
    const message = assistantMessage.trim();
    if (!message) {
      setClassification(null);
      setAssistantError("Please enter a question.");
      return;
    }

    setAnalysing(true);
    setAssistantError("");
    setClassification(null);
    try {
      const result = await classifyCheckoutNote(message);
      setClassification(result);
    } catch (err) {
      const detail =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not analyse your question.";
      setAssistantError(detail);
    } finally {
      setAnalysing(false);
    }
  };

  if (expired) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
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
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-4">
      <button
        type="button"
        onClick={() => navigate("checkout")}
        className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#334155] font-medium"
      >
        <IconArrowLeft size={16} /> Back to Checkout
      </button>

      <Card className="p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold text-[#0F172A] text-center mb-5">
          Order Reservation
        </h1>

        <div className="flex justify-center mb-2">
          <div className="inline-flex items-center gap-2 bg-[#FFFBEB] text-[#92400E] px-4 py-1.5 rounded-full text-sm font-medium border border-[#FDE68A]">
            Temporarily Reserved
          </div>
        </div>
        <p className="text-center text-sm text-[#64748B] mb-6">
          Complete your order within 10 minutes.
        </p>

        <div className="space-y-5 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
              Allocated Branch
            </p>
            <p className="font-display text-lg font-bold text-[#0F172A] mt-1">
              {hold.branch_name}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
              Delivery Estimate
            </p>
            <p className="font-display font-bold text-[#0F172A] mt-1">
              {formatDeliveryDate(hold.estimated_delivery_date)}
            </p>
            <p className="text-[#64748B] mt-0.5">
              Estimated arrival: {formatEtaHours(hold.eta_hours)}
            </p>
            {hold.estimated_delivery_end &&
              hold.estimated_delivery_end !== hold.estimated_delivery_date && (
                <p className="text-xs text-[#94A3B8] mt-1">
                  Window ends {formatDeliveryDate(hold.estimated_delivery_end)}
                </p>
              )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                Road Distance
              </p>
              <p className="font-medium text-[#0F172A] mt-1">
                {Number(hold.distance_km).toFixed(1)} km
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                Travel Time
              </p>
              <p className="font-medium text-[#0F172A] mt-1">
                {formatTravelTime(hold.travel_time_hours)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                Stock Wait
              </p>
              <p className="font-medium text-[#0F172A] mt-1">
                {formatStockWait(hold.stock_wait_hours)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                Processing Time
              </p>
              <p className="font-medium text-[#0F172A] mt-1">
                {formatProcessingTime(hold.processing_time_hours)}
              </p>
            </div>
          </div>
        </div>

        <hr className="border-[#E2E8F0] my-6" />

        <div className="text-center mb-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8] mb-3">
            Temporary Reservation
          </p>
          <p className="text-sm text-[#64748B] mb-3">⏳ Reserved for you</p>
          <div className="flex justify-center mb-3">
            <CountdownTimer
              seconds={secondsLeft}
              total={RESERVATION_DURATION_SECONDS}
            />
          </div>
          <p className="text-sm text-[#334155]">
            Reservation expires at:{" "}
            <span className="font-mono-data font-semibold">
              {formatExpiryClock(hold.expires_at)}
            </span>
          </p>
          <p className="text-xs text-[#94A3B8] mt-2">
            Stock is held temporarily for 10 minutes. Confirm before expiry —
            no order is created until you confirm.
          </p>
        </div>

        <hr className="border-[#E2E8F0] my-6" />

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8] mb-3">
            Order Summary
          </p>
          <div className="space-y-2">
            {hold.items.map((item) => (
              <div
                key={item.reservation_id}
                className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5"
              >
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-[#0F172A] font-medium">
                    {item.product_name} × {item.quantity}
                  </span>
                  <span className="font-medium text-[#0F172A] shrink-0">
                    {formatCurrency(Number(item.line_total))}
                  </span>
                </div>
                <p className="text-xs text-[#92400E] mt-1">
                  Temporarily Reserved · Reserved for you
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1.5 text-sm border-t border-[#E2E8F0] pt-3">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Delivery</span>
              <span className="font-medium">{formatCurrency(delivery)}</span>
            </div>
            <div className="flex justify-between text-base pt-1">
              <span className="font-display font-bold text-[#0F172A]">Total</span>
              <span className="font-display font-bold text-[#0F172A]">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>

        <hr className="border-[#E2E8F0] my-6" />

        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">
              💬 Ask about your order
            </p>
            <p className="text-xs text-[#64748B] mt-1">
              Have a question? We can classify your inquiry. This does not
              affect your reservation or confirmation.
            </p>
          </div>
          <Textarea
            label="Your question"
            value={assistantMessage}
            onChange={(e) => {
              setAssistantMessage(e.target.value);
              setAssistantError("");
              setClassification(null);
            }}
            placeholder="Type your question here..."
            rows={3}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={analysing}
            disabled={analysing || confirming}
            onClick={() => void handleAnalyse()}
            className="w-full sm:w-auto"
          >
            {analysing ? "Analysing..." : "Analyse"}
          </Button>
          {assistantError && (
            <p className="text-xs text-[#EF4444]">{assistantError}</p>
          )}
          {classification && !assistantError && (
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-3 text-sm space-y-1.5">
              <p className="text-[#0F172A]">
                <span className="text-[#64748B]">Category</span>
                <br />
                <span className="font-medium">{classification.category}</span>
              </p>
              <p className="text-[#0F172A]">
                <span className="text-[#64748B]">Confidence</span>
                <br />
                <span className="font-medium">
                  {Math.round(classification.confidence * 100)}%
                </span>
              </p>
              <p
                className={
                  classification.low_confidence
                    ? "text-xs text-[#92400E]"
                    : "text-xs text-[#065F46]"
                }
              >
                {classification.low_confidence
                  ? "⚠ Low confidence — manual review recommended"
                  : "✓ High confidence"}
              </p>
            </div>
          )}
        </div>

        {confirmError && (
          <Alert variant="danger" className="mt-5">
            {confirmError}
          </Alert>
        )}

        <Button
          size="lg"
          className="w-full mt-6 uppercase tracking-wide"
          loading={confirming}
          disabled={expired || confirming}
          onClick={onConfirmOrder}
        >
          Confirm Order
        </Button>
      </Card>
    </div>
  );
};
