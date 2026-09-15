"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useApp } from "@/context/app-context";
import { useToast } from "@/context/toast-context";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { QuantitySelector, EmptyState } from "@/components/ui/states";
import { SiteFooter } from "@/components/layout/site-footer";

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { products, addToCart, getProductAvailability } = useApp();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const product = useMemo(
    () => products.find((p) => p.id === Number(params.id) && p.active),
    [products, params.id]
  );

  const related = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.active && p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [products, product]);

  if (!product) {
    return (
      <main className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <EmptyState
          title="Product not found"
          description="This product may be inactive or unavailable."
          action={
            <Button onClick={() => router.push("/products")}>Back to products</Button>
          }
        />
      </main>
    );
  }

  const availability = getProductAvailability(product.id);
  const inStock = availability > 0;

  return (
    <>
      <main className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-border bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          </div>

          <div>
            <Badge variant="neutral">{product.category}</Badge>
            <h1 className="mt-3 text-3xl font-bold">{product.name}</h1>
            <p className="mt-3 text-muted">{product.description}</p>
            <p className="mt-5 text-3xl font-extrabold text-foreground">
              {formatCurrency(product.price)}
            </p>

            <div className="mt-4">
              <Badge variant={inStock ? "success" : "danger"} dot>
                {inStock
                  ? `${availability} available across branches`
                  : "Out of stock"}
              </Badge>
            </div>

            <Alert variant="info" className="mt-5" title="About stock">
              Adding to cart does not reserve inventory. A fresh stock check and
              temporary reservation happen during checkout.
            </Alert>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                max={Math.max(1, Math.min(99, availability || 1))}
                disabled={!inStock}
              />
              <Button
                size="lg"
                disabled={!inStock}
                onClick={() => {
                  addToCart(product.id, quantity);
                  toast({
                    title: "Added to cart",
                    description: "Proceed to cart when you're ready.",
                    tone: "success",
                  });
                }}
              >
                Add to cart
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push("/cart")}>
                View cart
              </Button>
            </div>
          </div>
        </div>

        {related.length > 0 ? (
          <section className="mt-14">
            <h2 className="mb-4 text-xl font-bold">Related products</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.id}`}
                  className="overflow-hidden rounded-2xl border border-border bg-white shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} className="aspect-square w-full object-cover" />
                  <div className="p-3">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted">{formatCurrency(item.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
