"use client";

import React, { useState } from "react";
import type { CartItem, Page } from "@/lib/types";
import { formatCurrency } from "@/lib/currency";
import { BranchLocationPicker } from "@/components/BranchLocationPicker";
import {
  Button,
  Card,
  Input,
  Textarea,
  AllocationWidget,
  Divider,
  Alert,
  IconMapPin,
  IconArrowLeft,
  IconChevronRight,
} from "@/components/ui";

export interface DeliveryForm {
  name: string;
  phone: string;
  address: string;
  city: string;
  lat: string;
  lng: string;
  note: string;
}

interface Props {
  cart: CartItem[];
  user: { name: string; email: string } | null;
  onSubmitOrder: (form: DeliveryForm) => Promise<void>;
  navigate: (page: Page) => void;
  submitting?: boolean;
}

export const Checkout: React.FC<Props> = ({
  cart,
  user,
  onSubmitOrder,
  navigate,
  submitting = false,
}) => {
  const [form, setForm] = useState<DeliveryForm>({
    name: user?.name || "",
    phone: "",
    address: "",
    city: "",
    lat: "",
    lng: "",
    note: "",
  });
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [errors, setErrors] = useState<Partial<DeliveryForm & { location: string }>>({});
  const [submitError, setSubmitError] = useState("");

  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const validate = () => {
    const e: Partial<DeliveryForm & { location: string }> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.address.trim()) e.address = "Enter a delivery address or pick a location on the map.";
    if (latitude == null || longitude == null) {
      e.location = "Select a delivery location on the map.";
    }
    return e;
  };

  const handlePlaceOrder = async () => {
    setSubmitError("");
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    const payload: DeliveryForm = {
      ...form,
      lat: String(latitude),
      lng: String(longitude),
    };
    try {
      await onSubmitOrder(payload);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not place order.";
      setSubmitError(message);
    }
  };

  const field = (key: keyof DeliveryForm, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-[#64748B] mb-4">Your cart is empty.</p>
        <Button onClick={() => navigate("products")}>Browse Products</Button>
      </div>
    );
  }

  const allocationState = submitting
    ? "loading"
    : submitError &&
        (submitError.toLowerCase().includes("no branch") ||
          submitError.toLowerCase().includes("fulfill"))
      ? "error"
      : "idle";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate("cart")} className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#334155] mb-6 font-medium">
        <IconArrowLeft size={16} /> Back to Cart
      </button>

      <h1 className="font-display text-3xl font-bold text-[#0F172A] mb-8">Checkout</h1>

      <div className="flex items-center gap-2 mb-8">
        {["Delivery", "Allocation", "Confirm"].map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 text-sm font-medium ${i === 0 ? "text-[#4F46E5]" : "text-[#94A3B8]"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "border-2 border-[#4F46E5] text-[#4F46E5]" : "border-2 border-[#E2E8F0] text-[#94A3B8]"}`}>
                {i + 1}
              </div>
              <span className="hidden sm:inline">{s}</span>
            </div>
            {i < 2 && <div className="flex-1 h-0.5 bg-[#E2E8F0]" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="font-display font-bold text-[#0F172A] mb-5 flex items-center gap-2">
              <IconMapPin size={18} className="text-[#4F46E5]" />
              Delivery Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Full name" value={form.name} onChange={(e) => field("name", e.target.value)} error={errors.name} placeholder="Sarah Chen" />
              <Input label="Phone number" value={form.phone} onChange={(e) => field("phone", e.target.value)} error={errors.phone} placeholder="+94 77 123 4567" type="tel" />
              <div className="sm:col-span-2">
                <Input label="City / State / ZIP (optional)" value={form.city} onChange={(e) => field("city", e.target.value)} placeholder="Colombo" />
              </div>
              <div className="sm:col-span-2">
                <BranchLocationPicker
                  address={form.address}
                  onAddressChange={(address) => field("address", address)}
                  latitude={latitude}
                  longitude={longitude}
                  onCoordinatesChange={(lat, lng) => {
                    setLatitude(lat);
                    setLongitude(lng);
                    setForm((f) => ({ ...f, lat: String(lat), lng: String(lng) }));
                    setErrors((e) => ({ ...e, location: undefined }));
                  }}
                  disabled={submitting}
                />
                {errors.address && (
                  <p className="text-xs text-[#EF4444] mt-1">{errors.address}</p>
                )}
                {errors.location && (
                  <p className="text-xs text-[#EF4444] mt-1">{errors.location}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <Textarea label="Order note (optional)" value={form.note} onChange={(e) => field("note", e.target.value)} placeholder="E.g. Leave at the door, ring buzzer 4B..." />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-display font-bold text-[#0F172A] mb-2">Branch Allocation</h2>
            <p className="text-sm text-[#64748B] mb-5">
              We&apos;ll find the best branch, reserve stock for 10 minutes, then
              show you a preview before you confirm the order.
            </p>
            <AllocationWidget state={allocationState} />
            {submitError && allocationState !== "error" && (
              <Alert variant="danger" className="mt-4">
                {submitError}
              </Alert>
            )}
            <Button
              size="lg"
              loading={submitting}
              onClick={() => void handlePlaceOrder()}
              className="w-full mt-4"
              iconRight={<IconChevronRight size={16} />}
            >
              Allocate &amp; Reserve
            </Button>
          </Card>
        </div>

        <div>
          <Card className="p-5 sticky top-24">
            <h2 className="font-display font-bold text-[#0F172A] mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item.cartItemId} className="flex gap-3">
                  <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-xl object-cover bg-[#F1F5F9] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#0F172A] leading-tight line-clamp-2">{item.product.name}</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-[#0F172A] shrink-0">{formatCurrency(item.product.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <Divider className="my-4" />
            <div className="flex justify-between font-display font-bold text-lg text-[#0F172A]">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="mt-4 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-3 text-xs text-[#065F46]">
              <p className="font-semibold">Cash on Delivery</p>
              <p className="text-[#047857] mt-0.5">Pay when your order arrives</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
