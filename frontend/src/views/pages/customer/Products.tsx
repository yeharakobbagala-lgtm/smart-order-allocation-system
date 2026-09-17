"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Product, CartItem, Page } from "@/lib/types";
import { fetchProducts, searchProducts, ApiError } from "@/lib/api";
import { mapApiProduct } from "@/lib/mappers";
import {
  Button,
  Card,
  Badge,
  QuantitySelector,
  EmptyState,
  LoadingState,
  ErrorState,
  IconSearch,
  IconCart,
  IconPackage,
} from "@/components/ui";

interface Props {
  cart: CartItem[];
  onAddToCart: (product: Product, qty: number) => Promise<void>;
  navigate: (page: Page, id?: string) => void;
}

export const Products: React.FC<Props> = ({ cart, onAddToCart, navigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [addingId, setAddingId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchProducts();
      setProducts(data.filter((p) => p.active).map(mapApiProduct));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load products."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    const q = search.trim();
    if (q.length >= 2) {
      const timer = setTimeout(async () => {
        setLoading(true);
        setError("");
        try {
          const data = await searchProducts(q);
          setProducts(data.filter((p) => p.active).map(mapApiProduct));
        } catch (err) {
          setError(
            err instanceof ApiError ? err.message : "Search failed."
          );
        } finally {
          setLoading(false);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
    if (q.length === 0) {
      void loadAll();
    }
  }, [search, loadAll]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length >= 2) return products;
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [products, search]);

  const getQty = (id: string) => quantities[id] || 1;

  const handleAdd = async (product: Product) => {
    setAddingId(product.id);
    try {
      await onAddToCart(product, getQty(product.id));
      setAddedIds((prev) => new Set(prev).add(product.id));
      setTimeout(
        () =>
          setAddedIds((prev) => {
            const n = new Set(prev);
            n.delete(product.id);
            return n;
          }),
        2000
      );
    } catch {
      /* toast handled in provider */
    } finally {
      setAddingId(null);
    }
  };

  const cartCount = (id: string) =>
    cart.find((i) => i.product.id === id)?.quantity || 0;

  if (loading && products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <LoadingState message="Loading products…" />
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <ErrorState message={error} onRetry={() => void loadAll()} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#0F172A]">Products</h1>
          <p className="text-[#64748B] mt-1">{filtered.length} items available</p>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"><IconSearch size={16} /></span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="pl-9 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] w-72"
          />
        </div>
      </div>

      <div className="mb-6 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl px-4 py-3 flex items-start gap-2.5 text-sm text-[#92400E]">
        <svg className="w-4 h-4 mt-0.5 shrink-0 text-[#F59E0B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        <span>Adding items to cart does <strong>not</strong> reserve stock. Stock availability is checked at checkout.</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<IconPackage size={24} />}
          title="No products found"
          description="Try a different search term."
          action={
            <Button variant="secondary" onClick={() => setSearch("")}>
              Clear search
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((product) => {
            const added = addedIds.has(product.id);
            const inCart = cartCount(product.id);
            return (
              <Card key={product.id} className="flex flex-col overflow-hidden group">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-44 object-cover group-hover:scale-[1.02] transition-transform duration-300 cursor-pointer bg-[#F1F5F9]"
                    onClick={() => navigate("product-details", product.id)}
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="success">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />
                      In stock
                    </Badge>
                  </div>
                  {inCart > 0 && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-[#4F46E5] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {inCart}
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3
                    className="font-display font-bold text-[#0F172A] text-sm leading-tight mb-1.5 cursor-pointer hover:text-[#4F46E5] transition-colors line-clamp-2"
                    onClick={() => navigate("product-details", product.id)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed mb-4 line-clamp-2 flex-1">{product.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display font-bold text-xl text-[#0F172A]">${product.price.toFixed(2)}</span>
                    <QuantitySelector
                      value={getQty(product.id)}
                      onChange={(v) => setQuantities((prev) => ({ ...prev, [product.id]: v }))}
                    />
                  </div>
                  <Button
                    variant={added ? "success" : "primary"}
                    size="sm"
                    className="w-full"
                    loading={addingId === product.id}
                    onClick={() => void handleAdd(product)}
                    icon={added ? <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg> : <IconCart size={14} />}
                  >
                    {added ? "Added to cart!" : "Add to Cart"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
