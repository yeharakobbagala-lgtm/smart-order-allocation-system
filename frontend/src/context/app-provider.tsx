"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { User, CartItem, Product, Order } from "@/lib/types";
import { MOCK_ORDERS } from "@/lib/data";
import { pageToHref } from "@/lib/navigation";
import type { DeliveryForm } from "@/views/pages/customer/Checkout";
import { ToastContainer, useToast } from "@/components/ui";

interface PendingOrderData {
  form: DeliveryForm;
  branchId: string;
  branchName: string;
  estimatedDelivery: string;
}

interface AppContextValue {
  user: User | null;
  cart: CartItem[];
  orders: Order[];
  pendingOrderData: PendingOrderData | null;
  confirmedOrder: Order | null;
  login: (user: User) => void;
  logout: () => void;
  addToCart: (product: Product, qty: number) => void;
  updateQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  checkoutPlaceOrder: (
    form: DeliveryForm,
    branchId: string,
    branchName: string,
    estimatedDelivery: string
  ) => void;
  reservationConfirm: () => void;
  placeOrderConfirm: () => Order | null;
  setConfirmedOrder: (order: Order | null) => void;
  customerOrders: Order[];
  getOrderById: (id: string) => Order | undefined;
  navigate: (page: import("@/lib/types").Page, id?: string) => void;
  addToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [pendingOrderData, setPendingOrderData] =
    useState<PendingOrderData | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const { toasts, add: addToast, remove: removeToast } = useToast();

  const navigate = useCallback(
    (page: import("@/lib/types").Page, id?: string) => {
      router.push(pageToHref(page, id));
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [router]
  );

  const login = useCallback(
    (loggedUser: User) => {
      setUser(loggedUser);
      if (loggedUser.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/products");
      }
      addToast(`Welcome back, ${loggedUser.name.split(" ")[0]}!`, "success");
    },
    [addToast, router]
  );

  const logout = useCallback(() => {
    setUser(null);
    setCart([]);
    setPendingOrderData(null);
    router.push("/");
  }, [router]);

  const addToCart = useCallback(
    (product: Product, qty: number) => {
      setCart((prev) => {
        const existing = prev.find((i) => i.product.id === product.id);
        if (existing) {
          return prev.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: i.quantity + qty }
              : i
          );
        }
        return [...prev, { product, quantity: qty }];
      });
      addToast(`${product.name} added to cart`, "success");
    },
    [addToast]
  );

  const updateQty = useCallback((productId: string, qty: number) => {
    setCart((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i))
    );
  }, []);

  const removeFromCart = useCallback(
    (productId: string) => {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
      addToast("Item removed from cart", "info");
    },
    [addToast]
  );

  const checkoutPlaceOrder = useCallback(
    (
      form: DeliveryForm,
      branchId: string,
      branchName: string,
      estimatedDelivery: string
    ) => {
      setPendingOrderData({ form, branchId, branchName, estimatedDelivery });
      router.push("/checkout/reservation");
    },
    [router]
  );

  const reservationConfirm = useCallback(() => {
    router.push("/checkout/place-order");
  }, [router]);

  const placeOrderConfirm = useCallback(() => {
    if (!pendingOrderData || !user) return null;
    const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      customerId: user.id,
      customerName: pendingOrderData.form.name || user.name,
      customerEmail: user.email,
      phone: pendingOrderData.form.phone,
      address: pendingOrderData.form.address,
      city: pendingOrderData.form.city,
      lat: Number(pendingOrderData.form.lat),
      lng: Number(pendingOrderData.form.lng),
      note: pendingOrderData.form.note,
      items: cart.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.image,
      })),
      total,
      status: "ALLOCATED",
      paymentStatus: "PENDING",
      branchId: pendingOrderData.branchId,
      branchName: pendingOrderData.branchName,
      estimatedDelivery: pendingOrderData.estimatedDelivery,
      createdAt: new Date().toISOString(),
      allocation: {
        branchId: pendingOrderData.branchId,
        branchName: pendingOrderData.branchName,
        distanceKm: 3.2,
        distanceScore: 0.88,
        workloadScore: 0.72,
        finalScore: 0.82,
        distanceWeight: 0.6,
        workloadWeight: 0.4,
      },
    };
    setOrders((prev) => [newOrder, ...prev]);
    setConfirmedOrder(newOrder);
    setCart([]);
    setPendingOrderData(null);
    addToast("Order placed successfully!", "success");
    router.push(`/orders/${newOrder.id}/confirmation`);
    return newOrder;
  }, [addToast, cart, pendingOrderData, router, user]);

  const customerOrders = useMemo(
    () => orders.filter((o) => o.customerId === user?.id),
    [orders, user?.id]
  );

  const getOrderById = useCallback(
    (id: string) => orders.find((o) => o.id === id),
    [orders]
  );

  const value = useMemo(
    () => ({
      user,
      cart,
      orders,
      pendingOrderData,
      confirmedOrder,
      login,
      logout,
      addToCart,
      updateQty,
      removeFromCart,
      checkoutPlaceOrder,
      reservationConfirm,
      placeOrderConfirm,
      setConfirmedOrder,
      customerOrders,
      getOrderById,
      navigate,
      addToast,
    }),
    [
      user,
      cart,
      orders,
      pendingOrderData,
      confirmedOrder,
      login,
      logout,
      addToCart,
      updateQty,
      removeFromCart,
      checkoutPlaceOrder,
      reservationConfirm,
      placeOrderConfirm,
      customerOrders,
      getOrderById,
      navigate,
      addToast,
    ]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
