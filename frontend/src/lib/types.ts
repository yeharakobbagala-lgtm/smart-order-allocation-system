export type UserRole = "customer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "inactive";
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  active: boolean;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  capacity: number;
  active: boolean;
  currentWorkload: number;
}

export interface StockEntry {
  branchId: string;
  productId: string;
  physical: number;
  reserved: number;
}

export type OrderStatus = "ALLOCATED" | "PROCESSING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID";

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
  /** From API when present: CURRENT | FUTURE | TEMPORARY */
  reservationType?: "TEMPORARY" | "CURRENT" | "FUTURE" | null;
  /** Restock date from API when item is FUTURE */
  restockDate?: string | null;
}

export interface AllocationDecision {
  branchId: string;
  branchName: string;
  distanceKm: number | null;
  travelTimeHours: number | null;
  stockWaitHours: number | null;
  processingTimeHours: number | null;
  etaHours: number | null;
  workloadPercentage: number | null;
  etaScore: number | null;
  workloadScore: number | null;
  finalScore: number | null;
  etaWeight: number;
  workloadWeight: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  note: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  branchId: string;
  branchName: string;
  estimatedDelivery: string;
  createdAt: string;
  allocation: AllocationDecision;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
}

export type Page =
  | "landing"
  | "login"
  | "register"
  | "products"
  | "product-details"
  | "cart"
  | "checkout"
  | "reservation"
  | "place-order"
  | "order-confirmation"
  | "my-orders"
  | "order-details"
  | "admin-dashboard"
  | "admin-orders"
  | "admin-order-details"
  | "admin-products"
  | "admin-branches"
  | "admin-stock"
  | "admin-users";

export interface AppState {
  user: User | null;
  cart: CartItem[];
  currentPage: Page;
  selectedProductId: string | null;
  selectedOrderId: string | null;
}
