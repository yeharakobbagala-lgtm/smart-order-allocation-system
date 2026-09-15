import type { Page } from "@/lib/types";

export function pageToHref(page: Page, id?: string): string {
  switch (page) {
    case "landing":
      return "/";
    case "login":
      return "/login";
    case "register":
      return "/register";
    case "products":
      return "/products";
    case "product-details":
      return id ? `/products/${id}` : "/products";
    case "cart":
      return "/cart";
    case "checkout":
      return "/checkout";
    case "reservation":
      return "/checkout/reservation";
    case "place-order":
      return "/checkout/place-order";
    case "order-confirmation":
      return id ? `/orders/${id}/confirmation` : "/orders";
    case "my-orders":
      return "/orders";
    case "order-details":
      return id ? `/orders/${id}` : "/orders";
    case "admin-dashboard":
      return "/admin";
    case "admin-orders":
      return "/admin/orders";
    case "admin-order-details":
      return id ? `/admin/orders/${id}` : "/admin/orders";
    case "admin-products":
      return "/admin/products";
    case "admin-branches":
      return "/admin/branches";
    case "admin-stock":
      return "/admin/stock";
    case "admin-users":
      return "/admin/users";
    default:
      return "/";
  }
}

export function pathnameToPage(pathname: string): Page {
  if (pathname === "/") return "landing";
  if (pathname === "/login") return "login";
  if (pathname === "/register") return "register";
  if (pathname === "/products") return "products";
  if (pathname.startsWith("/products/")) return "product-details";
  if (pathname === "/cart") return "cart";
  if (pathname === "/checkout") return "checkout";
  if (pathname === "/checkout/reservation") return "reservation";
  if (pathname === "/checkout/place-order") return "place-order";
  if (/^\/orders\/[^/]+\/confirmation$/.test(pathname)) return "order-confirmation";
  if (pathname === "/orders") return "my-orders";
  if (pathname.startsWith("/orders/")) return "order-details";
  if (pathname === "/admin") return "admin-dashboard";
  if (pathname === "/admin/orders") return "admin-orders";
  if (pathname.startsWith("/admin/orders/")) return "admin-order-details";
  if (pathname === "/admin/products") return "admin-products";
  if (pathname === "/admin/branches") return "admin-branches";
  if (pathname === "/admin/stock") return "admin-stock";
  if (pathname === "/admin/users") return "admin-users";
  return "landing";
}
