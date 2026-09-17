"use client";

import { AdminDashboard } from "@/views/pages/admin/Dashboard";
import { useApp } from "@/context/app-provider";

export default function AdminDashboardPage() {
  const { navigate } = useApp();
  return <AdminDashboard navigate={navigate} />;
}
