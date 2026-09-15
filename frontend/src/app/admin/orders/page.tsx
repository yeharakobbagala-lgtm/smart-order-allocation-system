"use client";

import { AdminOrders } from "@/views/pages/admin/Orders";
import { useApp } from "@/context/app-provider";

export default function AdminOrdersPage() {
  const { orders, navigate } = useApp();
  return <AdminOrders orders={orders} navigate={navigate} />;
}
