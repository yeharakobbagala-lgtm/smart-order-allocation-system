"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { useApp } from "@/context/app-context";
import { useToast } from "@/context/toast-context";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatStatusLabel,
  orderStatusVariant,
  paymentStatusVariant,
} from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Table, Td } from "@/components/ui/table";
import { OrderTimeline } from "@/components/ui/timeline";
import { EmptyState } from "@/components/ui/states";

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  ALLOCATED: "PROCESSING",
  PROCESSING: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { orders, branches, updateOrderStatus } = useApp();

  const orderId = Number(params.id);
  const order = useMemo(
    () => orders.find((o) => o.id === orderId),
    [orders, orderId]
  );

  const branch = order
    ? branches.find((b) => b.id === order.branchId)
    : undefined;

  if (!order) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <EmptyState
          title="Order not found"
          description="This order may have been removed or the ID is invalid."
          action={
            <Link href="/admin/orders">
              <Button variant="primary">Back to orders</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const nextStatus = NEXT_STATUS[order.status];
  const canAdvance = Boolean(nextStatus) && order.status !== "CANCELLED";

  const advance = () => {
    if (!nextStatus) return;
    updateOrderStatus(order.id, nextStatus);
    toast({
      title: "Status updated",
      description: `Order is now ${formatStatusLabel(nextStatus)}.`,
      tone: "success",
    });
  };

  const alloc = order.allocation;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            All orders
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Placed {formatDateTime(order.createdAt)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant={orderStatusVariant(order.status)}>
              {formatStatusLabel(order.status)}
            </Badge>
            <Badge variant={paymentStatusVariant(order.paymentStatus)}>
              Payment: {formatStatusLabel(order.paymentStatus)}
            </Badge>
          </div>
        </div>
        {canAdvance ? (
          <Button onClick={advance}>
            Mark as {formatStatusLabel(nextStatus!)}
          </Button>
        ) : null}
      </div>

      {order.status === "CANCELLED" ? (
        <Alert variant="warning" title="Order cancelled">
          Status cannot be advanced for cancelled orders.
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Line items" />
          <CardBody className="p-0 sm:p-0">
            <Table
              headers={["Product", "Qty", "Unit price", "Subtotal"]}
              className="rounded-none border-0 border-t border-border"
            >
              {order.items.map((item) => (
                <tr key={item.productId}>
                  <Td className="font-medium">{item.productName}</Td>
                  <Td>{item.quantity}</Td>
                  <Td>{formatCurrency(item.unitPrice)}</Td>
                  <Td>{formatCurrency(item.unitPrice * item.quantity)}</Td>
                </tr>
              ))}
            </Table>
            <div className="flex justify-end border-t border-border px-5 py-4">
              <p className="text-base font-bold">
                Total: {formatCurrency(order.totalAmount)}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Fulfillment timeline" />
          <CardBody>
            <OrderTimeline status={order.status} />
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Customer & delivery" />
          <CardBody className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase text-muted">Customer</p>
              <p className="font-semibold">{order.customerName}</p>
              <p className="text-muted">{order.customerEmail}</p>
              <p className="text-muted">{order.phone}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted">Address</p>
              <p>{order.deliveryAddress}</p>
              <p className="text-xs text-muted">
                {order.latitude.toFixed(4)}, {order.longitude.toFixed(4)}
              </p>
            </div>
            {order.orderNote ? (
              <div>
                <p className="text-xs font-medium uppercase text-muted">Note</p>
                <p>{order.orderNote}</p>
              </div>
            ) : null}
            <div>
              <p className="text-xs font-medium uppercase text-muted">
                Est. delivery
              </p>
              <p>{formatDate(order.estimatedDeliveryDate)}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Branch assignment"
            description={branch?.name ?? "Unknown branch"}
          />
          <CardBody className="space-y-2 text-sm">
            <p className="text-muted">{branch?.address}</p>
            <p>
              <span className="text-muted">Payment method:</span>{" "}
              {order.paymentMethod}
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Allocation decision"
          description="How this order was assigned to a branch"
        />
        <CardBody>
          {alloc ? (
            <div className="space-y-6">
              <Alert variant="info" title="Scoring note">
                Stock availability is hard eligibility — branches must have
                enough available stock for every line item. Distance and workload
                preferences apply only among eligible branches.
              </Alert>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Metric label="Selected branch" value={branch?.name ?? "—"} />
                <Metric label="Distance" value={`${alloc.distanceKm} km`} />
                <Metric label="Workload" value={String(alloc.workload)} />
                <Metric
                  label="Eligible branches"
                  value={String(alloc.eligibleBranches)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <ScoreCard
                  label="Distance score"
                  value={alloc.distanceScore}
                  weight={`${Math.round(alloc.distanceWeight * 100)}% weight`}
                />
                <ScoreCard
                  label="Workload score"
                  value={alloc.workloadScore}
                  weight={`${Math.round(alloc.workloadWeight * 100)}% weight`}
                />
                <ScoreCard
                  label="Final score"
                  value={alloc.finalScore}
                  highlight
                />
              </div>

              <p className="text-sm text-muted">
                Weights: Distance {Math.round(alloc.distanceWeight * 100)}% ·
                Workload {Math.round(alloc.workloadWeight * 100)}%
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted">
              No allocation metadata recorded for this order.
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium uppercase text-muted">{label}</p>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ScoreCard({
  label,
  value,
  weight,
  highlight,
}: {
  label: string;
  value: number;
  weight?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-4 ${
        highlight
          ? "border-primary bg-primary-soft"
          : "border-border bg-white"
      }`}
    >
      <p className="text-xs font-medium uppercase text-muted">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {value.toFixed(highlight ? 3 : 2)}
      </p>
      {weight ? <p className="mt-1 text-xs text-muted">{weight}</p> : null}
    </div>
  );
}
