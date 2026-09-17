"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Checkout } from "@/views/pages/customer/Checkout";
import { useApp } from "@/context/app-provider";
import { LoadingState } from "@/components/ui";
import { ApiError } from "@/lib/api";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, user, authLoading, placeOrder, navigate, addToast } = useApp();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <LoadingState message="Loading…" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <Checkout
      cart={cart}
      user={user}
      submitting={submitting}
      navigate={navigate}
      onSubmitOrder={async (form) => {
        setSubmitting(true);
        try {
          await placeOrder(form);
        } catch (err) {
          const message =
            err instanceof ApiError
              ? err.message
              : err instanceof Error
                ? err.message
                : "Could not place order.";
          addToast(message, "error");
          throw err;
        } finally {
          setSubmitting(false);
        }
      }}
    />
  );
}
