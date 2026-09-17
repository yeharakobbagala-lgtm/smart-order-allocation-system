"use client";

import { useEffect } from "react";
import { MyOrders } from "@/views/pages/customer/MyOrders";
import { useApp } from "@/context/app-provider";

export default function OrdersPage() {
  const { customerOrders, navigate, refreshOrders, user, authLoading } =
    useApp();

  useEffect(() => {
    if (!authLoading && user) {
      void refreshOrders();
    }
  }, [authLoading, user, refreshOrders]);

  return <MyOrders orders={customerOrders} navigate={navigate} />;
}
