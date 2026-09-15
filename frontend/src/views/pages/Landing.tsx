"use client";

import React from "react";
import type { Page } from "@/lib/types";
import { Button, IconBolt, IconShield, IconTruck, IconMapPin, IconCheck, IconPackage, IconChevronRight } from "@/components/ui";

interface Props {
  navigate: (page: Page) => void;
}

const features = [
  {
    icon: <IconBolt size={22} />,
    title: "Automatic Branch Allocation",
    desc: "Our algorithm instantly selects the optimal fulfillment branch based on stock availability, distance, and workload.",
  },
  {
    icon: <IconShield size={22} />,
    title: "Stock Reservations",
    desc: "Items are temporarily reserved for 10 minutes at checkout to ensure your order isn't affected by competing orders.",
  },
  {
    icon: <IconTruck size={22} />,
    title: "Real-Time Order Tracking",
    desc: "Follow your order through every stage — from allocation to delivery — with a clear visual status timeline.",
  },
  {
    icon: <IconMapPin size={22} />,
    title: "Distance-Aware Routing",
    desc: "Orders are fulfilled from the nearest eligible branch, minimizing delivery time without compromising availability.",
  },
];

const steps = [
  { n: "01", title: "Browse & Add to Cart", desc: "Add any products to your cart. No stock is reserved at this stage." },
  { n: "02", title: "Checkout", desc: "Enter your delivery details. We check stock in real time at this moment." },
  { n: "03", title: "Auto-Allocation", desc: "Our system finds the best branch — closest, least loaded, fully stocked." },
  { n: "04", title: "Reserve & Confirm", desc: "Stock is reserved for 10 minutes while you review and place your order." },
];

