"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  branchStocks as seedStocks,
  branches as seedBranches,
  orders as seedOrders,
  products as seedProducts,
} from "@/lib/mock-data";
import type {
  Branch,
  BranchStock,
  CartItem,
  DeliveryInfo,
  Order,
  OrderStatus,
  Product,
  StockReservation,
} from "@/lib/types";
import { availableStock, generateOrderNumber } from "@/lib/utils";

type CheckoutPhase =
  | "idle"
  | "allocating"
  | "reserved"
  | "expired"
  | "rechecking"
  | "review"
  | "placing"
  | "done";

interface AppContextValue {
  products: Product[];
  branches: Branch[];
  stocks: BranchStock[];
  orders: Order[];
  cart: CartItem[];
  reservation: StockReservation | null;
  checkoutPhase: CheckoutPhase;
  deliveryInfo: DeliveryInfo | null;
  allocatedBranchId: number | null;
  lastPlacedOrderId: number | null;
  addToCart: (productId: number, quantity?: number) => void;
  updateCartQty: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  getProductAvailability: (productId: number) => number;
  startCheckoutAllocation: (delivery: DeliveryInfo) => Promise<void>;
  expireReservation: () => Promise<void>;
  placeOrder: (userId: number, email: string) => Promise<Order | null>;
  cancelOrder: (orderId: number) => { ok: true } | { ok: false; error: string };
  updateOrderStatus: (orderId: number, status: OrderStatus) => void;
  upsertProduct: (product: Omit<Product, "id"> & { id?: number }) => void;
  toggleProductActive: (id: number) => void;
  upsertBranch: (branch: Omit<Branch, "id" | "currentWorkload"> & { id?: number }) => void;
  toggleBranchActive: (id: number) => void;
  updateStock: (branchId: number, productId: number, physicalStock: number) => void;
  resetCheckout: () => void;
  setCheckoutPhase: (phase: CheckoutPhase) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState(seedProducts);
  const [branches, setBranches] = useState(seedBranches);
  const [stocks, setStocks] = useState(seedStocks);
  const [orders, setOrders] = useState(seedOrders);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [reservation, setReservation] = useState<StockReservation | null>(null);
  const [checkoutPhase, setCheckoutPhase] = useState<CheckoutPhase>("idle");
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
  const [allocatedBranchId, setAllocatedBranchId] = useState<number | null>(null);
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<number | null>(null);

  const getProductAvailability = useCallback(
    (productId: number) => {
      return stocks
        .filter((s) => s.productId === productId)
        .reduce((sum, s) => sum + availableStock(s.physicalStock, s.reservedStock), 0);
    },
    [stocks]
  );

