import type { Order, OrderItem } from "@/lib/types";

export type ReservationFulfillmentType = "TEMPORARY" | "CURRENT" | "FUTURE";

/**
 * Resolve per-item fulfillment from API reservation_type when present.
 * Confirmed orders never display as TEMPORARY.
 * If the API omits reservation_type, fall back to the order allocation
 * stock-wait snapshot (existing server field) — not invented status data.
 */
export function resolveItemFulfillmentType(
  item: OrderItem,
  order: Order
): ReservationFulfillmentType {
  const fromApi = item.reservationType;
  if (fromApi === "CURRENT" || fromApi === "FUTURE" || fromApi === "TEMPORARY") {
    if (fromApi === "TEMPORARY") {
      // Confirmed order pages should never present TEMPORARY holds.
      return order.allocation.stockWaitHours != null &&
        order.allocation.stockWaitHours > 0
        ? "FUTURE"
        : "CURRENT";
    }
    return fromApi;
  }

  if (
    order.allocation.stockWaitHours != null &&
    order.allocation.stockWaitHours > 0
  ) {
    return "FUTURE";
  }

  return "CURRENT";
}

export function formatRestockDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatEstimatedDelivery(
  value: string | null | undefined
): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function orderHasFutureItems(order: Order): boolean {
  return order.items.some(
    (item) => resolveItemFulfillmentType(item, order) === "FUTURE"
  );
}
