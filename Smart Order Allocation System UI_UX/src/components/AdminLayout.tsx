import React, { useState } from "react";
import type { User, Page } from "../types";
import {
  IconPackage, IconBarChart, IconUsers, IconBranch, IconInventory,
  IconSettings, IconLogout, IconMenu, IconX, IconChevronRight
} from "./ui";

interface Props {
  user: User;
  currentPage: Page;
  navigate: (page: Page) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const navItems = [
  { page: "admin-dashboard" as Page, label: "Dashboard", icon: IconBarChart },
  { page: "admin-orders" as Page, label: "Orders", icon: IconPackage },
  { page: "admin-products" as Page, label: "Products", icon: IconInventory },
  { page: "admin-branches" as Page, label: "Branches", icon: IconBranch },
  { page: "admin-stock" as Page, label: "Stock", icon: IconInventory },
  { page: "admin-users" as Page, label: "Users", icon: IconUsers },
];

export const AdminLayout: React.FC<Props> = ({ user, currentPage, navigate, onLogout, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center shrink-0">
            <IconPackage size={16} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-sm text-[#0F172A]">SmartOrder</p>
            <p className="text-xs text-[#94A3B8]">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-0.5">
        <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider px-3 py-2 mt-1">Main</p>
        {navItems.map(({ page, label, icon: Icon }) => {
          const active = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => { navigate(page); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-[#EEF2FF] text-[#4338CA]" : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#334155]"}`}
            >
              <Icon size={16} />
              {label}
              {active && <IconChevronRight size={14} className="ml-auto text-[#6366F1]" />}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[#E2E8F0]">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-sm font-bold shrink-0">
            {user.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#0F172A] truncate">{user.name}</p>
            <p className="text-xs text-[#94A3B8] truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#EF4444] hover:bg-[#FEF2F2] transition-colors mt-1"
        >
          <IconLogout size={16} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-[#E2E8F0] fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl animate-slide-in">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-[#E2E8F0] h-14 flex items-center px-4 gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-[#F1F5F9] text-[#64748B]">
            <IconMenu size={20} />
          </button>
          <span className="font-display font-bold text-[#0F172A]">SmartOrder Admin</span>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
