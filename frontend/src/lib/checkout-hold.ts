import type { ApiCheckoutHold } from "@/lib/api";
import { parseServerDate, secondsUntilExpiry } from "@/lib/datetime";

const CHECKOUT_HOLD_KEY = "shoply_checkout_hold";

/** Normalize datetime fields so sessionStorage reloads stay UTC-safe. */
function normalizeHold(hold: ApiCheckoutHold): ApiCheckoutHold {
  const normalize = (value: string) => {
    const d = parseServerDate(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toISOString();
  };

  return {
    ...hold,
    expires_at: normalize(hold.expires_at),
    estimated_delivery_date: normalize(hold.estimated_delivery_date),
    estimated_delivery_end: normalize(hold.estimated_delivery_end),
  };
}

export function saveCheckoutHold(hold: ApiCheckoutHold): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    CHECKOUT_HOLD_KEY,
    JSON.stringify(normalizeHold(hold))
  );
}

export function loadCheckoutHold(): ApiCheckoutHold | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(CHECKOUT_HOLD_KEY);
  if (!raw) return null;
  try {
    const hold = normalizeHold(JSON.parse(raw) as ApiCheckoutHold);
    // Drop clearly invalid / already-expired holds from a previous session
    if (!hold.hold_id || secondsUntilExpiry(hold.expires_at) <= 0) {
      sessionStorage.removeItem(CHECKOUT_HOLD_KEY);
      return null;
    }
    return hold;
  } catch {
    sessionStorage.removeItem(CHECKOUT_HOLD_KEY);
    return null;
  }
}

export function clearCheckoutHold(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CHECKOUT_HOLD_KEY);
}
