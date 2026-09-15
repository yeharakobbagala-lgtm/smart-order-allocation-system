import React, { useState, useCallback } from "react";
import type { User, CartItem, Product, Order, Page } from "./types";
import { MOCK_ORDERS } from "./data";

import { CustomerLayout } from "./components/CustomerLayout";
import { AdminLayout } from "./components/AdminLayout";
import { ToastContainer, useToast } from "./components/ui";

import { Landing } from "./pages/Landing";
import { Login, Register } from "./pages/Auth";
import { Products } from "./pages/customer/Products";
import { ProductDetails } from "./pages/customer/ProductDetails";
import { Cart } from "./pages/customer/Cart";
import { Checkout } from "./pages/customer/Checkout";
import type { DeliveryForm } from "./pages/customer/Checkout";
import { Reservation } from "./pages/customer/Reservation";
import { PlaceOrder } from "./pages/customer/PlaceOrder";
import { OrderConfirmation } from "./pages/customer/OrderConfirmation";
import { MyOrders } from "./pages/customer/MyOrders";
import { OrderDetails } from "./pages/customer/OrderDetails";

import { AdminDashboard } from "./pages/admin/Dashboard";
import { AdminOrders } from "./pages/admin/Orders";
import { AdminOrderDetails } from "./pages/admin/AdminOrderDetails";
import { AdminProducts } from "./pages/admin/Products";
import { AdminBranches } from "./pages/admin/Branches";
import { AdminStock } from "./pages/admin/Stock";
import { AdminUsers } from "./pages/admin/Users";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [page, setPage] = useState<Page>("landing");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [pendingOrderData, setPendingOrderData] = useState<{
    form: DeliveryForm;
    branchId: string;
    branchName: string;
    estimatedDelivery: string;
  } | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const { toasts, add: addToast, remove: removeToast } = useToast();

  const navigate = useCallback((newPage: Page, id?: string) => {
    if (newPage === "product-details" && id) setSelectedProductId(id);
    if ((newPage === "order-details" || newPage === "admin-order-details") && id) setSelectedOrderId(id);
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    if (loggedUser.role === "admin") {
      setPage("admin-dashboard");
    } else {
      setPage("products");
    }
    addToast(`Welcome back, ${loggedUser.name.split(" ")[0]}!`, "success");
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]);
    setPage("landing");
  };

  const handleAddToCart = (product: Product, qty: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, { product, quantity: qty }];
    });
    addToast(`${product.name} added to cart`, "success");
  };

  const handleUpdateQty = (productId: string, qty: number) => {
    setCart((prev) => prev.map((i) => i.product.id === productId ? { ...i, quantity: qty } : i));
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
    addToast("Item removed from cart", "info");
  };

  const handleCheckoutPlaceOrder = (form: DeliveryForm, branchId: string, branchName: string, estimatedDelivery: string) => {
    setPendingOrderData({ form, branchId, branchName, estimatedDelivery });
    setPage("reservation");
  };

  const handleReservationConfirm = () => {
    setPage("place-order");
  };

  const handlePlaceOrderConfirm = () => {
    if (!pendingOrderData || !user) return;
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
    setPage("order-confirmation");
    addToast("Order placed successfully!", "success");
  };

  const customerOrders = orders.filter((o) => o.customerId === user?.id);

  const currentOrder = selectedOrderId ? orders.find((o) => o.id === selectedOrderId) : null;

  // Admin pages
  const isAdmin = user?.role === "admin";
  const adminPages: Page[] = ["admin-dashboard", "admin-orders", "admin-order-details", "admin-products", "admin-branches", "admin-stock", "admin-users"];
  const isAdminPage = adminPages.includes(page);

  if (isAdminPage && isAdmin && user) {
    return (
      <>
        <AdminLayout user={user} currentPage={page} navigate={navigate} onLogout={handleLogout}>
          {page === "admin-dashboard" && <AdminDashboard orders={orders} navigate={navigate} />}
          {page === "admin-orders" && <AdminOrders orders={orders} navigate={navigate} />}
          {page === "admin-order-details" && currentOrder && <AdminOrderDetails order={currentOrder} navigate={navigate} />}
          {page === "admin-products" && <AdminProducts />}
          {page === "admin-branches" && <AdminBranches />}
          {page === "admin-stock" && <AdminStock />}
          {page === "admin-users" && <AdminUsers currentUser={user} />}
        </AdminLayout>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  if (page === "login") return <><Login onLogin={handleLogin} navigate={navigate} /><ToastContainer toasts={toasts} onRemove={removeToast} /></>;
  if (page === "register") return <><Register navigate={navigate} /><ToastContainer toasts={toasts} onRemove={removeToast} /></>;

  return (
    <>
      <CustomerLayout user={user} cart={cart} currentPage={page} navigate={navigate} onLogout={handleLogout}>
        {page === "landing" && <Landing navigate={navigate} />}
        {page === "products" && (
          <Products cart={cart} onAddToCart={handleAddToCart} navigate={navigate} />
        )}
        {page === "product-details" && selectedProductId && (
          <ProductDetails
            productId={selectedProductId}
            cart={cart}
            onAddToCart={handleAddToCart}
            navigate={navigate}
          />
        )}
        {page === "cart" && (
          <Cart cart={cart} onUpdateQty={handleUpdateQty} onRemove={handleRemoveFromCart} navigate={navigate} />
        )}
        {page === "checkout" && (
          <Checkout cart={cart} user={user} onPlaceOrder={handleCheckoutPlaceOrder} navigate={navigate} />
        )}
        {page === "reservation" && pendingOrderData && (
          <Reservation
            cart={cart}
            branchName={pendingOrderData.branchName}
            estimatedDelivery={pendingOrderData.estimatedDelivery}
            total={cart.reduce((s, i) => s + i.product.price * i.quantity, 0)}
            onConfirmOrder={handleReservationConfirm}
            navigate={navigate}
          />
        )}
        {page === "place-order" && pendingOrderData && (
          <PlaceOrder
            cart={cart}
            deliveryForm={pendingOrderData.form}
            branchName={pendingOrderData.branchName}
            estimatedDelivery={pendingOrderData.estimatedDelivery}
            total={cart.reduce((s, i) => s + i.product.price * i.quantity, 0)}
            onConfirm={handlePlaceOrderConfirm}
            navigate={navigate}
          />
        )}
        {page === "order-confirmation" && confirmedOrder && (
          <OrderConfirmation order={confirmedOrder} navigate={navigate} />
        )}
        {page === "my-orders" && (
          <MyOrders orders={customerOrders} navigate={navigate} />
        )}
        {page === "order-details" && currentOrder && (
          <OrderDetails order={currentOrder} navigate={navigate} />
        )}
      </CustomerLayout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
