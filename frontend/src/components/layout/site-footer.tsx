import Link from "next/link";
import { Package } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <div className="mb-3 flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <Package className="h-4 w-4" />
            </span>
            SmartOrder
          </div>
          <p className="text-sm text-muted">
            Smart order allocation that picks the best branch using stock,
            distance, and workload — automatically.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Customer</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <Link href="/products" className="hover:text-primary">
                Browse products
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-primary">
                Track orders
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-primary">
                Create account
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Allocation</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li>Stock eligibility first</li>
            <li>Distance weight 60%</li>
            <li>Workload weight 40%</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} Smart Order Allocation System · UI prototype
      </div>
    </footer>
  );
}
