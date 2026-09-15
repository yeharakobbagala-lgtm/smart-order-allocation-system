"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { AdminOrderDetails } from "@/views/pages/admin/AdminOrderDetails";
import { useApp } from "@/context/app-provider";

export default function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getOrderById, navigate } = useApp();
  const order = getOrderById(id);
  if (!order) notFound();
  return <AdminOrderDetails order={order} navigate={navigate} />;
}