export const Landing: React.FC<Props> = ({ navigate }) => {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#EEF2FF] via-white to-white pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-24 lg:pt-32 lg:pb-40">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#EEF2FF] text-[#4338CA] text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-[#C7D2FE]">
                <IconBolt size={14} />
                Smart Order Allocation
              </div>
              <h1 className="font-display text-5xl lg:text-6xl font-bold text-[#0F172A] leading-tight mb-6">
                The smartest way<br />to fulfill orders
              </h1>
              <p className="text-lg text-[#475569] leading-relaxed mb-8 max-w-lg">
                SmartOrder automatically routes every purchase to the optimal branch — balancing proximity, workload, and stock availability in milliseconds.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" onClick={() => navigate("register")} iconRight={<IconChevronRight size={18} />}>
                  Start shopping
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("products")}>
                  Browse products
                </Button>
              </div>
              <div className="flex items-center gap-6 mt-8 pt-8 border-t border-[#F1F5F9]">
                {[["4 Branches", "fulfilling orders"], ["10-min", "stock reservations"], ["Real-time", "order tracking"]].map(([val, lbl]) => (
                  <div key={val}>
                    <p className="font-display font-bold text-[#0F172A]">{val}</p>
                    <p className="text-xs text-[#94A3B8]">{lbl}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1553413077-190dd305871c?w=700&h=500&fit=crop&auto=format"
                  alt="Modern warehouse fulfillment center"
                  className="rounded-3xl shadow-2xl w-full object-cover h-[420px]"
                />
                {/* Floating Card */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 border border-[#E2E8F0] w-56">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ECFDF5] rounded-xl flex items-center justify-center">
                      <IconCheck size={18} className="text-[#10B981]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#94A3B8]">Branch allocated</p>
                      <p className="font-display font-semibold text-[#0F172A] text-sm">Downtown Hub</p>
                      <p className="text-xs text-[#10B981]">3.2 km away · Score 0.82</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 border border-[#E2E8F0]">
                  <p className="text-xs text-[#94A3B8] mb-1">Stock reserved</p>
                  <p className="font-display font-bold text-2xl text-[#4F46E5]">10:00</p>
                  <p className="text-xs text-[#94A3B8]">minutes remaining</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-[#0F172A] mb-3">How allocation works</h2>
            <p className="text-[#64748B] max-w-xl mx-auto">From cart to confirmation in four seamless steps — powered by our allocation engine.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-6 relative">
                <div className="font-display text-4xl font-black text-[#EEF2FF] mb-3">{s.n}</div>
                <h3 className="font-display font-bold text-[#0F172A] mb-2">{s.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-3 z-10 text-[#C7D2FE]">
                    <IconChevronRight size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Allocation Explainer */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-[#0F172A] mb-4">Intelligent branch scoring</h2>
              <p className="text-[#64748B] mb-8 leading-relaxed">
                When you checkout, SmartOrder evaluates every branch using a weighted scoring model. Only branches with full stock eligibility are considered — then ranked by distance and workload.
              </p>
              <div className="space-y-4">
                {[
                  { label: "Distance Score", weight: "60%", bar: 0.6, color: "#4F46E5", desc: "Closer branches score higher" },
                  { label: "Workload Score", weight: "40%", bar: 0.4, color: "#10B981", desc: "Less busy branches score higher" },
                ].map((item) => (
                  <div key={item.label} className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#E2E8F0]">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-[#0F172A] text-sm">{item.label}</p>
                        <p className="text-xs text-[#94A3B8]">{item.desc}</p>
                      </div>
                      <span className="font-display font-bold text-xl" style={{ color: item.color }}>{item.weight}</span>
                    </div>
                    <div className="h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${item.bar * 100}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#94A3B8] mt-4 bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
                <strong className="text-[#64748B]">Stock availability is a hard requirement</strong> — only branches with all requested items in sufficient quantity are eligible for scoring.
              </p>
            </div>
            <div className="bg-[#0F172A] rounded-3xl p-8 font-mono-data text-sm">
              <p className="text-[#94A3B8] mb-1">// Allocation engine output</p>
              <p className="text-[#6366F1] mb-4">{">"} Evaluating 3 eligible branches...</p>
              {[
                { name: "Downtown Hub", dist: "3.2km", ws: "0.72", ds: "0.88", fs: "0.82", selected: true },
                { name: "North Bay Depot", dist: "7.8km", ws: "0.85", ds: "0.71", fs: "0.77", selected: false },
                { name: "South Bay Warehouse", dist: "14km", ws: "0.65", ds: "0.55", fs: "0.59", selected: false },
              ].map((b) => (
                <div key={b.name} className={`rounded-xl p-4 mb-3 border ${b.selected ? "bg-[#EEF2FF]/10 border-[#4F46E5]/50" : "bg-white/5 border-white/10"}`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${b.selected ? "text-[#A5B4FC]" : "text-white/60"}`}>{b.name}</span>
                    {b.selected && <span className="text-[#10B981] text-xs">✓ SELECTED</span>}
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div><span className="text-[#64748B]">dist </span><span className="text-white/80">{b.dist}</span></div>
                    <div><span className="text-[#64748B]">wScore </span><span className="text-white/80">{b.ws}</span></div>
                    <div><span className="text-[#64748B]">final </span><span className={b.selected ? "text-[#10B981] font-bold" : "text-white/80"}>{b.fs}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-[#0F172A] mb-3">Built for reliability</h2>
            <p className="text-[#64748B]">Every feature is designed to ensure your order is fulfilled correctly, every time.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-6 hover:shadow-md transition-shadow">
                <div className="w-11 h-11 bg-[#EEF2FF] text-[#4F46E5] rounded-2xl flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-display font-bold text-[#0F172A] mb-2 text-sm">{f.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#4F46E5]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-white mb-4">Ready to place your first order?</h2>
          <p className="text-[#C7D2FE] mb-8">Create an account and experience automated, intelligent order fulfillment.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="secondary" onClick={() => navigate("register")}>
              Create free account
            </Button>
            <Button size="lg" variant="ghost" onClick={() => navigate("products")} className="text-white hover:bg-white/10">
              Browse products first
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
