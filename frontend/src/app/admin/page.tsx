"use client";

import { AdminDashboard } from "@/views/pages/admin/Dashboard";
import { useApp } from "@/context/app-provider";

export default function AdminDashboardPage() {
  const { orders, navigate } = useApp();
  return <AdminDashboard orders={orders} navigate={navigate} />;
}
