import { clsx, type ClassValue } from "clsx";
import type { OrderStatus, PaymentStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatStatusLabel(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function orderStatusVariant(
  status: OrderStatus
): "info" | "warning" | "success" | "danger" | "neutral" {
  switch (status) {
    case "ALLOCATED":
      return "info";
    case "PROCESSING":
      return "warning";
    case "OUT_FOR_DELIVERY":
      return "info";
    case "DELIVERED":
      return "success";
    case "CANCELLED":
      return "danger";
    default:
      return "neutral";
  }
}

export function paymentStatusVariant(
  status: PaymentStatus
): "warning" | "success" {
  return status === "PAID" ? "success" : "warning";
}

export function availableStock(physical: number, reserved: number) {
  return Math.max(0, physical - reserved);
}

export function canCancelOrder(status: OrderStatus) {
  return status === "ALLOCATED" || status === "PROCESSING";
}

export function generateOrderNumber(id: number) {
  return `SOA-${String(id).padStart(5, "0")}`;
}
