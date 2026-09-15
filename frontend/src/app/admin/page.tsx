"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ShoppingBag,
  Clock,
  Cog,
  CheckCircle2,
  Package,
  Building2,
  Users,
} from "lucide-react";
import { useApp } from "@/context/app-context";
import { useAuth } from "@/context/auth-context";
import { activityFeed } from "@/lib/mock-data";
import {
  availableStock,
  formatCurrency,
  formatDate,
  formatStatusLabel,
  orderStatusVariant,
} from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/states";
import type { OrderStatus } from "@/lib/types";

const STATUS_OVERVIEW: OrderStatus[] = [
  "ALLOCATED",
  "PROCESSING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "primary" | "success" | "warning" | "info";
}) {
  const iconBg = {
    primary: "bg-primary-soft text-primary",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    info: "bg-info-soft text-info",
  }[tone];

  return (
    <Card>
      <CardBody className="flex items-start justify-between gap-3 p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardBody>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { orders, products, branches, stocks } = useApp();
  const { users } = useAuth();

  const stats = useMemo(() => {
    const count = (status: OrderStatus) =>
      orders.filter((o) => o.status === status).length;
    return {
      total: orders.length,
      allocated: count("ALLOCATED"),
      processing: count("PROCESSING"),
      delivered: count("DELIVERED"),
      activeProducts: products.filter((p) => p.active).length,
      activeBranches: branches.filter((b) => b.active).length,
      activeUsers: users.filter((u) => u.status === "active").length,
    };
  }, [orders, products, branches, users]);

  const statusCounts = useMemo(() => {
    return STATUS_OVERVIEW.map((status) => ({
      status,
      count: orders.filter((o) => o.status === status).length,
    }));
  }, [orders]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 6),
    [orders]
  );

  const lowStock = useMemo(() => {
    const rows: {
      productId: number;
      productName: string;
      branchName: string;
      available: number;
    }[] = [];
    for (const s of stocks) {
      const avail = availableStock(s.physicalStock, s.reservedStock);
      if (avail <= 5) {
        const product = products.find((p) => p.id === s.productId);
        const branch = branches.find((b) => b.id === s.branchId);
        if (product && branch) {
          rows.push({
            productId: product.id,
            productName: product.name,
            branchName: branch.name,
            available: avail,
          });
        }
      }
    }
    return rows.sort((a, b) => a.available - b.available).slice(0, 8);
  }, [stocks, products, branches]);

  const activeBranches = branches.filter((b) => b.active);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Overview of orders, inventory, and branch workload.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Orders" value={stats.total} icon={ShoppingBag} />
        <StatCard
          label="Pending (Allocated)"
          value={stats.allocated}
          icon={Clock}
          tone="info"
        />
        <StatCard
          label="Processing"
          value={stats.processing}
          icon={Cog}
          tone="warning"
        />
        <StatCard
          label="Delivered"
          value={stats.delivered}
          icon={CheckCircle2}
          tone="success"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Products (active)"
          value={stats.activeProducts}
          icon={Package}
        />
        <StatCard
          label="Branches (active)"
          value={stats.activeBranches}
          icon={Building2}
          tone="info"
        />
        <StatCard
          label="Active Users"
          value={stats.activeUsers}
          icon={Users}
          tone="success"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent orders"
            description="Latest orders across all branches"
            action={
              <Link href="/admin/orders">
                <Button variant="outline" size="sm">
                  View all
                </Button>
              </Link>
            }
          />
          <CardBody className="p-0 sm:p-0">
            {recentOrders.length === 0 ? (
              <EmptyState title="No orders yet" />
            ) : (
              <>
                <div className="hidden md:block">
                  <Table
                    headers={[
                      "Order",
                      "Customer",
                      "Date",
                      "Total",
                      "Status",
                    ]}
                    className="rounded-none border-0 border-t border-border"
                  >
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/80">
                        <Td>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-semibold text-primary hover:underline"
                          >
                            {order.orderNumber}
                          </Link>
                        </Td>
                        <Td>{order.customerName}</Td>
                        <Td className="text-muted">
                          {formatDate(order.createdAt)}
                        </Td>
                        <Td>{formatCurrency(order.totalAmount)}</Td>
                        <Td>
                          <Badge variant={orderStatusVariant(order.status)}>
                            {formatStatusLabel(order.status)}
                          </Badge>
                        </Td>
                      </tr>
                    ))}
                  </Table>
                </div>
                <div className="space-y-3 p-4 md:hidden">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/admin/orders/${order.id}`}
                      className="block rounded-xl border border-border p-4 transition hover:border-primary/30"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-foreground">
                            {order.orderNumber}
                          </p>
                          <p className="text-sm text-muted">
                            {order.customerName}
                          </p>
                        </div>
                        <Badge variant={orderStatusVariant(order.status)}>
                          {formatStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <div className="mt-2 flex justify-between text-sm">
                        <span className="text-muted">
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Order status overview" />
          <CardBody className="space-y-3">
            {statusCounts.map(({ status, count }) => (
              <div
                key={status}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5"
              >
                <Badge variant={orderStatusVariant(status)} dot>
                  {formatStatusLabel(status)}
                </Badge>
                <span className="text-lg font-bold text-foreground">
                  {count}
                </span>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Branch workload"
            description="Current load vs capacity"
          />
          <CardBody className="space-y-4">
            {activeBranches.length === 0 ? (
              <p className="text-sm text-muted">No active branches.</p>
            ) : (
              activeBranches.map((branch) => {
                const pct = Math.min(
                  100,
                  Math.round((branch.currentWorkload / branch.capacity) * 100)
                );
                const barTone =
                  pct >= 85 ? "bg-danger" : pct >= 65 ? "bg-warning" : "bg-primary";
                return (
                  <div key={branch.id}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="font-medium text-foreground">
                        {branch.name}
                      </span>
                      <span className="text-muted">
                        {branch.currentWorkload} / {branch.capacity} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all ${barTone}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Low stock"
            description="Available quantity ≤ 5 by branch"
            action={
              <Link href="/admin/stock">
                <Button variant="outline" size="sm">
                  Manage stock
                </Button>
              </Link>
            }
          />
          <CardBody>
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted">All stock levels look healthy.</p>
            ) : (
              <ul className="divide-y divide-border">
                {lowStock.map((row) => (
                  <li
                    key={`${row.productId}-${row.branchName}`}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {row.productName}
                      </p>
                      <p className="text-xs text-muted">{row.branchName}</p>
                    </div>
                    <Badge
                      variant={row.available === 0 ? "danger" : "warning"}
                    >
                      {row.available} available
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent activity" />
        <CardBody>
          <ul className="space-y-4">
            {activityFeed.map((item) => (
              <li key={item.id} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">{item.message}</p>
                  <p className="text-xs text-muted">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
