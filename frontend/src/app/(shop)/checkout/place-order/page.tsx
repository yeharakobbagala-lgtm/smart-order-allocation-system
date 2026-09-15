"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlaceOrder } from "@/views/pages/customer/PlaceOrder";
import { useApp } from "@/context/app-provider";

export default function PlaceOrderPage() {
  const router = useRouter();
  const { cart, pendingOrderData, placeOrderConfirm, navigate } = useApp();

  useEffect(() => {
    if (!pendingOrderData || cart.length === 0) {
      router.replace("/checkout");
    }
  }, [pendingOrderData, cart.length, router]);

  if (!pendingOrderData || cart.length === 0) return null;

  const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <PlaceOrder
      cart={cart}
      deliveryForm={pendingOrderData.form}
      branchName={pendingOrderData.branchName}
      estimatedDelivery={pendingOrderData.estimatedDelivery}
      total={total}
      onConfirm={placeOrderConfirm}
      navigate={navigate}
    />
  );
}
