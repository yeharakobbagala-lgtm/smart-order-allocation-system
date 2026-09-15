export type UserRole = "customer" | "admin";

export type OrderStatus =
  | "ALLOCATED"
  | "PROCESSING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID";

export type ReservationStatus = "ACTIVE" | "EXPIRED" | "CONSUMED" | "RELEASED";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "inactive";
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  active: boolean;
}

export interface Branch {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  currentWorkload: number;
  active: boolean;
}

export interface BranchStock {
  id: number;
  branchId: number;
  productId: number;
  physicalStock: number;
  reservedStock: number;
}

export interface CartItem {
  productId: number;
  quantity: number;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface AllocationDecision {
  selectedBranchId: number;
  distanceKm: number;
  workload: number;
  distanceScore: number;
  workloadScore: number;
  finalScore: number;
  distanceWeight: number;
  workloadWeight: number;
  eligibleBranches: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  customerName: string;
  customerEmail: string;
  phone: string;
  deliveryAddress: string;
  latitude: number;
  longitude: number;
  orderNote?: string;
  branchId: number;
  status: OrderStatus;
  paymentMethod: "COD";
  paymentStatus: PaymentStatus;
  totalAmount: number;
  estimatedDeliveryDate: string;
  createdAt: string;
  items: OrderItem[];
  allocation?: AllocationDecision;
}

export interface StockReservation {
  id: number;
  branchId: number;
  expiresAt: string;
  status: ReservationStatus;
  items: { productId: number; quantity: number }[];
  totalAmount: number;
}

export interface DeliveryInfo {
  customerName: string;
  phone: string;
  deliveryAddress: string;
  latitude: number;
  longitude: number;
  orderNote: string;
}
