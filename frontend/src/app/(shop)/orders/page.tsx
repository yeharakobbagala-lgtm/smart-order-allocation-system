"use client";

import { MyOrders } from "@/views/pages/customer/MyOrders";
import { useApp } from "@/context/app-provider";

export default function OrdersPage() {
  const { customerOrders, navigate } = useApp();
  return <MyOrders orders={customerOrders} navigate={navigate} />;
}
