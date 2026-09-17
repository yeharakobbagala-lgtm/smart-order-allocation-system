import type { ApiCheckoutHold } from "@/lib/api";

const CHECKOUT_HOLD_KEY = "shoply_checkout_hold";

export function saveCheckoutHold(hold: ApiCheckoutHold): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CHECKOUT_HOLD_KEY, JSON.stringify(hold));
}

export function loadCheckoutHold(): ApiCheckoutHold | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(CHECKOUT_HOLD_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ApiCheckoutHold;
  } catch {
    return null;
  }
}

export function clearCheckoutHold(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CHECKOUT_HOLD_KEY);
}
