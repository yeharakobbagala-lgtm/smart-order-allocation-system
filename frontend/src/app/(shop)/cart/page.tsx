"use client";

import { Cart } from "@/views/pages/customer/Cart";
import { useApp } from "@/context/app-provider";

export default function CartPage() {
  const { cart, updateQty, removeFromCart, navigate } = useApp();
  return (
    <Cart
      cart={cart}
      onUpdateQty={updateQty}
      onRemove={removeFromCart}
      navigate={navigate}
    />
  );
}
