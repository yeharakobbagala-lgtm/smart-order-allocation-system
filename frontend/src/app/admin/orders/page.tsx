"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useApp } from "@/context/app-context";
import {
  formatCurrency,
  formatDate,
  formatStatusLabel,
  orderStatusVariant,
  paymentStatusVariant,
} from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/states";

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "All statuses", value: "" },
  { label: "Allocated", value: "ALLOCATED" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Out for Delivery", value: "OUT_FOR_DELIVERY" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function AdminOrdersPage() {
  const { orders, branches } = useApp();
  const [status, setStatus] = useState("");
  const [branchId, setBranchId] = useState("");
  const [dateQuery, setDateQuery] = useState("");
  const [search, setSearch] = useState("");

  const branchOptions = useMemo(
    () => [
      { label: "All branches", value: "" },
      ...branches.map((b) => ({ label: b.name, value: String(b.id) })),
    ],
    [branches]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const dateQ = dateQuery.trim();
    return [...orders]
      .filter((o) => {
        if (status && o.status !== status) return false;
        if (branchId && String(o.branchId) !== branchId) return false;
        if (dateQ) {
          const created = formatDate(o.createdAt).toLowerCase();
          const iso = o.createdAt.slice(0, 10);
          if (!created.includes(dateQ.toLowerCase()) && !iso.includes(dateQ)) {
            return false;
          }
        }
        if (q) {
          const branchName =
            branches.find((b) => b.id === o.branchId)?.name.toLowerCase() ||
            "";
          const haystack = [
            o.orderNumber,
            o.customerName,
            o.customerEmail,
            branchName,
          ]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [orders, branches, status, branchId, dateQuery, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="mt-1 text-sm text-muted">
          Search and filter orders across branches.
        </p>
      </div>

      <Card>
        <CardBody className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={STATUS_OPTIONS}
          />
          <Select
            label="Branch"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            options={branchOptions}
          />
          <Input
            label="Date search"
            placeholder="e.g. 16 Sep 2026 or 2026-09"
            value={dateQuery}
            onChange={(e) => setDateQuery(e.target.value)}
          />
          <Input
            label="Search"
            placeholder="Order ID, customer, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            rightElement={<Search className="h-4 w-4 text-muted" />}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Order list"
          description={`${filtered.length} order${filtered.length === 1 ? "" : "s"}`}
        />
        <CardBody className="p-0 sm:p-0">
          {filtered.length === 0 ? (
            <EmptyState
              title="No matching orders"
              description="Try adjusting your filters or search terms."
            />
          ) : (
            <>
              <div className="hidden lg:block">
                <Table
                  headers={[
                    "Order ID",
                    "Customer",
                    "Date",
                    "Branch",
                    "Total",
                    "Order status",
                    "Payment",
                    "Actions",
                  ]}
                  className="rounded-none border-0 border-t border-border"
                >
                  {filtered.map((order) => {
                    const branch = branches.find((b) => b.id === order.branchId);
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80">
                        <Td>
                          <span className="font-semibold text-foreground">
                            {order.orderNumber}
                          </span>
                        </Td>
                        <Td>
                          <div>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-xs text-muted">
                              {order.customerEmail}
                            </p>
                          </div>
                        </Td>
                        <Td className="text-muted">
                          {formatDate(order.createdAt)}
                        </Td>
                        <Td>{branch?.name ?? "—"}</Td>
                        <Td>{formatCurrency(order.totalAmount)}</Td>
                        <Td>
                          <Badge variant={orderStatusVariant(order.status)}>
                            {formatStatusLabel(order.status)}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge
                            variant={paymentStatusVariant(order.paymentStatus)}
                          >
                            {formatStatusLabel(order.paymentStatus)}
                          </Badge>
                        </Td>
                        <Td>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                        </Td>
                      </tr>
                    );
                  })}
                </Table>
              </div>

              <div className="space-y-3 p-4 lg:hidden">
                {filtered.map((order) => {
                  const branch = branches.find((b) => b.id === order.branchId);
                  return (
                    <div
                      key={order.id}
                      className="rounded-xl border border-border p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{order.orderNumber}</p>
                          <p className="text-sm text-muted">
                            {order.customerName}
                          </p>
                        </div>
                        <Badge variant={orderStatusVariant(order.status)}>
                          {formatStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <dt className="text-xs text-muted">Date</dt>
                          <dd>{formatDate(order.createdAt)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted">Branch</dt>
                          <dd>{branch?.name ?? "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted">Total</dt>
                          <dd className="font-semibold">
                            {formatCurrency(order.totalAmount)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted">Payment</dt>
                          <dd>
                            <Badge
                              variant={paymentStatusVariant(order.paymentStatus)}
                            >
                              {formatStatusLabel(order.paymentStatus)}
                            </Badge>
                          </dd>
                        </div>
                      </dl>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="mt-4 block"
                      >
                        <Button variant="outline" size="sm" fullWidth>
                          View
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
