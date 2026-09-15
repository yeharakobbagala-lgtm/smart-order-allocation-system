"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { RequireAuth } from "@/components/require-auth";
import { useApp } from "@/context/app-context";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import {
  canCancelOrder,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatStatusLabel,
  orderStatusVariant,
  paymentStatusVariant,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { OrderTimeline } from "@/components/ui/timeline";
import { EmptyState } from "@/components/ui/states";
import { SiteFooter } from "@/components/layout/site-footer";

function OrderDetailsContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { orders, branches, cancelOrder } = useApp();
  const [open, setOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const order = useMemo(
    () =>
      orders.find(
        (o) => o.id === Number(params.id) && o.userId === user?.id
      ),
    [orders, params.id, user?.id]
  );

  const branch = branches.find((b) => b.id === order?.branchId);

  if (!order) {
    return (
      <main className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <EmptyState
          title="Order not found"
          description="This order doesn't exist or belongs to another account."
          action={
            <Button onClick={() => router.push("/orders")}>Back to orders</Button>
          }
        />
      </main>
    );
  }

  async function onConfirmCancel() {
    setCancelling(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = cancelOrder(order!.id);
    setCancelling(false);
    setOpen(false);
    if (!result.ok) {
      toast({ title: "Cancellation failed", description: result.error, tone: "error" });
      return;
    }
    toast({ title: "Order cancelled", tone: "success" });
  }

  return (
    <>
      <main className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-muted">Order tracking</p>
            <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
            <p className="mt-1 text-sm text-muted">
              Placed {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={orderStatusVariant(order.status)}>
              {formatStatusLabel(order.status)}
            </Badge>
            <Badge variant={paymentStatusVariant(order.paymentStatus)}>
              Payment {order.paymentStatus}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <Card>
              <CardHeader title="Products" />
              <CardBody className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between gap-3 text-sm"
                  >
                    <span>
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-border pt-3 font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Delivery" />
              <CardBody className="space-y-2 text-sm">
                <p><span className="text-muted">Name:</span> {order.customerName}</p>
                <p><span className="text-muted">Phone:</span> {order.phone}</p>
                <p><span className="text-muted">Address:</span> {order.deliveryAddress}</p>
                <p><span className="text-muted">Branch:</span> {branch?.name}</p>
                <p>
                  <span className="text-muted">Est. delivery:</span>{" "}
                  {formatDateTime(order.estimatedDeliveryDate)}
                </p>
                <p><span className="text-muted">Payment:</span> Cash on Delivery</p>
              </CardBody>
            </Card>

            {canCancelOrder(order.status) ? (
              <Alert variant="warning" title="Cancellation available">
                You can cancel while the order is Allocated or Processing.
                <div className="mt-3">
                  <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
                    Cancel order
                  </Button>
                </div>
              </Alert>
            ) : order.status !== "CANCELLED" ? (
              <Alert variant="info">
                This order can no longer be cancelled from the customer portal.
              </Alert>
            ) : null}
          </div>

          <Card className="h-fit">
            <CardHeader title="Status timeline" description="View only — status is managed by the system" />
            <CardBody>
              <OrderTimeline status={order.status} />
            </CardBody>
          </Card>
        </div>

        <div className="mt-6">
          <Link href="/orders">
            <Button variant="outline">Back to my orders</Button>
          </Link>
        </div>
      </main>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Cancel this order?"
        description="Reserved stock will be released. This cannot be undone."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Keep order
            </Button>
            <Button variant="danger" loading={cancelling} onClick={onConfirmCancel}>
              Confirm cancellation
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Order <strong>{order.orderNumber}</strong> will move to Cancelled status.
        </p>
      </Modal>

      <SiteFooter />
    </>
  );
}

export default function OrderDetailsPage() {
  return (
    <RequireAuth role="customer">
      <OrderDetailsContent />
    </RequireAuth>
  );
}
