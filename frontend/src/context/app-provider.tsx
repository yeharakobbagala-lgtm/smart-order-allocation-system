"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { User, CartItem, Product, Order, Page } from "@/lib/types";
import { pageToHref } from "@/lib/navigation";
import {
  addCartItem,
  cancelOrder as apiCancelOrder,
  createOrder,
  fetchCart,
  fetchCurrentUser,
  fetchMyOrder,
  fetchMyOrders,
  getAccessToken,
  removeCartItem,
  setAccessToken,
  setStoredUser,
  getStoredUser,
  updateCartItem,
  ApiError,
} from "@/lib/api";
import { mapApiCart, mapApiUser } from "@/lib/mappers";
import { enrichApiOrders } from "@/lib/order-enrichment";
import type { DeliveryForm } from "@/views/pages/customer/Checkout";
import { ToastContainer, useToast } from "@/components/ui";

interface AppContextValue {
  user: User | null;
  authLoading: boolean;
  cart: CartItem[];
  cartLoading: boolean;
  orders: Order[];
  confirmedOrder: Order | null;
  login: (user: User) => void;
  logout: () => void;
  refreshCart: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  addToCart: (product: Product, qty: number) => Promise<void>;
  updateQty: (cartItemId: string, qty: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  placeOrder: (form: DeliveryForm) => Promise<Order>;
  cancelCustomerOrder: (orderId: string) => Promise<void>;
  loadOrder: (orderId: string) => Promise<Order | null>;
  setConfirmedOrder: (order: Order | null) => void;
  customerOrders: Order[];
  getOrderById: (id: string) => Order | undefined;
  navigate: (page: Page, id?: string) => void;
  addToast: (
    message: string,
    type?: "success" | "error" | "info" | "warning"
  ) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const { toasts, add: addToast, remove: removeToast } = useToast();

  const navigate = useCallback(
    (page: Page, id?: string) => {
      router.push(pageToHref(page, id));
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [router]
  );

  const refreshCart = useCallback(async () => {
    if (!getAccessToken()) {
      setCart([]);
      return;
    }
    setCartLoading(true);
    try {
      const data = await fetchCart();
      setCart(mapApiCart(data));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setCart([]);
      }
    } finally {
      setCartLoading(false);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    if (!getAccessToken()) {
      setOrders([]);
      return;
    }
    try {
      const data = await fetchMyOrders();
      setOrders(await enrichApiOrders(data));
    } catch {
      /* keep existing */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      const token = getAccessToken();
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const me = await fetchCurrentUser();
        if (cancelled) return;
        const mapped = mapApiUser(me);
        setUser(mapped);
        setStoredUser(mapped);
        await Promise.all([refreshCart(), refreshOrders()]);
      } catch {
        if (cancelled) return;
        setAccessToken(null);
        setStoredUser(null);
        setUser(null);
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    }
    const cached = getStoredUser<User>();
    if (cached && getAccessToken()) setUser(cached);
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [refreshCart, refreshOrders]);

  const login = useCallback(
    (loggedUser: User) => {
      setUser(loggedUser);
      setStoredUser(loggedUser);
      void refreshCart();
      void refreshOrders();
      if (loggedUser.role === "admin") router.push("/admin");
      else router.push("/products");
      addToast(`Welcome back, ${loggedUser.name.split(" ")[0]}!`, "success");
    },
    [addToast, refreshCart, refreshOrders, router]
  );

  const logout = useCallback(() => {
    setAccessToken(null);
    setStoredUser(null);
    setUser(null);
    setCart([]);
    setOrders([]);
    setConfirmedOrder(null);
    router.push("/");
  }, [router]);

  const addToCart = useCallback(
    async (product: Product, qty: number) => {
      if (!user) {
        addToast("Please sign in to add items to your cart.", "warning");
        router.push("/login");
        return;
      }
      try {
        await addCartItem(Number(product.id), qty);
        await refreshCart();
        addToast(`${product.name} added to cart`, "success");
      } catch (err) {
        addToast(
          err instanceof Error ? err.message : "Could not add to cart.",
          "error"
        );
        throw err;
      }
    },
    [addToast, refreshCart, router, user]
  );

  const updateQty = useCallback(
    async (cartItemId: string, qty: number) => {
      try {
        await updateCartItem(Number(cartItemId), qty);
        await refreshCart();
      } catch (err) {
        addToast(
          err instanceof Error ? err.message : "Could not update cart.",
          "error"
        );
        throw err;
      }
    },
    [addToast, refreshCart]
  );

  const removeFromCart = useCallback(
    async (cartItemId: string) => {
      try {
        await removeCartItem(Number(cartItemId));
        await refreshCart();
        addToast("Item removed from cart", "info");
      } catch (err) {
        addToast(
          err instanceof Error ? err.message : "Could not remove item.",
          "error"
        );
        throw err;
      }
    },
    [addToast, refreshCart]
  );

  const placeOrder = useCallback(
    async (form: DeliveryForm) => {
      const lat = Number(form.lat);
      const lng = Number(form.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new Error("Please select a delivery location on the map.");
      }

      const deliveryAddress = [form.address.trim(), form.city.trim()]
        .filter(Boolean)
        .join(", ");

      const created = await createOrder({
        customer_name: form.name.trim(),
        phone: form.phone.trim(),
        delivery_address: deliveryAddress,
        latitude: lat,
        longitude: lng,
        order_note: form.note.trim() || null,
        payment_method: "COD",
      });

      const mapped = (
        await enrichApiOrders([created], { customerEmail: user?.email })
      )[0];

      setConfirmedOrder(mapped);
      setCart([]);
      await refreshOrders();
      addToast("Order placed successfully!", "success");
      router.push(`/orders/${mapped.id}/confirmation`);
      return mapped;
    },
    [addToast, refreshOrders, router, user?.email]
  );

  const cancelCustomerOrder = useCallback(
    async (orderId: string) => {
      const updated = await apiCancelOrder(Number(orderId));
      const mappedList = await enrichApiOrders([updated]);
      const mapped = mappedList[0];
      setOrders((prev) =>
        prev.map((o) => (o.id === String(updated.id) ? mapped : o))
      );
      addToast("Order cancelled", "success");
    },
    [addToast]
  );

  const loadOrder = useCallback(async (orderId: string) => {
    try {
      const data = await fetchMyOrder(Number(orderId));
      const mapped = (await enrichApiOrders([data]))[0];
      setOrders((prev) => {
        const exists = prev.some((o) => o.id === mapped.id);
        return exists
          ? prev.map((o) => (o.id === mapped.id ? mapped : o))
          : [mapped, ...prev];
      });
      return mapped;
    } catch {
      return null;
    }
  }, []);

  const customerOrders = useMemo(
    () => orders.filter((o) => !user || o.customerId === user.id),
    [orders, user]
  );

  const getOrderById = useCallback(
    (id: string) =>
      orders.find((o) => o.id === id) ||
      (confirmedOrder?.id === id ? confirmedOrder : undefined),
    [orders, confirmedOrder]
  );

  const value = useMemo(
    () => ({
      user,
      authLoading,
      cart,
      cartLoading,
      orders,
      confirmedOrder,
      login,
      logout,
      refreshCart,
      refreshOrders,
      addToCart,
      updateQty,
      removeFromCart,
      placeOrder,
      cancelCustomerOrder,
      loadOrder,
      setConfirmedOrder,
      customerOrders,
      getOrderById,
      navigate,
      addToast,
    }),
    [
      user,
      authLoading,
      cart,
      cartLoading,
      orders,
      confirmedOrder,
      login,
      logout,
      refreshCart,
      refreshOrders,
      addToCart,
      updateQty,
      removeFromCart,
      placeOrder,
      cancelCustomerOrder,
      loadOrder,
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
