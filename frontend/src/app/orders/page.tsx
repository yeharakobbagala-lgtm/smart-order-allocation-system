"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RequireAuth } from "@/components/require-auth";
import { useApp } from "@/context/app-context";
import { useAuth } from "@/context/auth-context";
import {
  formatCurrency,
  formatDate,
  formatStatusLabel,
  orderStatusVariant,
  paymentStatusVariant,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/states";
import { SiteFooter } from "@/components/layout/site-footer";

const FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "ALL" },
  { label: "Allocated", value: "ALLOCATED" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Out for Delivery", value: "OUT_FOR_DELIVERY" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

function OrdersContent() {
  const { user } = useAuth();
  const { orders, branches } = useApp();
  const [filter, setFilter] = useState("ALL");

  const mine = useMemo(() => {
    return orders
      .filter((o) => o.userId === user?.id)
      .filter((o) => (filter === "ALL" ? true : o.status === filter));
  }, [orders, user?.id, filter]);

  const counts = useMemo(() => {
    const all = orders.filter((o) => o.userId === user?.id);
    return FILTERS.map((f) => ({
      ...f,
      count:
        f.value === "ALL"
          ? all.length
          : all.filter((o) => o.status === f.value).length,
    }));
  }, [orders, user?.id]);

  return (
    <>
      <main className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">My orders</h1>
          <p className="mt-1 text-sm text-muted">
            Track allocation and delivery status. Payment is Cash on Delivery.
          </p>
        </div>

        <Tabs tabs={counts} value={filter} onChange={setFilter} className="mb-6" />

        {mine.length === 0 ? (
          <EmptyState
            title="No orders here"
            description="Orders matching this filter will appear in this list."
            action={
              <Link href="/products">
                <Button>Browse products</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-3">
            {mine.map((order) => {
              const branch = branches.find((b) => b.id === order.branchId);
              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-border bg-white p-4 shadow-[var(--shadow-sm)] sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{order.orderNumber}</p>
                        <Badge variant={orderStatusVariant(order.status)}>
                          {formatStatusLabel(order.status)}
                        </Badge>
                        <Badge variant={paymentStatusVariant(order.paymentStatus)}>
                          {order.paymentStatus}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        {formatDate(order.createdAt)} · {branch?.name || "Branch"} ·{" "}
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        View details
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

export default function OrdersPage() {
  return (
    <RequireAuth role="customer">
      <OrdersContent />
    </RequireAuth>
  );
}
