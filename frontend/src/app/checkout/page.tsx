"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Timer } from "lucide-react";
import { RequireAuth } from "@/components/require-auth";
import { useApp } from "@/context/app-context";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/states";

function CheckoutContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    cart,
    products,
    cartTotal,
    branches,
    checkoutPhase,
    reservation,
    allocatedBranchId,
    deliveryInfo,
    startCheckoutAllocation,
    expireReservation,
    placeOrder,
    resetCheckout,
    setCheckoutPhase,
  } = useApp();

  const [customerName, setCustomerName] = useState(user?.name || "");
  const [phone, setPhone] = useState("+94 77 123 4567");
  const [address, setAddress] = useState("27 Flower Road, Colombo 07");
  const [latitude, setLatitude] = useState("6.9022");
  const [longitude, setLongitude] = useState("79.8607");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [allocError, setAllocError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(600);

  const selectedBranch = useMemo(
    () => branches.find((b) => b.id === allocatedBranchId),
    [branches, allocatedBranchId]
  );

  const lines = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product
        ? { ...item, product, subtotal: product.price * item.quantity }
        : null;
    })
    .filter(Boolean);

  useEffect(() => {
    if (cart.length === 0 && checkoutPhase !== "done") {
      router.replace("/cart");
    }
  }, [cart.length, checkoutPhase, router]);

  useEffect(() => {
    if (checkoutPhase !== "reserved" || !reservation) return;
    const tick = () => {
      const left = Math.max(
        0,
        Math.floor((new Date(reservation.expiresAt).getTime() - Date.now()) / 1000)
      );
      setSecondsLeft(left);
      if (left <= 0) {
        expireReservation().catch((err: Error) => {
          setAllocError(err.message);
          toast({ title: "Reservation failed", description: err.message, tone: "error" });
        });
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [checkoutPhase, reservation, expireReservation, toast]);

  async function onFindBranch(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!customerName.trim()) next.customerName = "Name is required.";
    if (!phone.trim()) next.phone = "Phone is required.";
    if (!address.trim()) next.address = "Address is required.";
    if (!latitude || Number.isNaN(Number(latitude)))
      next.latitude = "Valid latitude required.";
    if (!longitude || Number.isNaN(Number(longitude)))
      next.longitude = "Valid longitude required.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setAllocError("");
    try {
      await startCheckoutAllocation({
        customerName: customerName.trim(),
        phone: phone.trim(),
        deliveryAddress: address.trim(),
        latitude: Number(latitude),
        longitude: Number(longitude),
        orderNote: note.trim(),
      });
      toast({
        title: "Branch allocated",
        description: "Your items are temporarily reserved for 10 minutes.",
        tone: "success",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Allocation failed.";
      setAllocError(message);
      toast({ title: "Allocation failed", description: message, tone: "error" });
    }
  }

  async function onPlaceOrder() {
    if (!user) return;
    const order = await placeOrder(user.id, user.email);
    if (!order) {
      toast({ title: "Could not place order", tone: "error" });
      return;
    }
    toast({ title: "Order placed", description: order.orderNumber, tone: "success" });
    router.push(`/orders/${order.id}/confirmation`);
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  if (checkoutPhase === "allocating") {
    return (
      <main className="mx-auto max-w-xl flex-1 px-4 py-16 text-center">
        <LoadingSpinner label="Finding the best branch..." />
        <p className="mt-2 text-sm text-muted">
          Checking stock, distance, and branch workload
        </p>
      </main>
    );
  }

  if (checkoutPhase === "expired" || checkoutPhase === "rechecking") {
    return (
      <main className="mx-auto max-w-xl flex-1 px-4 py-16">
        <Card>
          <CardBody className="space-y-4 text-center">
            {checkoutPhase === "expired" ? (
              <Alert variant="warning" title="Your reservation has expired.">
                We&apos;re checking availability again — you don&apos;t need to restart checkout.
              </Alert>
            ) : (
              <Alert variant="info" title="We're checking availability again.">
                Re-checking the same branch first, then other eligible branches if needed.
              </Alert>
            )}
            <LoadingSpinner label="Refreshing allocation..." />
          </CardBody>
        </Card>
      </main>
    );
  }

  if (checkoutPhase === "reserved" || checkoutPhase === "review" || checkoutPhase === "placing") {
    return (
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6 rounded-2xl border border-indigo-100 bg-primary-soft p-5 text-center">
          <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <Timer className="h-4 w-4" />
            Your items are temporarily reserved
          </div>
          <p className="text-4xl font-extrabold tabular-nums text-foreground">
            {mm}:{ss}
          </p>
          <p className="mt-2 text-sm text-muted">
            Reservation expires at{" "}
            {reservation ? formatDateTime(reservation.expiresAt) : "—"}. Complete
            your order before time runs out.
          </p>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader title="Allocation result" description="Best available branch selected automatically." />
            <CardBody className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted">Selected branch</span>
                <span className="font-semibold">{selectedBranch?.name}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted">Address</span>
                <span className="text-right">{selectedBranch?.address}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted">Status</span>
                <Badge variant="success" dot>
                  Branch allocated successfully
                </Badge>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted">Est. delivery</span>
                <span className="font-medium">
                  {formatDateTime(new Date(Date.now() + 2 * 86400000).toISOString())}
                </span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Reserved products" />
            <CardBody className="space-y-3">
              {lines.map((line) =>
                line ? (
                  <div key={line.productId} className="flex justify-between gap-3 text-sm">
                    <span>
                      {line.product.name} × {line.quantity}
                    </span>
                    <span className="font-semibold">{formatCurrency(line.subtotal)}</span>
                  </div>
                ) : null
              )}
              <div className="flex justify-between border-t border-border pt-3 font-bold">
                <span>Total</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
            </CardBody>
          </Card>

          {checkoutPhase === "review" || checkoutPhase === "placing" ? (
            <Card>
              <CardHeader title="Final review" description="Cash on Delivery" />
              <CardBody className="space-y-3 text-sm">
                <p><span className="text-muted">Customer:</span> {deliveryInfo?.customerName}</p>
                <p><span className="text-muted">Phone:</span> {deliveryInfo?.phone}</p>
                <p><span className="text-muted">Address:</span> {deliveryInfo?.deliveryAddress}</p>
                <p><span className="text-muted">Branch:</span> {selectedBranch?.name}</p>
                <p><span className="text-muted">Payment:</span> Cash on Delivery · PENDING</p>
                <p><span className="text-muted">Reservation:</span> Active</p>
                <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                  <Button
                    fullWidth
                    loading={checkoutPhase === "placing"}
                    onClick={onPlaceOrder}
                  >
                    Place Order
                  </Button>
                  <Button fullWidth variant="outline" onClick={() => setCheckoutPhase("reserved")}>
                    Back
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button fullWidth onClick={() => setCheckoutPhase("review")}>
                Continue to place order
              </Button>
              <Button
                fullWidth
                variant="outline"
                onClick={() => {
                  resetCheckout();
                  toast({ title: "Reservation released", tone: "info" });
                }}
              >
                Cancel reservation
              </Button>
              <Button
                fullWidth
                variant="ghost"
                onClick={() => {
                  // Prototype helper to demo expiry quickly
                  if (reservation) {
                    expireReservation().catch((err: Error) => {
                      setAllocError(err.message);
                    });
                  }
                }}
              >
                Simulate expiry
              </Button>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold">Checkout</h1>
      <p className="mb-6 text-sm text-muted">
        Enter delivery details. We&apos;ll find the best branch and reserve stock for 10 minutes.
      </p>

      {allocError ? (
        <Alert variant="danger" className="mb-4" title="Allocation error">
          {allocError}
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader
            title="Delivery information"
            description="Used to score nearby eligible branches"
          />
          <CardBody>
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={onFindBranch}>
              <Input
                label="Customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                error={errors.customerName}
              />
              <Input
                label="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Delivery address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  error={errors.address}
                />
              </div>
              <Input
                label="Latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                error={errors.latitude}
                hint="Prototype: enter coordinates or keep demo values"
              />
              <Input
                label="Longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                error={errors.longitude}
              />
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Order note
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Optional delivery instructions"
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" fullWidth>
                  <MapPin className="h-4 w-4" />
                  Check stock & allocate branch
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card className="h-fit">
          <CardHeader title="Order summary" />
          <CardBody className="space-y-3">
            {lines.map((line) =>
              line ? (
                <div key={line.productId} className="flex justify-between gap-3 text-sm">
                  <span className="text-muted">
                    {line.product.name} × {line.quantity}
                  </span>
                  <span className="font-medium">{formatCurrency(line.subtotal)}</span>
                </div>
              ) : null
            )}
            <div className="flex justify-between border-t border-border pt-3 font-bold">
              <span>Total</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <Alert variant="info">
              Allocation status will appear after stock check.
            </Alert>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <RequireAuth role="customer">
      <CheckoutContent />
    </RequireAuth>
  );
}
