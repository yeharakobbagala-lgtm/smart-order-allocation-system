"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { OrderConfirmation } from "@/views/pages/customer/OrderConfirmation";
import { useApp } from "@/context/app-provider";

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { confirmedOrder, getOrderById, navigate } = useApp();
  const order = confirmedOrder?.id === id ? confirmedOrder : getOrderById(id);

  useEffect(() => {
    if (!order) router.replace("/orders");
  }, [order, router]);

  if (!order) return null;

  return <OrderConfirmation order={order} navigate={navigate} />;
}
