"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Reservation } from "@/views/pages/customer/Reservation";
import { useApp } from "@/context/app-provider";
import { LoadingState } from "@/components/ui";
import { ApiError, confirmCheckoutHold } from "@/lib/api";
import {
  clearCheckoutHold,
  loadCheckoutHold,
} from "@/lib/checkout-hold";
import { enrichApiOrders } from "@/lib/order-enrichment";
import type { ApiCheckoutHold } from "@/lib/api";
import { secondsUntilExpiry } from "@/lib/datetime";

export default function ReservationPage() {
  const router = useRouter();
  const {
    user,
    authLoading,
    navigate,
    addToast,
    setConfirmedOrder,
    refreshCart,
    refreshOrders,
  } = useApp();
  const [hold, setHold] = useState<ApiCheckoutHold | null>(null);
  const [ready, setReady] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const stored = loadCheckoutHold();
    if (!stored) {
      router.replace("/checkout");
      return;
    }
    setHold(stored);
    setReady(true);
  }, [router]);

  const onConfirmOrder = useCallback(async () => {
    if (!hold) return;

    if (secondsUntilExpiry(hold.expires_at) <= 0) {
      setConfirmError("Reservation has expired.");
      clearCheckoutHold();
      setHold((prev) =>
        prev ? { ...prev, status: "EXPIRED" } : prev
      );
      return;
    }

    setConfirming(true);
    setConfirmError("");
    try {
      const order = await confirmCheckoutHold(hold.hold_id);
      const mapped = (
        await enrichApiOrders([order], { customerEmail: user?.email })
      )[0];
      clearCheckoutHold();
      setConfirmedOrder(mapped);
      await refreshCart();
      await refreshOrders();
      addToast("Order confirmed!", "success");
      router.push(`/orders/${mapped.id}/confirmation`);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not confirm order.";
      setConfirmError(message);
      addToast(message, "error");

      const expired =
        err instanceof ApiError &&
        err.status === 409 &&
        /expir/i.test(message);

      if (expired) {
        clearCheckoutHold();
        setHold((prev) =>
          prev
            ? {
                ...prev,
                // Keep a past UTC timestamp so the UI switches to expired state
                expires_at: new Date(Date.now() - 1000).toISOString(),
                status: "EXPIRED",
              }
            : prev
        );
      }
    } finally {
      setConfirming(false);
    }
  }, [
    hold,
    user?.email,
    setConfirmedOrder,
    refreshCart,
    refreshOrders,
    addToast,
    router,
  ]);

  if (authLoading || !ready) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <LoadingState message="Loading reservation…" />
      </div>
    );
  }

  if (!user || !hold) return null;

  return (
    <Reservation
      hold={hold}
      confirming={confirming}
      confirmError={confirmError}
      onConfirmOrder={() => void onConfirmOrder()}
      navigate={navigate}
    />
  );
}
