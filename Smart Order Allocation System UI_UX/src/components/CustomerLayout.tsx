import React, { useState } from "react";
import type { User, CartItem, Page } from "../types";
import { IconCart, IconMenu, IconX, IconPackage } from "./ui";

interface Props {
  user: User | null;
  cart: CartItem[];
  currentPage: Page;
  navigate: (page: Page) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const CustomerLayout: React.FC<Props> = ({ user, cart, currentPage, navigate, onLogout, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const navLinks = [
    { page: "products" as Page, label: "Products" },
    { page: "my-orders" as Page, label: "My Orders" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button onClick={() => navigate("landing")} className="flex items-center gap-2 font-display font-bold text-xl text-[#0F172A]">
            <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center">
              <IconPackage size={16} className="text-white" />
            </div>
            <span className="hidden sm:inline">SmartOrder</span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <button
                key={l.page}
                onClick={() => navigate(l.page)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === l.page ? "bg-[#EEF2FF] text-[#4338CA]" : "text-[#64748B] hover:text-[#334155] hover:bg-[#F1F5F9]"}`}
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("cart")}
              className="relative p-2 rounded-xl text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
            >
              <IconCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#4F46E5] text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-sm font-bold">
                  {user.name[0]}
                </div>
                <button onClick={onLogout} className="text-sm text-[#64748B] hover:text-[#334155] px-2 py-1 rounded-lg hover:bg-[#F1F5F9]">
                  Sign out
                </button>
              </div>
            ) : (
              <div className="hidden md:flex gap-2">
                <button onClick={() => navigate("login")} className="text-sm font-medium text-[#64748B] hover:text-[#334155] px-3 py-2">Sign in</button>
                <button onClick={() => navigate("register")} className="text-sm font-medium bg-[#4F46E5] text-white px-4 py-2 rounded-xl hover:bg-[#4338CA] transition-colors">Get started</button>
              </div>
            )}

            <button className="md:hidden p-2 rounded-xl text-[#64748B] hover:bg-[#F1F5F9]" onClick={() => setMobileOpen(true)}>
              <IconMenu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl animate-slide-in flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-[#E2E8F0]">
              <span className="font-display font-bold text-lg">SmartOrder</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-[#F1F5F9]">
                <IconX size={18} />
              </button>
            </div>
            <nav className="p-4 flex flex-col gap-1 flex-1">
              {navLinks.map((l) => (
                <button key={l.page} onClick={() => { navigate(l.page); setMobileOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentPage === l.page ? "bg-[#EEF2FF] text-[#4338CA]" : "text-[#64748B] hover:bg-[#F1F5F9]"}`}>
                  {l.label}
                </button>
              ))}
            </nav>
            {user ? (
              <div className="p-4 border-t border-[#E2E8F0]">
                <div className="flex items-center gap-3 mb-3 px-2">
                  <div className="w-9 h-9 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-bold">{user.name[0]}</div>
                  <div><p className="font-medium text-[#0F172A] text-sm">{user.name}</p><p className="text-xs text-[#64748B]">{user.email}</p></div>
                </div>
                <button onClick={() => { onLogout(); setMobileOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-[#EF4444] hover:bg-[#FEF2F2] transition-colors">
                  Sign out
                </button>
              </div>
            ) : (
              <div className="p-4 border-t border-[#E2E8F0] flex flex-col gap-2">
                <button onClick={() => { navigate("login"); setMobileOpen(false); }} className="w-full py-3 rounded-xl text-sm font-medium border border-[#E2E8F0] hover:bg-[#F1F5F9]">Sign in</button>
                <button onClick={() => { navigate("register"); setMobileOpen(false); }} className="w-full py-3 rounded-xl text-sm font-medium bg-[#4F46E5] text-white hover:bg-[#4338CA]">Get started</button>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#E2E8F0] bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#94A3B8]">
          <span className="font-display font-semibold text-[#334155]">SmartOrder</span>
          <span>© 2026 Smart Order Allocation System. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};
