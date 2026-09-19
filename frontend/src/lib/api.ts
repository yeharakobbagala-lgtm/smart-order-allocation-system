const TOKEN_KEY = "soa_access_token";
const USER_KEY = "soa_user";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUser<T>(): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: unknown | null) {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

function parseDetail(data: unknown): string {
  if (!data || typeof data !== "object") return "Request failed";
  const detail = (data as { detail?: unknown }).detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "msg" in item) {
          return String((item as { msg: string }).msg);
        }
        return JSON.stringify(item);
      })
      .join(", ");
  }
  return "Request failed";
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  auth = false
): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new ApiError(
      "API URL is not configured. Set NEXT_PUBLIC_API_URL in the Vercel project environment (Production) and redeploy, or in frontend/.env.local for local development.",
      0
    );
  }

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = getAccessToken();
    if (!token) {
      throw new ApiError("You must be signed in to continue.", 401);
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(`${base}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(
      "Cannot reach the API. Check that the backend is running, NEXT_PUBLIC_API_URL is correct, and Railway CORS_ORIGINS includes this site's origin.",
      0
    );
  }

  if (!res.ok) {
    let detail = "";
    try {
      detail = parseDetail(await res.json());
    } catch {
      /* ignore */
    }

    const friendlyByStatus: Record<number, string> = {
      401: "Your session has expired. Please sign in again.",
      403: "You do not have permission to perform this action.",
      404: "The requested resource was not found.",
      422: detail || "Please check your input and try again.",
      500: "Something went wrong on the server. Please try again later.",
    };

    // Prefer backend detail for business conflicts (stock duplicate, order allocation, etc.)
    let message =
      detail ||
      friendlyByStatus[res.status] ||
      `Request failed (${res.status})`;

    if (res.status === 409 && !detail) {
      message =
        "Sorry, this order can no longer be fulfilled with the current stock or branch availability.";
    }

    if (res.status === 401) {
      setAccessToken(null);
      setStoredUser(null);
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

/* ── Auth ─────────────────────────────────────────────── */

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface ApiLoginResponse {
  access_token: string;
  token_type: string;
  user: ApiUser;
}

export function registerUser(payload: {
  name: string;
  email: string;
  password: string;
}) {
  return apiFetch<ApiUser>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginWithApi(email: string, password: string) {
  return apiFetch<ApiLoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function fetchCurrentUser() {
  return apiFetch<ApiUser>("/auth/me", { method: "GET" }, true);
}

/* ── Products ─────────────────────────────────────────── */

export interface ApiProduct {
  id: number;
  name: string;
  description: string | null;
  price: number | string;
  image: string | null;
  active: boolean;
}

export function fetchProducts() {
  return apiFetch<ApiProduct[]>("/products/", { method: "GET" });
}

export function fetchProduct(id: number) {
  return apiFetch<ApiProduct>(`/products/${id}`, { method: "GET" });
}

export function searchProducts(name: string) {
  const q = new URLSearchParams({ name });
  return apiFetch<ApiProduct[]>(`/products/search?${q}`, { method: "GET" });
}

export function createProduct(payload: {
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  active?: boolean;
}) {
  return apiFetch<ApiProduct>(
    "/products/",
    { method: "POST", body: JSON.stringify(payload) },
    true
  );
}

export function updateProduct(
  id: number,
  payload: {
    name: string;
    description?: string | null;
    price: number;
    image?: string | null;
    active?: boolean;
  }
) {
  return apiFetch<ApiProduct>(
    `/products/${id}`,
    { method: "PUT", body: JSON.stringify(payload) },
    true
  );
}

export function deleteProduct(id: number) {
  return apiFetch<ApiProduct>(`/products/${id}`, { method: "DELETE" }, true);
}

/* ── Cart ─────────────────────────────────────────────── */

export interface ApiCartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number | string;
    image: string | null;
  };
}

export interface ApiCart {
  id: number;
  user_id: number;
  items: ApiCartItem[];
}

export function fetchCart() {
  return apiFetch<ApiCart>("/cart", { method: "GET" }, true);
}

export function addCartItem(product_id: number, quantity: number) {
  return apiFetch<ApiCartItem>(
    "/cart/items",
    {
      method: "POST",
      body: JSON.stringify({ product_id, quantity }),
    },
    true
  );
}

export function updateCartItem(cart_item_id: number, quantity: number) {
  return apiFetch<ApiCartItem>(
    `/cart/items/${cart_item_id}`,
    {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    },
    true
  );
}

export function removeCartItem(cart_item_id: number) {
  return apiFetch<{ message: string }>(
    `/cart/items/${cart_item_id}`,
    { method: "DELETE" },
    true
  );
}

/* ── Orders ───────────────────────────────────────────── */

export interface ApiOrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number | string;
  reservation_type?: string | null;
  restock_date?: string | null;
}

export interface ApiOrder {
  id: number;
  user_id: number;
  branch_id: number | null;
  customer_name: string;
  phone: string;
  delivery_address: string;
  latitude: number;
  longitude: number;
  order_note: string | null;
  status: string;
  total_amount: number | string;
  payment_method: string;
  payment_status: string;
  estimated_delivery_date: string | null;
  allocation_distance_km: number | null;
  allocation_travel_time_hours: number | null;
  allocation_stock_wait_hours: number | null;
  allocation_processing_time_hours: number | null;
  allocation_eta_hours: number | null;
  allocation_workload_percentage: number | null;
  allocation_eta_score: number | null;
  allocation_workload_score: number | null;
  allocation_final_score: number | null;
  created_at: string;
  updated_at: string;
  order_items: ApiOrderItem[];
}

export function createOrder(payload: {
  customer_name: string;
  phone: string;
  delivery_address: string;
  latitude: number;
  longitude: number;
  order_note?: string | null;
  payment_method?: string;
}) {
  // Legacy direct order create. Customer checkout MUST use
  // createCheckoutHold + confirmCheckoutHold instead.
  return apiFetch<ApiOrder>(
    "/orders/",
    { method: "POST", body: JSON.stringify(payload) },
    true
  );
}

/* ── Checkout hold / confirm ─────────────────────────── */

export interface ApiCheckoutHoldItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number | string;
  line_total: number | string;
  reservation_id: number;
}

export interface ApiCheckoutHold {
  hold_id: number;
  branch_id: number;
  branch_name: string;
  distance_km: number;
  travel_time_hours: number;
  stock_wait_hours: number;
  processing_time_hours: number;
  eta_hours: number;
  estimated_delivery_date: string;
  estimated_delivery_end: string;
  reservation_ids: number[];
  expires_at: string;
  items: ApiCheckoutHoldItem[];
  subtotal: number | string;
  delivery: number | string;
  total: number | string;
  status: string;
}

export function createCheckoutHold(payload: {
  customer_name: string;
  phone: string;
  delivery_address: string;
  latitude: number;
  longitude: number;
  order_note?: string | null;
  payment_method?: string;
}) {
  return apiFetch<ApiCheckoutHold>(
    "/checkout/hold",
    { method: "POST", body: JSON.stringify(payload) },
    true
  );
}

export interface ApiNoteClassification {
  category: string;
  confidence: number;
  low_confidence: boolean;
}

export function classifyCheckoutNote(message: string) {
  return apiFetch<ApiNoteClassification>(
    "/checkout/classify",
    { method: "POST", body: JSON.stringify({ message }) },
    false
  );
}

export function confirmCheckoutHold(holdId: number) {
  return apiFetch<ApiOrder>(
    "/checkout/confirm",
    { method: "POST", body: JSON.stringify({ hold_id: holdId }) },
    true
  );
}

export function fetchMyOrders() {
  return apiFetch<ApiOrder[]>("/orders/my", { method: "GET" }, true);
}

export function fetchMyOrder(orderId: number) {
  return apiFetch<ApiOrder>(`/orders/${orderId}`, { method: "GET" }, true);
}

export function cancelOrder(orderId: number) {
  return apiFetch<ApiOrder>(
    `/orders/${orderId}/cancel`,
    { method: "PATCH" },
    true
  );
}

export function fetchAllOrders() {
  return apiFetch<ApiOrder[]>("/orders/", { method: "GET" }, true);
}

export function updateOrderStatus(orderId: number, status: string) {
  return apiFetch<ApiOrder>(
    `/orders/${orderId}/status`,
    { method: "PATCH", body: JSON.stringify({ status }) },
    true
  );
}

/* ── Branches ─────────────────────────────────────────── */

export interface ApiBranch {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  active: boolean;
}

export function fetchBranches() {
  return apiFetch<ApiBranch[]>("/branches/", { method: "GET" });
}

export function createBranch(payload: {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
}) {
  return apiFetch<ApiBranch>(
    "/branches/",
    { method: "POST", body: JSON.stringify(payload) },
    true
  );
}

/* ── Branch stock ─────────────────────────────────────── */

export interface ApiBranchStock {
  id: number;
  branch_id: number;
  product_id: number;
  quantity: number;
  restock_quantity: number;
  restock_date: string | null;
}

export function fetchBranchStock() {
  return apiFetch<ApiBranchStock[]>("/branch-stock/", { method: "GET" }, true);
}

export function createBranchStock(payload: {
  branch_id: number;
  product_id: number;
  quantity: number;
  restock_quantity: number;
  restock_date?: string | null;
}) {
  return apiFetch<ApiBranchStock>(
    "/branch-stock/",
    { method: "POST", body: JSON.stringify(payload) },
    true
  );
}

export function updateBranchStock(
  stockId: number,
  payload: {
    quantity: number;
    restock_quantity: number;
    restock_date?: string | null;
  }
) {
  return apiFetch<ApiBranchStock>(
    `/branch-stock/${stockId}`,
    { method: "PUT", body: JSON.stringify(payload) },
    true
  );
}

export function deleteBranchStock(stockId: number) {
  return apiFetch<unknown>(`/branch-stock/${stockId}`, { method: "DELETE" }, true);
}

export function fetchStockAvailability(
  branchId: number,
  productId: number,
  physicalQuantity: number
) {
  const q = new URLSearchParams({
    physical_quantity: String(physicalQuantity),
  });
  return apiFetch<{
    branch_id: number;
    product_id: number;
    physical_quantity: number;
    available_quantity: number;
    future_committed_quantity: number;
    restock_quantity: number;
    remaining_restock_quantity: number;
    restock_date: string | null;
  }>(`/reservations/availability/${branchId}/${productId}?${q}`, {
    method: "GET",
  });
}

export function fetchFutureReservationSummary() {
  return apiFetch<{ total_future_units: number }>(
    "/admin/reservations/future-summary",
    { method: "GET" },
    true
  );
}

/* ── Admin users ──────────────────────────────────────── */

export interface ApiAdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function fetchAdminUsers() {
  return apiFetch<ApiAdminUser[]>("/admin/users", { method: "GET" }, true);
}

export function updateUserRole(userId: number, role: string) {
  return apiFetch<ApiAdminUser>(
    `/admin/users/${userId}/role`,
    { method: "PATCH", body: JSON.stringify({ role }) },
    true
  );
}
