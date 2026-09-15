import React, { useState } from "react";
import type { CartItem, Page } from "../../types";
import type { DeliveryForm } from "./Checkout";
import { Button, Card, Alert, Divider, IconMapPin, IconBranch, IconCheck, IconArrowLeft } from "../../components/ui";

interface Props {
  cart: CartItem[];
  deliveryForm: DeliveryForm;
  branchName: string;
  estimatedDelivery: string;
  total: number;
  onConfirm: () => void;
  navigate: (page: Page) => void;
}

export const PlaceOrder: React.FC<Props> = ({ cart, deliveryForm, branchName, estimatedDelivery, total, onConfirm, navigate }) => {
  const [loading, setLoading] = useState(false);

  const handlePlace = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    onConfirm();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate("reservation")} className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#334155] mb-6 font-medium">
        <IconArrowLeft size={16} /> Back
      </button>

      <h1 className="font-display text-3xl font-bold text-[#0F172A] mb-2">Review your order</h1>
      <p className="text-[#64748B] mb-8">Please review all details before placing your order.</p>

      <div className="space-y-5">
        {/* Customer Info */}
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
            <div className="w-7 h-7 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
              <svg width="14" height="14" fill="none" stroke="#4F46E5" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </div>
            Customer Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div><span className="text-[#94A3B8]">Name</span><p className="font-medium text-[#0F172A] mt-0.5">{deliveryForm.name}</p></div>
            <div><span className="text-[#94A3B8]">Phone</span><p className="font-medium text-[#0F172A] mt-0.5">{deliveryForm.phone}</p></div>
          </div>
        </Card>

        {/* Delivery */}
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
            <div className="w-7 h-7 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
              <IconMapPin size={14} className="text-[#4F46E5]" />
            </div>
            Delivery Address
          </h2>
          <p className="text-sm text-[#0F172A] font-medium">{deliveryForm.address}</p>
          <p className="text-sm text-[#64748B]">{deliveryForm.city}</p>
          {deliveryForm.note && (
            <div className="mt-2 bg-[#F8FAFC] rounded-lg p-2.5 text-xs text-[#64748B] border border-[#E2E8F0]">
              Note: {deliveryForm.note}
            </div>
          )}
        </Card>

        {/* Branch */}
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
            <div className="w-7 h-7 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
              <IconBranch size={14} className="text-[#4F46E5]" />
            </div>
            Fulfillment Branch
          </h2>
          <div className="flex items-start gap-4">
            <div className="flex-1 grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div><span className="text-[#94A3B8]">Branch</span><p className="font-medium text-[#0F172A] mt-0.5">{branchName}</p></div>
              <div><span className="text-[#94A3B8]">Est. Delivery</span><p className="font-medium text-[#10B981] mt-0.5">{estimatedDelivery}</p></div>
            </div>
          </div>
          <div className="mt-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl px-3 py-2 text-xs text-[#065F46] flex items-center gap-1.5">
            <IconCheck size={12} />
            Stock reserved — automatically allocated by SmartOrder
          </div>
        </Card>

        {/* Products */}
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0]">
            <h2 className="font-display font-semibold text-[#0F172A]">Order Items</h2>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {cart.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3 px-5 py-3">
                <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-xl object-cover bg-[#F1F5F9] shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#0F172A]">{item.product.name}</p>
                  <p className="text-xs text-[#94A3B8]">Qty: {item.quantity} × ${item.product.price.toFixed(2)}</p>
                </div>
                <p className="font-bold text-[#0F172A]">${(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-between items-center">
            <span className="font-display font-bold text-[#0F172A]">Order Total</span>
            <span className="font-display font-bold text-2xl text-[#4F46E5]">${total.toFixed(2)}</span>
          </div>
        </Card>

        {/* Payment */}
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[#0F172A] mb-3">Payment Method</h2>
          <div className="flex items-center gap-3 bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
            <div className="w-9 h-9 bg-white rounded-lg border border-[#E2E8F0] flex items-center justify-center">
              <svg width="18" height="18" fill="none" stroke="#334155" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
            </div>
            <div>
              <p className="font-medium text-[#0F172A] text-sm">Cash on Delivery</p>
              <p className="text-xs text-[#94A3B8]">Pay when your order arrives at your door</p>
            </div>
          </div>
        </Card>

        <Button size="lg" className="w-full" loading={loading} onClick={handlePlace}>
          Place Order — ${total.toFixed(2)}
        </Button>

        <p className="text-center text-xs text-[#94A3B8]">
          By placing your order you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};
