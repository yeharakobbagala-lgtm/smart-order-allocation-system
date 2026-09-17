"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Checkout } from "@/views/pages/customer/Checkout";
import { useApp } from "@/context/app-provider";
import { LoadingState } from "@/components/ui";
import { ApiError, createCheckoutHold } from "@/lib/api";
import { saveCheckoutHold } from "@/lib/checkout-hold";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, user, authLoading, navigate, addToast } = useApp();
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
          const lat = Number(form.lat);
          const lng = Number(form.lng);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            throw new Error("Please select a delivery location on the map.");
          }

          const deliveryAddress = [form.address.trim(), form.city.trim()]
            .filter(Boolean)
            .join(", ");

          const hold = await createCheckoutHold({
            customer_name: form.name.trim(),
            phone: form.phone.trim(),
            delivery_address: deliveryAddress,
            latitude: lat,
            longitude: lng,
            order_note: form.note.trim() || null,
            payment_method: "COD",
          });

          saveCheckoutHold(hold);
          addToast("Stock reserved for 10 minutes", "success");
          router.push("/checkout/reservation");
        } catch (err) {
          const message =
            err instanceof ApiError && err.status === 409
              ? "Sorry, this order can no longer be fulfilled with the current stock or branch availability."
              : err instanceof ApiError
                ? err.message
                : err instanceof Error
                  ? err.message
                  : "Could not allocate and reserve stock.";
          addToast(message, "error");
          throw err;
        } finally {
          setSubmitting(false);
        }
      }}
    />
  );
}
