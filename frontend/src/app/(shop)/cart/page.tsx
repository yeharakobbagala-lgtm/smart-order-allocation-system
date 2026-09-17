"use client";

import { Cart } from "@/views/pages/customer/Cart";
import { useApp } from "@/context/app-provider";

export default function CartPage() {
  const { cart, cartLoading, updateQty, removeFromCart, navigate } = useApp();
  return (
    <Cart
      cart={cart}
      cartLoading={cartLoading}
      onUpdateQty={updateQty}
      onRemove={removeFromCart}
      navigate={navigate}
    />
  );
}
