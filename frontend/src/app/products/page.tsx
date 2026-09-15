"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useApp } from "@/context/app-context";
import { useToast } from "@/context/toast-context";
import { categories } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  EmptyState,
  ErrorState,
  QuantitySelector,
  SkeletonGrid,
} from "@/components/ui/states";
import { SiteFooter } from "@/components/layout/site-footer";

export default function ProductsPage() {
  const { products, addToCart, getProductAvailability } = useApp();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [qty, setQty] = useState<Record<number, number>>({});

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (!p.active) return false;
      const matchesCategory = category === "All" || p.category === category;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [products, category, query]);

  if (error) {
    return (
      <main className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <ErrorState
          title="Couldn't load products"
          description="A network error occurred while fetching the catalog."
          onRetry={() => {
            setError(false);
            setLoading(true);
            setTimeout(() => setLoading(false), 500);
          }}
        />
      </main>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="mt-1 text-sm text-muted">
              Stock is checked again at checkout — adding to cart does not reserve items.
            </p>
          </div>
          <button
            type="button"
            className="text-xs text-muted underline hover:text-foreground"
            onClick={() => setError(true)}
          >
            Simulate error state
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              className="pl-10"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  category === c
                    ? "bg-primary text-white"
                    : "bg-white text-muted border border-border hover:bg-slate-50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <SkeletonGrid />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No products found"
            description="Try a different search or category."
            action={
              <Button variant="outline" onClick={() => { setQuery(""); setCategory("All"); }}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => {
              const availability = getProductAvailability(product.id);
              const quantity = qty[product.id] || 1;
              const inStock = availability > 0;
              return (
                <article
                  key={product.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-[var(--shadow-sm)]"
                >
                  <Link href={`/products/${product.id}`} className="relative block aspect-square bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <Link href={`/products/${product.id}`} className="font-semibold hover:text-primary">
                        {product.name}
                      </Link>
                      <Badge variant={inStock ? "success" : "danger"} dot>
                        {inStock ? "Available" : "Out of stock"}
                      </Badge>
                    </div>
                    <p className="mb-3 line-clamp-2 text-sm text-muted">
                      {product.description}
                    </p>
                    <p className="mb-4 text-lg font-bold text-foreground">
                      {formatCurrency(product.price)}
                    </p>
                    <div className="mt-auto flex flex-wrap items-center gap-2">
                      <QuantitySelector
                        value={quantity}
                        onChange={(v) =>
                          setQty((prev) => ({ ...prev, [product.id]: v }))
                        }
                        max={Math.max(1, Math.min(99, availability || 1))}
                        disabled={!inStock}
                      />
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={!inStock}
                        onClick={() => {
                          addToCart(product.id, quantity);
                          toast({
                            title: "Added to cart",
                            description: "Stock is not reserved until checkout.",
                            tone: "success",
                          });
                        }}
                      >
                        Add to cart
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
