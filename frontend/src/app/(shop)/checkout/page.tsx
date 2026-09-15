"use client";

import { Checkout } from "@/views/pages/customer/Checkout";
import { useApp } from "@/context/app-provider";

export default function CheckoutPage() {
  const { cart, user, checkoutPlaceOrder, navigate } = useApp();
  return (
    <Checkout
      cart={cart}
      user={user}
      onPlaceOrder={checkoutPlaceOrder}
      navigate={navigate}
    />
  );
}
