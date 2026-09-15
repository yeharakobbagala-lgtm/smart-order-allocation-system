"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Reservation } from "@/views/pages/customer/Reservation";
import { useApp } from "@/context/app-provider";

export default function ReservationPage() {
  const router = useRouter();
  const { cart, pendingOrderData, reservationConfirm, navigate } = useApp();

  useEffect(() => {
    if (!pendingOrderData || cart.length === 0) {
      router.replace("/checkout");
    }
  }, [pendingOrderData, cart.length, router]);

  if (!pendingOrderData || cart.length === 0) return null;

  const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <Reservation
      cart={cart}
      branchName={pendingOrderData.branchName}
      estimatedDelivery={pendingOrderData.estimatedDelivery}
      total={total}
      onConfirmOrder={reservationConfirm}
      navigate={navigate}
    />
  );
}
