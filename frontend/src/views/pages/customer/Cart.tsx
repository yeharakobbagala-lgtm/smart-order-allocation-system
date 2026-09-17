"use client";

import React from "react";
import type { CartItem, Page } from "@/lib/types";
import {
  Button,
  Card,
  Alert,
  EmptyState,
  LoadingState,
  IconCart,
  IconX,
  IconArrowLeft,
  IconChevronRight,
} from "@/components/ui";

interface Props {
  cart: CartItem[];
  cartLoading?: boolean;
  onUpdateQty: (cartItemId: string, qty: number) => void | Promise<void>;
  onRemove: (cartItemId: string) => void | Promise<void>;
  navigate: (page: Page, id?: string) => void;
}

export const Cart: React.FC<Props> = ({
  cart,
  cartLoading,
  onUpdateQty,
  onRemove,
  navigate,
}) => {
  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  if (cartLoading && cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <LoadingState message="Loading cart…" />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <EmptyState
          icon={<IconCart size={28} />}
          title="Your cart is empty"
          description="Browse our products and add items to your cart."
          action={<Button onClick={() => navigate("products")}>Browse Products</Button>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate("products")} className="flex items-center gap-1 text-sm text-[#64748B] hover:text-[#334155] font-medium">
          <IconArrowLeft size={16} /> Continue shopping
        </button>
        <span className="text-[#E2E8F0]">/</span>
        <h1 className="font-display text-2xl font-bold text-[#0F172A]">Shopping Cart</h1>
        <span className="ml-auto text-sm text-[#64748B]">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
      </div>

      <Alert variant="warning" className="mb-6">
        <strong>Note:</strong> Adding items to your cart does not reserve stock. Your cart reflects your intent — stock availability is checked fresh when you proceed to checkout.
      </Alert>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {cart.map((item) => (
            <Card key={item.cartItemId} className="p-4">
              <div className="flex gap-4">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-20 h-20 rounded-xl object-cover bg-[#F1F5F9] shrink-0 cursor-pointer"
                  onClick={() => navigate("product-details", item.product.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-[#0F172A] text-sm leading-tight">{item.product.name}</h3>
                    </div>
                    <button onClick={() => void onRemove(item.cartItemId)} className="p-1.5 rounded-lg text-[#94A3B8] hover:bg-[#FEF2F2] hover:text-[#EF4444] transition-colors shrink-0">
                      <IconX size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                    <div className="flex items-center gap-0">
                      <button
                        onClick={() =>
                          item.quantity > 1
                            ? void onUpdateQty(item.cartItemId, item.quantity - 1)
                            : void onRemove(item.cartItemId)
                        }
                        className="w-8 h-8 flex items-center justify-center rounded-l-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#334155] hover:bg-[#F1F5F9] text-sm"
                      >
                        −
                      </button>
                      <div className="w-10 h-8 flex items-center justify-center border-t border-b border-[#E2E8F0] text-sm font-medium">
                        {item.quantity}
                      </div>
                      <button
                        onClick={() => void onUpdateQty(item.cartItemId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-r-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#334155] hover:bg-[#F1F5F9] text-sm"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#94A3B8]">${item.product.price.toFixed(2)} each</p>
                      <p className="font-display font-bold text-[#0F172A]">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="p-5 sticky top-24">
            <h2 className="font-display font-bold text-[#0F172A] mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item.cartItemId} className="flex items-start justify-between text-sm gap-2">
                  <span className="text-[#64748B] leading-tight">{item.product.name} <span className="text-[#94A3B8]">×{item.quantity}</span></span>
                  <span className="font-medium text-[#0F172A] shrink-0">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#E2E8F0] pt-4 mb-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#64748B]">Subtotal</span>
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-[#64748B]">Delivery</span>
                <span className="text-[#10B981] font-medium">Calculated at checkout</span>
              </div>
              <div className="flex justify-between font-display font-bold text-lg text-[#0F172A]">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Button size="lg" className="w-full" onClick={() => navigate("checkout")} iconRight={<IconChevronRight size={16} />}>
              Proceed to Checkout
            </Button>
            <p className="text-xs text-center text-[#94A3B8] mt-3">
              Stock is verified at the checkout step
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
