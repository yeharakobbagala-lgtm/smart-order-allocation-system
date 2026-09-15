"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useApp } from "@/context/app-context";
import { useAuth } from "@/context/auth-context";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState, QuantitySelector } from "@/components/ui/states";
import { SiteFooter } from "@/components/layout/site-footer";

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    cart,
    products,
    cartTotal,
    updateCartQty,
    removeFromCart,
  } = useApp();

  const lines = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      return { ...item, product, subtotal: product.price * item.quantity };
    })
    .filter(Boolean);

  return (
    <>
      <main className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="mb-2 text-2xl font-bold">Your cart</h1>
        <Alert variant="warning" className="mb-6" title="No stock reserved yet">
          Items in your cart are not reserved. Availability is verified again
          during checkout, when a 10-minute temporary reservation is created.
        </Alert>

        {lines.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            description="Browse products and add items to get started."
            action={
              <Button onClick={() => router.push("/products")}>
                Continue shopping
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="space-y-3">
              {lines.map((line) =>
                line ? (
                  <Card key={line.productId}>
                    <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={line.product.image}
                        alt={line.product.name}
                        className="h-24 w-24 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/products/${line.productId}`}
                          className="font-semibold hover:text-primary"
                        >
                          {line.product.name}
                        </Link>
                        <p className="mt-1 text-sm text-muted">
                          {formatCurrency(line.product.price)} each
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <QuantitySelector
                            value={line.quantity}
                            onChange={(q) => updateCartQty(line.productId, q)}
                          />
                          <button
                            type="button"
                            onClick={() => removeFromCart(line.productId)}
                            className="inline-flex items-center gap-1 text-sm font-medium text-danger hover:underline"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                      <p className="text-right text-base font-bold">
                        {formatCurrency(line.subtotal)}
                      </p>
                    </CardBody>
                  </Card>
                ) : null
              )}
            </div>

            <Card className="h-fit lg:sticky lg:top-24">
              <CardHeader title="Order summary" />
              <CardBody className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold">{formatCurrency(cartTotal)}</span>
                </div>
                <Button
                  fullWidth
                  onClick={() => {
                    if (!user) router.push("/login");
                    else if (user.role !== "customer") router.push("/admin");
                    else router.push("/checkout");
                  }}
                >
                  Checkout
                </Button>
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => router.push("/products")}
                >
                  Continue shopping
                </Button>
              </CardBody>
            </Card>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
