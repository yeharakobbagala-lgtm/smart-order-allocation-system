import React, { useState, useEffect } from "react";
import type { CartItem, Page } from "../../types";
import { Button, Card, CountdownTimer, Alert, Spinner, IconCheck, IconRefresh } from "../../components/ui";

interface Props {
  cart: CartItem[];
  branchName: string;
  estimatedDelivery: string;
  total: number;
  onConfirmOrder: () => void;
  navigate: (page: Page) => void;
}

type ReservationState = "active" | "expired-checking" | "expired-reallocating" | "expired-failed" | "expired-success";

export const Reservation: React.FC<Props> = ({ cart, branchName, estimatedDelivery, total, onConfirmOrder, navigate }) => {
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [state, setState] = useState<ReservationState>("active");

  useEffect(() => {
    if (state !== "active") return;
    if (secondsLeft <= 0) {
      setState("expired-checking");
      handleExpiry();
      return;
    }
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft, state]);

  const handleExpiry = async () => {
    await new Promise((r) => setTimeout(r, 1500));
    setState("expired-reallocating");
    await new Promise((r) => setTimeout(r, 2000));
    // Simulate re-allocation success
    setState("expired-success");
    setSecondsLeft(600);
  };

  // Demo: trigger expiry manually
  const simulateExpiry = () => {
    setSecondsLeft(0);
  };

  if (state === "expired-checking" || state === "expired-reallocating") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-[#FFFBEB] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#F59E0B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          </div>
          <h2 className="font-display text-2xl font-bold text-[#0F172A] mb-2">Your reservation has expired</h2>
          <p className="text-[#64748B] mb-6">
            {state === "expired-checking" ? "We're checking availability again..." : "Finding the next available branch..."}
          </p>
          <div className="flex flex-col items-center gap-3">
            <Spinner size="md" className="text-[#4F46E5]" />
            <div className="flex gap-2 mt-3">
              {["Re-checking stock", state === "expired-reallocating" ? "Finding new branch" : "Verifying availability"].map((s, i) => (
                <span key={i} className="text-xs bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE] px-2 py-1 rounded-full">{s}</span>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (state === "expired-failed") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <Alert variant="danger" title="Unable to fulfill order" className="mb-6">
          Unfortunately, no branch currently has sufficient stock for your items. Please try again later or modify your cart.
        </Alert>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate("cart")} variant="outline">Return to Cart</Button>
          <Button onClick={() => navigate("products")}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  if (state === "expired-success") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <Alert variant="success" title="Stock re-reserved successfully" className="mb-6">
          We found available stock and re-reserved your items. You have 10 minutes to complete your order.
        </Alert>
        <ReservationContent
          cart={cart}
          branchName={branchName}
          estimatedDelivery={estimatedDelivery}
          total={total}
          secondsLeft={secondsLeft}
          onConfirm={onConfirmOrder}
          onSimulate={simulateExpiry}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <ReservationContent
        cart={cart}
        branchName={branchName}
        estimatedDelivery={estimatedDelivery}
        total={total}
        secondsLeft={secondsLeft}
        onConfirm={onConfirmOrder}
        onSimulate={simulateExpiry}
      />
    </div>
  );
};

const ReservationContent: React.FC<{
  cart: CartItem[];
  branchName: string;
  estimatedDelivery: string;
  total: number;
  secondsLeft: number;
  onConfirm: () => void;
  onSimulate: () => void;
}> = ({ cart, branchName, estimatedDelivery, total, secondsLeft, onConfirm, onSimulate }) => (
  <div className="space-y-6">
    {/* Timer Card */}
    <Card className="p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-[#ECFDF5] text-[#065F46] px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <IconCheck size={14} />
          Stock reserved
        </div>
        <h1 className="font-display text-2xl font-bold text-[#0F172A] mb-2">Your items are temporarily reserved</h1>
        <p className="text-[#64748B] text-sm max-w-md mx-auto">
          Complete your order before the reservation expires. If time runs out, we'll automatically check availability and re-reserve if possible.
        </p>
      </div>

      <div className="flex justify-center mb-6">
        <CountdownTimer seconds={secondsLeft} total={600} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2E8F0]">
          <p className="text-xs text-[#64748B] mb-1">Reserved at branch</p>
          <p className="font-display font-bold text-[#0F172A]">{branchName}</p>
        </div>
        <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2E8F0]">
          <p className="text-xs text-[#64748B] mb-1">Estimated delivery</p>
          <p className="font-display font-bold text-[#0F172A]">{estimatedDelivery}</p>
        </div>
      </div>

      {/* Reserved items */}
      <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden mb-6">
        <div className="bg-[#F8FAFC] px-4 py-2.5 border-b border-[#E2E8F0]">
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Reserved Items</p>
        </div>
        <div className="divide-y divide-[#F1F5F9]">
          {cart.map((item) => (
            <div key={item.product.id} className="flex items-center gap-3 px-4 py-3">
              <img src={item.product.image} alt={item.product.name} className="w-10 h-10 rounded-xl object-cover bg-[#F1F5F9] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0F172A] truncate">{item.product.name}</p>
                <p className="text-xs text-[#94A3B8]">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-bold text-[#0F172A]">${(item.product.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-between">
          <span className="font-display font-bold text-[#0F172A]">Total</span>
          <span className="font-display font-bold text-[#4F46E5] text-lg">${total.toFixed(2)}</span>
        </div>
      </div>

      <Button size="lg" className="w-full" onClick={onConfirm}>
        Review &amp; Place Order
      </Button>
    </Card>

    <Alert variant="info">
      If the reservation expires, SmartOrder will automatically check the same branch again and, if stock is still available, re-reserve your items. No action needed from you.
    </Alert>

    <div className="text-center">
      <button onClick={onSimulate} className="text-xs text-[#94A3B8] hover:text-[#64748B] underline">
        Simulate expiry (demo)
      </button>
    </div>
  </div>
);
