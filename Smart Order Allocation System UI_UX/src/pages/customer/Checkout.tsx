import React, { useState, useEffect } from "react";
import type { CartItem, Page } from "../../types";
import { Button, Card, Input, Textarea, AllocationWidget, Divider, IconMapPin, IconArrowLeft, IconChevronRight } from "../../components/ui";

interface Props {
  cart: CartItem[];
  user: { name: string; email: string } | null;
  onPlaceOrder: (form: DeliveryForm, branchId: string, branchName: string, estimatedDelivery: string) => void;
  navigate: (page: Page) => void;
}

export interface DeliveryForm {
  name: string;
  phone: string;
  address: string;
  city: string;
  lat: string;
  lng: string;
  note: string;
}

const SELECTED_BRANCH = { id: "b1", name: "Downtown Hub" };
const ESTIMATED = "Sep 17, 2026";

export const Checkout: React.FC<Props> = ({ cart, user, onPlaceOrder, navigate }) => {
  const [form, setForm] = useState<DeliveryForm>({
    name: user?.name || "",
    phone: "",
    address: "",
    city: "",
    lat: "37.7749",
    lng: "-122.4194",
    note: "",
  });
  const [errors, setErrors] = useState<Partial<DeliveryForm>>({});
  const [allocationState, setAllocationState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [step, setStep] = useState<"form" | "allocation">("form");

  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const validate = () => {
    const e: Partial<DeliveryForm> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.address.trim()) e.address = "Required";
    if (!form.city.trim()) e.city = "Required";
    return e;
  };

  const handleCheckStock = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep("allocation");
    setAllocationState("loading");
    await new Promise((r) => setTimeout(r, 2200));
    setAllocationState("success");
  };

  const field = (key: keyof DeliveryForm, val: string) => setForm((f) => ({ ...f, [key]: val }));

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-[#64748B] mb-4">Your cart is empty.</p>
        <Button onClick={() => navigate("products")}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate("cart")} className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#334155] mb-6 font-medium">
        <IconArrowLeft size={16} /> Back to Cart
      </button>

      <h1 className="font-display text-3xl font-bold text-[#0F172A] mb-8">Checkout</h1>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {["Delivery", "Allocation", "Confirm"].map((s, i) => {
          const stageIdx = step === "form" ? 0 : allocationState === "success" ? 1 : 1;
          return (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 text-sm font-medium ${i <= stageIdx ? "text-[#4F46E5]" : "text-[#94A3B8]"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < stageIdx ? "bg-[#4F46E5] text-white" : i === stageIdx ? "border-2 border-[#4F46E5] text-[#4F46E5]" : "border-2 border-[#E2E8F0] text-[#94A3B8]"}`}>
                  {i < stageIdx ? "✓" : i + 1}
                </div>
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-0.5 ${i < stageIdx ? "bg-[#4F46E5]" : "bg-[#E2E8F0]"}`} />}
            </React.Fragment>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Form */}
          <Card className="p-6">
            <h2 className="font-display font-bold text-[#0F172A] mb-5 flex items-center gap-2">
              <IconMapPin size={18} className="text-[#4F46E5]" />
              Delivery Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Full name" value={form.name} onChange={(e) => field("name", e.target.value)} error={errors.name} placeholder="Sarah Chen" />
              <Input label="Phone number" value={form.phone} onChange={(e) => field("phone", e.target.value)} error={errors.phone} placeholder="+1 415-555-0100" type="tel" />
              <div className="sm:col-span-2">
                <Input label="Delivery address" value={form.address} onChange={(e) => field("address", e.target.value)} error={errors.address} placeholder="88 Marina Blvd, Apt 4B" />
              </div>
              <Input label="City / State / ZIP" value={form.city} onChange={(e) => field("city", e.target.value)} error={errors.city} placeholder="San Francisco, CA 94123" />
              <div className="grid grid-cols-2 gap-2">
                <Input label="Latitude" value={form.lat} onChange={(e) => field("lat", e.target.value)} placeholder="37.7749" />
                <Input label="Longitude" value={form.lng} onChange={(e) => field("lng", e.target.value)} placeholder="-122.4194" />
              </div>
              <div className="sm:col-span-2">
                <Textarea label="Order note (optional)" value={form.note} onChange={(e) => field("note", e.target.value)} placeholder="E.g. Leave at the door, ring buzzer 4B..." />
              </div>
            </div>
          </Card>

          {/* Allocation Widget */}
          <Card className="p-6">
            <h2 className="font-display font-bold text-[#0F172A] mb-2">Branch Allocation</h2>
            <p className="text-sm text-[#64748B] mb-5">
              Our system will automatically find the best branch based on your location, stock availability, and branch workload.
            </p>
            <AllocationWidget state={allocationState} branchName={SELECTED_BRANCH.name} estimatedDelivery={ESTIMATED} />
            {step === "form" && (
              <Button size="lg" onClick={handleCheckStock} className="w-full mt-2">
                Check Stock & Find Branch
              </Button>
            )}
            {allocationState === "success" && (
              <Button size="lg" onClick={() => onPlaceOrder(form, SELECTED_BRANCH.id, SELECTED_BRANCH.name, ESTIMATED)} className="w-full mt-4" iconRight={<IconChevronRight size={16} />}>
                Reserve Stock &amp; Continue
              </Button>
            )}
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="p-5 sticky top-24">
            <h2 className="font-display font-bold text-[#0F172A] mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item.product.id} className="flex gap-3">
                  <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-xl object-cover bg-[#F1F5F9] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#0F172A] leading-tight line-clamp-2">{item.product.name}</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-[#0F172A] shrink-0">${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <Divider className="my-4" />
            <div className="flex justify-between font-display font-bold text-lg text-[#0F172A]">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
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
