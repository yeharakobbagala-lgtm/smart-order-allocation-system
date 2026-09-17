import type {
  CartItem,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  User,
  UserRole,
} from "@/lib/types";
import type {
  ApiCart,
  ApiOrder,
  ApiProduct,
  ApiUser,
} from "@/lib/api";

export function mapApiUser(user: ApiUser): User {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: (user.role === "admin" ? "admin" : "customer") as UserRole,
    status: "active",
    createdAt: "",
  };
}

export function mapApiProduct(product: ApiProduct): Product {
  return {
    id: String(product.id),
    name: product.name,
    description: product.description || "",
    price: Number(product.price),
    image:
      product.image ||
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&auto=format",
    category: "General",
    active: product.active,
  };
}

export function mapApiCart(cart: ApiCart): CartItem[] {
  return (cart.items || []).map((item) => ({
    cartItemId: String(item.id),
    product: {
      id: String(item.product.id),
      name: item.product.name,
      description: "",
      price: Number(item.product.price),
      image:
        item.product.image ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&auto=format",
      category: "General",
      active: true,
    },
    quantity: item.quantity,
  }));
}

export function mapApiOrder(
  order: ApiOrder,
  extras?: {
    branchName?: string;
    productNames?: Record<number, string>;
    productImages?: Record<number, string>;
    customerEmail?: string;
  }
): Order {
  const status = (order.status || "ALLOCATED") as OrderStatus;
  const paymentStatus = (order.payment_status || "PENDING") as PaymentStatus;

  return {
    id: String(order.id),
    customerId: String(order.user_id),
    customerName: order.customer_name,
    customerEmail: extras?.customerEmail || "",
    phone: order.phone,
    address: order.delivery_address,
    city: "",
    lat: order.latitude,
    lng: order.longitude,
    note: order.order_note || "",
    items: (order.order_items || []).map((item) => ({
      productId: String(item.product_id),
      productName:
        extras?.productNames?.[item.product_id] || `Product #${item.product_id}`,
      price: Number(item.unit_price),
      quantity: item.quantity,
      image:
        extras?.productImages?.[item.product_id] ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop&auto=format",
    })),
    total: Number(order.total_amount),
    status,
    paymentStatus,
    branchId: order.branch_id != null ? String(order.branch_id) : "",
    branchName:
      extras?.branchName ||
      (order.branch_id != null ? `Branch #${order.branch_id}` : "Pending"),
    estimatedDelivery: order.estimated_delivery_date || "",
    createdAt: order.created_at,
    allocation: {
      branchId: order.branch_id != null ? String(order.branch_id) : "",
      branchName:
        extras?.branchName ||
        (order.branch_id != null ? `Branch #${order.branch_id}` : "Pending"),
      distanceKm: 0,
      distanceScore: 0,
      workloadScore: 0,
      finalScore: 0,
      distanceWeight: 0.6,
      workloadWeight: 0.4,
    },
  };
}