  const addToCart = useCallback((productId: number, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { productId, quantity }];
    });
  }, []);

  const updateCartQty = useCallback((productId: number, quantity: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, quantity } : i))
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => {
    const p = products.find((x) => x.id === i.productId);
    return s + (p?.price || 0) * i.quantity;
  }, 0);

  const allocateBranch = useCallback(
    (delivery: DeliveryInfo, items: CartItem[]) => {
      const eligible = branches.filter((branch) => {
        if (!branch.active) return false;
        return items.every((item) => {
          const stock = stocks.find(
            (s) => s.branchId === branch.id && s.productId === item.productId
          );
          if (!stock) return false;
          return (
            availableStock(stock.physicalStock, stock.reservedStock) >=
            item.quantity
          );
        });
      });

      if (eligible.length === 0) return null;

      const scored = eligible.map((branch) => {
        const distanceKm = haversineKm(
          delivery.latitude,
          delivery.longitude,
          branch.latitude,
          branch.longitude
        );
        const distanceScore = Math.max(0, 1 - distanceKm / 50);
        const workloadScore = Math.max(
          0,
          1 - branch.currentWorkload / branch.capacity
        );
        const finalScore = distanceScore * 0.6 + workloadScore * 0.4;
        return { branch, distanceKm, distanceScore, workloadScore, finalScore };
      });

      scored.sort((a, b) => b.finalScore - a.finalScore);
      return scored[0];
    },
    [branches, stocks]
  );

  const applyReservation = useCallback(
    (branchId: number, items: CartItem[], total: number) => {
      setStocks((prev) =>
        prev.map((s) => {
          const item = items.find(
            (i) => i.productId === s.productId && s.branchId === branchId
          );
          if (!item) return s;
          return { ...s, reservedStock: s.reservedStock + item.quantity };
        })
      );
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      setReservation({
        id: Date.now(),
        branchId,
        expiresAt,
        status: "ACTIVE",
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        totalAmount: total,
      });
      setAllocatedBranchId(branchId);
      setCheckoutPhase("reserved");
    },
    []
  );

  const releaseReservation = useCallback((res: StockReservation) => {
    setStocks((prev) =>
      prev.map((s) => {
        const item = res.items.find(
          (i) => i.productId === s.productId && s.branchId === res.branchId
        );
        if (!item) return s;
        return {
          ...s,
          reservedStock: Math.max(0, s.reservedStock - item.quantity),
        };
      })
    );
  }, []);

  const startCheckoutAllocation = useCallback(
    async (delivery: DeliveryInfo) => {
      setDeliveryInfo(delivery);
      setCheckoutPhase("allocating");
      await new Promise((r) => setTimeout(r, 1400));
      const result = allocateBranch(delivery, cart);
      if (!result) {
        setCheckoutPhase("idle");
        throw new Error(
          "No eligible branch has enough available stock for your cart."
        );
      }
      applyReservation(result.branch.id, cart, cartTotal);
    },
    [allocateBranch, applyReservation, cart, cartTotal]
  );

  const expireReservation = useCallback(async () => {
    if (!reservation || !deliveryInfo) return;
    setCheckoutPhase("expired");
    releaseReservation(reservation);
    setReservation((prev) =>
      prev ? { ...prev, status: "EXPIRED" } : prev
    );
    await new Promise((r) => setTimeout(r, 900));
    setCheckoutPhase("rechecking");
    await new Promise((r) => setTimeout(r, 1200));
    const result = allocateBranch(deliveryInfo, cart);
    if (!result) {
      setReservation(null);
      setAllocatedBranchId(null);
      setCheckoutPhase("idle");
      throw new Error(
        "Stock is no longer available. Please update your cart and try again."
      );
    }
    applyReservation(result.branch.id, cart, cartTotal);
  }, [
    allocateBranch,
    applyReservation,
    cart,
    cartTotal,
    deliveryInfo,
    releaseReservation,
    reservation,
  ]);

  const placeOrder = useCallback(
    async (userId: number, email: string) => {
      if (!deliveryInfo || !allocatedBranchId || !reservation) return null;
      setCheckoutPhase("placing");
      await new Promise((r) => setTimeout(r, 900));

      const branch = branches.find((b) => b.id === allocatedBranchId)!;
      const distanceKm = haversineKm(
        deliveryInfo.latitude,
        deliveryInfo.longitude,
        branch.latitude,
        branch.longitude
      );
      const distanceScore = Math.max(0, 1 - distanceKm / 50);
      const workloadScore = Math.max(
        0,
        1 - branch.currentWorkload / branch.capacity
      );
      const finalScore = distanceScore * 0.6 + workloadScore * 0.4;

      const nextId = Math.max(...orders.map((o) => o.id)) + 1;
      const order: Order = {
        id: nextId,
        orderNumber: generateOrderNumber(nextId),
        userId,
        customerName: deliveryInfo.customerName,
        customerEmail: email,
        phone: deliveryInfo.phone,
        deliveryAddress: deliveryInfo.deliveryAddress,
        latitude: deliveryInfo.latitude,
        longitude: deliveryInfo.longitude,
        orderNote: deliveryInfo.orderNote || undefined,
        branchId: allocatedBranchId,
        status: "ALLOCATED",
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        totalAmount: cartTotal,
        estimatedDeliveryDate: new Date(
          Date.now() + 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
        createdAt: new Date().toISOString(),
        items: cart.map((item) => {
          const product = products.find((p) => p.id === item.productId)!;
          return {
            productId: item.productId,
            productName: product.name,
            quantity: item.quantity,
            unitPrice: product.price,
          };
        }),
        allocation: {
          selectedBranchId: allocatedBranchId,
          distanceKm: Number(distanceKm.toFixed(1)),
          workload: branch.currentWorkload,
          distanceScore: Number(distanceScore.toFixed(2)),
          workloadScore: Number(workloadScore.toFixed(2)),
          finalScore: Number(finalScore.toFixed(3)),
          distanceWeight: 0.6,
          workloadWeight: 0.4,
          eligibleBranches: 2,
        },
      };

      // Convert reservation to committed stock reduction
      setStocks((prev) =>
        prev.map((s) => {
          const item = cart.find(
            (i) => i.productId === s.productId && s.branchId === allocatedBranchId
          );
          if (!item) return s;
          return {
            ...s,
            physicalStock: Math.max(0, s.physicalStock - item.quantity),
            reservedStock: Math.max(0, s.reservedStock - item.quantity),
          };
        })
      );

      setBranches((prev) =>
        prev.map((b) =>
          b.id === allocatedBranchId
            ? { ...b, currentWorkload: b.currentWorkload + 1 }
            : b
        )
      );

      setOrders((prev) => [order, ...prev]);
      setLastPlacedOrderId(order.id);
      setCart([]);
      setReservation(null);
      setCheckoutPhase("done");
      return order;
    },
    [
      allocatedBranchId,
      branches,
      cart,
      cartTotal,
      deliveryInfo,
      orders,
      products,
      reservation,
    ]
  );

  const cancelOrder = useCallback(
    (orderId: number) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return { ok: false as const, error: "Order not found." };
      if (order.status !== "ALLOCATED" && order.status !== "PROCESSING") {
        return {
          ok: false as const,
          error: "This order can no longer be cancelled.",
        };
      }
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: "CANCELLED" } : o
        )
      );
      return { ok: true as const };
    },
    [orders]
  );

  const updateOrderStatus = useCallback((orderId: number, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const paymentStatus =
          status === "DELIVERED" ? "PAID" : o.paymentStatus;
        return { ...o, status, paymentStatus };
      })
    );
  }, []);

  const upsertProduct = useCallback(
    (product: Omit<Product, "id"> & { id?: number }) => {
      if (product.id) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, ...product, id: product.id! } : p))
        );
      } else {
        const id = Math.max(...products.map((p) => p.id)) + 1;
        setProducts((prev) => [...prev, { ...product, id }]);
      }
    },
    [products]
  );

  const toggleProductActive = useCallback((id: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  }, []);

  const upsertBranch = useCallback(
    (
      branch: Omit<Branch, "id" | "currentWorkload"> & { id?: number }
    ) => {
      if (branch.id) {
        setBranches((prev) =>
          prev.map((b) =>
            b.id === branch.id
              ? { ...b, ...branch, id: branch.id!, currentWorkload: b.currentWorkload }
              : b
          )
        );
      } else {
        const id = Math.max(...branches.map((b) => b.id)) + 1;
        setBranches((prev) => [
          ...prev,
          { ...branch, id, currentWorkload: 0 },
        ]);
      }
    },
    [branches]
  );

  const toggleBranchActive = useCallback((id: number) => {
    setBranches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
    );
  }, []);

  const updateStock = useCallback(
    (branchId: number, productId: number, physicalStock: number) => {
      setStocks((prev) => {
        const existing = prev.find(
          (s) => s.branchId === branchId && s.productId === productId
        );
        if (existing) {
          return prev.map((s) =>
            s.id === existing.id
              ? {
                  ...s,
                  physicalStock,
                  reservedStock: Math.min(s.reservedStock, physicalStock),
                }
              : s
          );
        }
        return [
          ...prev,
          {
            id: Math.max(0, ...prev.map((s) => s.id)) + 1,
            branchId,
            productId,
            physicalStock,
            reservedStock: 0,
          },
        ];
      });
    },
    []
  );

  const resetCheckout = useCallback(() => {
    if (reservation?.status === "ACTIVE") releaseReservation(reservation);
    setReservation(null);
    setAllocatedBranchId(null);
    setCheckoutPhase("idle");
  }, [releaseReservation, reservation]);

  const value = useMemo(
    () => ({
      products,
      branches,
      stocks,
      orders,
      cart,
      reservation,
      checkoutPhase,
      deliveryInfo,
      allocatedBranchId,
      lastPlacedOrderId,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      cartCount,
      cartTotal,
      getProductAvailability,
      startCheckoutAllocation,
      expireReservation,
      placeOrder,
      cancelOrder,
      updateOrderStatus,
      upsertProduct,
      toggleProductActive,
      upsertBranch,
      toggleBranchActive,
      updateStock,
      resetCheckout,
      setCheckoutPhase,
    }),
    [
      products,
      branches,
      stocks,
      orders,
      cart,
      reservation,
      checkoutPhase,
      deliveryInfo,
      allocatedBranchId,
      lastPlacedOrderId,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      cartCount,
      cartTotal,
      getProductAvailability,
      startCheckoutAllocation,
      expireReservation,
      placeOrder,
      cancelOrder,
      updateOrderStatus,
      upsertProduct,
      toggleProductActive,
      upsertBranch,
      toggleBranchActive,
      updateStock,
      resetCheckout,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
