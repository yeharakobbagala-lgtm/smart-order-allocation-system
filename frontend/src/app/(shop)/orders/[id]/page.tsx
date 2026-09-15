"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { OrderDetails } from "@/views/pages/customer/OrderDetails";
import { useApp } from "@/context/app-provider";

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getOrderById, navigate } = useApp();
  const order = getOrderById(id);
  if (!order) notFound();
  return <OrderDetails order={order} navigate={navigate} />;
}
