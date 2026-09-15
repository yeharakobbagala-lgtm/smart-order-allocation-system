import Link from "next/link";
import {
  MapPin,
  Boxes,
  Gauge,
  ShieldCheck,
  ArrowRight,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/layout/site-footer";

const features = [
  {
    icon: Boxes,
    title: "Stock-aware routing",
    description:
      "Only branches with enough available stock are eligible to fulfill your order.",
  },
  {
    icon: MapPin,
    title: "Nearest first",
    description:
      "Distance accounts for 60% of the allocation score so deliveries stay local.",
  },
  {
    icon: Gauge,
    title: "Balanced workload",
    description:
      "Workload makes up 40% of the score, preventing overloaded branches.",
  },
  {
    icon: Timer,
    title: "10-minute reservation",
    description:
      "Stock is held briefly at checkout so you can complete delivery details calmly.",
  },
];

export default function HomePage() {
  return (
    <>
      <main>
        <section className="relative overflow-hidden border-b border-border bg-white">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--primary-soft),_transparent_55%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
            <div className="animate-fade-in">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
                Smart Order Allocation
              </p>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                SmartOrder
              </h1>
              <p className="mt-4 max-w-xl text-lg text-muted">
                Place an order once. We automatically select the best branch
                using product availability, distance, and live workload — then
                reserve stock while you confirm delivery.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/products">
                  <Button size="lg">
                    Browse products
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline">
                    Create account
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-2 text-sm text-muted">
                <ShieldCheck className="h-4 w-4 text-success" />
                Trusted allocation · Cash on delivery · Real-time stock checks
              </div>
            </div>

            <div className="animate-fade-in rounded-3xl border border-border bg-slate-50 p-6 shadow-[var(--shadow)]">
              <p className="mb-4 text-sm font-semibold text-foreground">
                How allocation works
              </p>
              <ol className="space-y-4">
                {[
                  "Fresh stock check across active branches",
                  "Filter to branches that can fulfill every item",
                  "Score by distance (60%) + workload (40%)",
                  "Reserve stock for 10 minutes, then place order",
                ].map((step, i) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="pt-1 text-sm text-slate-700">{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-6 rounded-2xl border border-indigo-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Customer view
                </p>
                <p className="mt-1 text-sm text-muted">
                  “Best available branch selected automatically.” No technical
                  scoring shown at checkout — just a clear allocation result.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Built for reliable fulfillment
            </h2>
            <p className="mt-2 text-muted">
              A clean shopping experience on top of an intelligent allocation
              engine.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-2xl border border-border bg-white p-5 shadow-[var(--shadow-sm)]"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted">{f.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
