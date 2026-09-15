"use client";

import { Products } from "@/views/pages/customer/Products";
import { useApp } from "@/context/app-provider";

export default function ProductsPage() {
  const { cart, addToCart, navigate } = useApp();
  return <Products cart={cart} onAddToCart={addToCart} navigate={navigate} />;
}
