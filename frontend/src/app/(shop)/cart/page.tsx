"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Cart } from "@/views/pages/customer/Cart";
import { useApp } from "@/context/app-provider";
import { LoadingState } from "@/components/ui";

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    cartLoading,
    updateQty,
    removeFromCart,
    navigate,
    user,
    authLoading,
  } = useApp();

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
    <Cart
      cart={cart}
      cartLoading={cartLoading}
      onUpdateQty={updateQty}
      onRemove={removeFromCart}
      navigate={navigate}
    />
  );
}
