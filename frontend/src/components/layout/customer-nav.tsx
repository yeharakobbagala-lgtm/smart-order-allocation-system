"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, ShoppingCart, X, Package } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useApp } from "@/context/app-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/products", label: "Products" },
  { href: "/orders", label: "My Orders", auth: true },
];

export function CustomerNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { cartCount } = useApp();
  const [open, setOpen] = useState(false);

  const isAdminRoute = pathname.startsWith("/admin");
  if (isAdminRoute) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
            <Package className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline">SmartOrder</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links
            .filter((l) => !l.auth || user)
            .map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition",
                  pathname.startsWith(link.href)
                    ? "bg-primary-soft text-primary"
                    : "text-muted hover:bg-slate-100 hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
        </nav>

        <div className="flex items-center gap-2">
          {user?.role === "customer" || !user ? (
            <Link
              href="/cart"
              className="relative rounded-xl p-2 text-muted hover:bg-slate-100 hover:text-foreground"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              ) : null}
            </Link>
          ) : null}

          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="max-w-[140px] truncate text-sm text-muted">
                {user.name}
              </span>
              {user.role === "admin" ? (
                <Button size="sm" variant="secondary" onClick={() => router.push("/admin")}>
                  Admin
                </Button>
              ) : null}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button size="sm" variant="ghost" onClick={() => router.push("/login")}>
                Login
              </Button>
              <Button size="sm" onClick={() => router.push("/register")}>
                Register
              </Button>
            </div>
          )}

          <button
            type="button"
            className="rounded-xl p-2 text-muted hover:bg-slate-100 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links
              .filter((l) => !l.auth || user)
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-slate-50"
                >
                  {link.label}
                </Link>
              ))}
            {user ? (
              <button
                type="button"
                className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-danger hover:bg-red-50"
                onClick={() => {
                  logout();
                  setOpen(false);
                  router.push("/");
                }}
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
