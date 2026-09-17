"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { CartItem, Page, Product } from "@/lib/types";
import { fetchProduct, fetchProducts, ApiError } from "@/lib/api";
import { mapApiProduct } from "@/lib/mappers";
import {
  Button,
  Badge,
  Card,
  QuantitySelector,
  LoadingState,
  ErrorState,
  IconCart,
  IconArrowLeft,
  IconStar,
  IconCheck,
} from "@/components/ui";

interface Props {
  productId: string;
  cart: CartItem[];
  onAddToCart: (product: Product, qty: number) => Promise<void>;
  navigate: (page: Page, id?: string) => void;
}

export const ProductDetails: React.FC<Props> = ({
  productId,
  cart,
  onAddToCart,
  navigate,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const id = Number(productId);
      if (!Number.isFinite(id)) {
        setProduct(null);
        return;
      }
      const [apiProduct, all] = await Promise.all([
        fetchProduct(id),
        fetchProducts().catch(() => []),
      ]);
      const mapped = mapApiProduct(apiProduct);
      setProduct(mapped);
      setRelated(
        all
          .filter((p) => p.id !== id && p.active)
          .slice(0, 3)
          .map(mapApiProduct)
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load product."
      );
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <LoadingState message="Loading product…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <ErrorState message={error} onRetry={() => void load()} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-[#64748B]">Product not found.</p>
        <Button className="mt-4" onClick={() => navigate("products")}>
          Back to Products
        </Button>
      </div>
    );
  }

  const handleAdd = async () => {
    setAdding(true);
    try {
      await onAddToCart(product, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch {
      /* toast in provider */
    } finally {
      setAdding(false);
    }
  };

  const inCart = cart.find((i) => i.product.id === product.id)?.quantity || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate("products")} className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#334155] mb-6 font-medium">
        <IconArrowLeft size={16} />
        Back to Products
      </button>

      <div className="grid lg:grid-cols-2 gap-10 mb-16">
        <div className="relative">
          <div className="aspect-square bg-[#F8FAFC] rounded-3xl overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="muted">{product.category}</Badge>
            <Badge variant="success">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />
              In stock
            </Badge>
          </div>

          <h1 className="font-display text-3xl font-bold text-[#0F172A] mb-3">{product.name}</h1>

          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <IconStar key={s} size={16} />
            ))}
            <span className="text-sm text-[#64748B] ml-1">4.8 (128 reviews)</span>
          </div>

          <p className="font-display text-4xl font-bold text-[#0F172A] mb-6">${product.price.toFixed(2)}</p>

          <p className="text-[#475569] leading-relaxed mb-8">{product.description}</p>

          <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-5 mb-6">
            <p className="text-sm font-medium text-[#334155] mb-3">Select quantity</p>
            <div className="flex items-center gap-4">
              <QuantitySelector value={qty} onChange={setQty} max={20} />
              <span className="text-sm text-[#64748B]">
                {inCart > 0 && (
                  <span className="text-[#4F46E5] font-medium">{inCart} already in cart</span>
                )}
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-3 flex items-center gap-1">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              Stock is confirmed at checkout, not at this stage.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              size="lg"
              variant={added ? "success" : "primary"}
              className="flex-1"
              loading={adding}
              onClick={() => void handleAdd()}
              icon={added ? <IconCheck size={18} /> : <IconCart size={18} />}
            >
              {added ? "Added to Cart!" : "Add to Cart"}
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("cart")}>
              View Cart {inCart > 0 && `(${inCart})`}
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            {[["Free returns", "30-day policy"], ["Secure checkout", "256-bit SSL"], ["Fast dispatch", "Same day cutoff 3pm"]].map(([t, d]) => (
              <div key={t} className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
                <p className="text-xs font-semibold text-[#334155]">{t}</p>
                <p className="text-xs text-[#94A3B8] mt-0.5">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div>
          <h2 className="font-display text-2xl font-bold text-[#0F172A] mb-6">Related products</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {related.map((p) => (
              <Card key={p.id} className="flex gap-4 p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("product-details", p.id)}>
                <img src={p.image} alt={p.name} className="w-16 h-16 rounded-xl object-cover bg-[#F1F5F9] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-[#0F172A] text-sm leading-tight truncate">{p.name}</p>
                  <p className="font-bold text-[#4F46E5] mt-1 text-sm">${p.price.toFixed(2)}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
