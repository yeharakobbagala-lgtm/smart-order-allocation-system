"use client";

import { use } from "react";
import { ProductDetails } from "@/views/pages/customer/ProductDetails";
import { useApp } from "@/context/app-provider";

export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { cart, addToCart, navigate } = useApp();
  return (
    <ProductDetails
      productId={id}
      cart={cart}
      onAddToCart={addToCart}
      navigate={navigate}
    />
  );
}
