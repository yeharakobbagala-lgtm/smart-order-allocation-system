"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import { RequireAuth } from "@/components/require-auth";
import { useApp } from "@/context/app-context";
import { useAuth } from "@/context/auth-context";
import {
  formatCurrency,
  formatDateTime,
  formatStatusLabel,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";

function ConfirmationContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { orders, branches } = useApp();

  const order = useMemo(
    () =>
      orders.find(
        (o) => o.id === Number(params.id) && o.userId === user?.id
      ),
    [orders, params.id, user?.id]
  );

  if (!order) {
    return (
      <main className="mx-auto max-w-lg flex-1 px-4 py-12">
        <EmptyState
          title="Confirmation not found"
          action={
            <Button onClick={() => router.push("/orders")}>My orders</Button>
          }
        />
      </main>
    );
  }

  const branch = branches.find((b) => b.id === order.branchId);

  return (
    <main className="mx-auto max-w-lg flex-1 px-4 py-12">
      <Card className="overflow-hidden">
        <div className="bg-success-soft px-6 py-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white text-success shadow-sm">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-green-900">Order confirmed</h1>
          <p className="mt-1 text-sm text-green-800">
            Your order was placed successfully and allocated to a branch.
          </p>
        </div>
        <CardBody className="space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-muted">Order number</span>
            <span className="font-semibold">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted">Branch</span>
            <span className="font-semibold">{branch?.name}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted">Est. delivery</span>
            <span className="font-semibold">
              {formatDateTime(order.estimatedDeliveryDate)}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted">Total</span>
            <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted">Payment</span>
            <span>Cash on Delivery</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted">Status</span>
            <Badge variant="info">{formatStatusLabel(order.status)}</Badge>
          </div>

          <div className="flex flex-col gap-2 pt-4 sm:flex-row">
            <Link href={`/orders/${order.id}`} className="flex-1">
              <Button fullWidth>View order</Button>
            </Link>
            <Link href="/products" className="flex-1">
              <Button fullWidth variant="outline">
                Continue shopping
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </main>
  );
}

export default function OrderConfirmationPage() {
  return (
    <RequireAuth role="customer">
      <ConfirmationContent />
    </RequireAuth>
  );
}
