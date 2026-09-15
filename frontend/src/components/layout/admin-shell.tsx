"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Building2,
  Boxes,
  Users,
  UserCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/branches", label: "Branches", icon: Building2 },
  { href: "/admin/stock", label: "Stock", icon: Boxes },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/profile", label: "Profile", icon: UserCircle },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {nav.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-primary text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-white lg:flex">
          <div className="flex h-16 items-center gap-2 border-b border-border px-5 font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
              <Package className="h-5 w-5" />
            </span>
            Admin
          </div>
          <NavLinks />
          <div className="border-t border-border p-3">
            <p className="mb-2 truncate px-3 text-xs text-muted">{user?.email}</p>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/90 px-4 backdrop-blur lg:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-xl p-2 text-muted hover:bg-slate-100 lg:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open admin menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-sm font-semibold">SmartOrder Admin</p>
                <p className="text-xs text-muted">Order allocation console</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="lg:hidden"
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </header>

          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Close drawer"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <span className="font-bold">Admin menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}
    </div>
  );
}
