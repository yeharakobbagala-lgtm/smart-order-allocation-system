"use client";

import { AdminUsers } from "@/views/pages/admin/Users";
import { useApp } from "@/context/app-provider";

export default function AdminUsersPage() {
  const { user } = useApp();
  if (!user) return null;
  return <AdminUsers currentUser={user} />;
}
