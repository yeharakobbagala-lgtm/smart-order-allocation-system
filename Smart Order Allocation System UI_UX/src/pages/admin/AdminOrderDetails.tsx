import React from "react";
import type { Order, Page } from "../../types";
import { Card, StatusBadge, Badge, ScoreBar, Alert, IconArrowLeft, IconMapPin, IconBranch, IconCalendar } from "../../components/ui";

interface Props {
  order: Order;
  navigate: (page: Page) => void;
}

export const AdminOrderDetails: React.FC<Props> = ({ order, navigate }) => {
  const { allocation: alloc } = order;
  const distancePct = alloc.distanceScore;
  const workloadPct = alloc.workloadScore;
  const finalPct = alloc.finalScore;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("admin-orders")} className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#334155] font-medium">
        <IconArrowLeft size={16} /> All Orders
      </button>

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="font-mono-data text-sm text-[#94A3B8]">Order ID</p>
          <h1 className="font-display text-2xl font-bold text-[#0F172A]">{order.id}</h1>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          <StatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left: Customer + Delivery + Products */}
        <div className="lg:col-span-2 space-y-5">
          {/* Customer */}
          <Card className="p-5">
            <h2 className="font-display font-bold text-[#0F172A] mb-4">Customer</h2>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div><p className="text-[#94A3B8] text-xs">Name</p><p className="font-medium text-[#0F172A] mt-0.5">{order.customerName}</p></div>
              <div><p className="text-[#94A3B8] text-xs">Email</p><p className="font-medium text-[#0F172A] mt-0.5">{order.customerEmail}</p></div>
              <div><p className="text-[#94A3B8] text-xs">Phone</p><p className="font-medium text-[#0F172A] mt-0.5">{order.phone}</p></div>
              <div>
                <p className="text-[#94A3B8] text-xs">Location</p>
                <p className="font-mono-data text-xs text-[#64748B] mt-0.5">{order.lat}, {order.lng}</p>
              </div>
            </div>
          </Card>

          {/* Delivery */}
          <Card className="p-5">
            <h2 className="font-display font-bold text-[#0F172A] mb-4 flex items-center gap-2">
              <IconMapPin size={16} className="text-[#4F46E5]" />
              Delivery Information
            </h2>
            <p className="font-medium text-[#0F172A] text-sm">{order.address}</p>
            <p className="text-[#64748B] text-sm">{order.city}</p>
            {order.note && <div className="mt-3 bg-[#F8FAFC] rounded-lg p-3 text-xs text-[#64748B] border border-[#E2E8F0]">"{order.note}"</div>}
            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
                <p className="text-xs text-[#94A3B8]">Branch</p>
                <p className="text-sm font-medium text-[#0F172A] mt-0.5">{order.branchName}</p>
              </div>
              <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
                <p className="text-xs text-[#94A3B8]">Estimated Delivery</p>
                <p className="text-sm font-medium text-[#10B981] mt-0.5">
                  {new Date(order.estimatedDelivery).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
          </Card>

          {/* Products */}
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <h2 className="font-display font-bold text-[#0F172A]">Products</h2>
            </div>
            <div className="divide-y divide-[#F8FAFC]">
              {order.items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 px-5 py-3">
                  <img src={item.image} alt={item.productName} className="w-12 h-12 rounded-xl object-cover bg-[#F1F5F9] shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#0F172A]">{item.productName}</p>
                    <p className="text-xs text-[#94A3B8]">Unit price: ${item.price.toFixed(2)}</p>
                  </div>
                  <p className="text-xs text-[#64748B]">×{item.quantity}</p>
                  <p className="font-bold text-[#0F172A]">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-between font-display font-bold text-[#0F172A]">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </Card>
        </div>

        {/* Right: Allocation Decision + Payment */}
        <div className="space-y-5">
          {/* Allocation Decision */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#EEF2FF] rounded-xl flex items-center justify-center">
                <IconBranch size={14} className="text-[#4F46E5]" />
              </div>
              <h2 className="font-display font-bold text-[#0F172A]">Allocation Decision</h2>
            </div>

            <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-3 mb-5">
              <p className="text-xs text-[#047857] font-medium">Selected Branch</p>
              <p className="font-display font-bold text-[#065F46]">{alloc.branchName}</p>
              <p className="text-xs text-[#047857] mt-0.5">{alloc.distanceKm} km from customer</p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-[#334155]">Distance Score</span>
                  <Badge variant="default">{(alloc.distanceWeight * 100).toFixed(0)}% weight</Badge>
                </div>
                <ScoreBar value={distancePct} color="#4F46E5" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-[#334155]">Workload Score</span>
                  <Badge variant="success">{(alloc.workloadWeight * 100).toFixed(0)}% weight</Badge>
                </div>
                <ScoreBar value={workloadPct} color="#10B981" />
              </div>
              <div className="border-t border-[#E2E8F0] pt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#0F172A]">Final Score</span>
                  <span className="font-mono-data text-xs font-bold text-[#4F46E5]">{finalPct.toFixed(2)}</span>
                </div>
                <ScoreBar value={finalPct} color="#4F46E5" />
              </div>
            </div>

            <div className="mt-4 bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0] text-xs text-[#64748B]">
              <p className="font-medium text-[#334155] mb-1">Formula</p>
              <code className="font-mono-data text-[#4F46E5]">
                {distancePct.toFixed(2)} × 0.60 + {workloadPct.toFixed(2)} × 0.40 = <strong>{finalPct.toFixed(2)}</strong>
              </code>
              <p className="mt-2 text-[#94A3B8]">Stock availability is a hard eligibility requirement — only branches with sufficient stock were evaluated.</p>
            </div>
          </Card>

          {/* Payment */}
          <Card className="p-5">
            <h2 className="font-display font-bold text-[#0F172A] mb-4">Payment</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[#64748B]">Method</span><span className="font-medium">Cash on Delivery</span></div>
              <div className="flex justify-between items-center"><span className="text-[#64748B]">Status</span><StatusBadge status={order.paymentStatus} /></div>
              <div className="flex justify-between border-t border-[#E2E8F0] pt-2 mt-2">
                <span className="font-bold text-[#0F172A]">Total</span>
                <span className="font-display font-bold text-[#0F172A]">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
