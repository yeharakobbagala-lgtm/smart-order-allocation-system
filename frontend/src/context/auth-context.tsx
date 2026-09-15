"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DEMO_CREDENTIALS, users as seedUsers } from "@/lib/mock-data";
import type { User, UserRole } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  isHydrated: boolean;
  login: (
    email: string,
    password: string,
    remember?: boolean
  ) => Promise<{ ok: true; user: User } | { ok: false; error: string }>;
  register: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
  users: User[];
  createUser: (input: {
    name: string;
    email: string;
    role: UserRole;
  }) => { ok: true } | { ok: false; error: string };
  updateUserRole: (
    id: number,
    role: UserRole
  ) => { ok: true } | { ok: false; error: string };
  toggleUserStatus: (
    id: number
  ) => { ok: true } | { ok: false; error: string };
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "soa_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as User);
    } catch {
      /* ignore */
    }
    setIsHydrated(true);
  }, []);

  const persist = useCallback((next: User | null) => {
    setUser(next);
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const login = useCallback(
    async (email: string, password: string, remember = true) => {
      await new Promise((r) => setTimeout(r, 700));
      const normalized = email.trim().toLowerCase();
      const isCustomerDemo =
        normalized === DEMO_CREDENTIALS.customer.email &&
        password === DEMO_CREDENTIALS.customer.password;
      const isAdminDemo =
        normalized === DEMO_CREDENTIALS.admin.email &&
        password === DEMO_CREDENTIALS.admin.password;

      const found = users.find((u) => u.email.toLowerCase() === normalized);

      if (!isCustomerDemo && !isAdminDemo && !found) {
        return { ok: false as const, error: "Incorrect email or password." };
      }

      if (found && found.status === "inactive") {
        return { ok: false as const, error: "This account has been deactivated." };
      }

      const resolved =
        found ||
        users.find((u) =>
          isAdminDemo ? u.email === DEMO_CREDENTIALS.admin.email : u.email === DEMO_CREDENTIALS.customer.email
        )!;

      if (remember) persist(resolved);
      else setUser(resolved);

      return { ok: true as const, user: resolved };
    },
    [persist, users]
  );

  const register = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      await new Promise((r) => setTimeout(r, 800));
      const email = input.email.trim().toLowerCase();
      if (users.some((u) => u.email.toLowerCase() === email)) {
        return { ok: false as const, error: "An account with this email already exists." };
      }
      if (input.password.length < 8) {
        return { ok: false as const, error: "Password must be at least 8 characters." };
      }
      const next: User = {
        id: Math.max(...users.map((u) => u.id)) + 1,
        name: input.name.trim(),
        email,
        role: "customer",
        status: "active",
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, next]);
      persist(next);
      return { ok: true as const };
    },
    [persist, users]
  );

  const logout = useCallback(() => persist(null), [persist]);

  const createUser = useCallback(
    (input: { name: string; email: string; role: UserRole }) => {
      const email = input.email.trim().toLowerCase();
      if (users.some((u) => u.email.toLowerCase() === email)) {
        return { ok: false as const, error: "Email already in use." };
      }
      const next: User = {
        id: Math.max(...users.map((u) => u.id)) + 1,
        name: input.name.trim(),
        email,
        role: input.role,
        status: "active",
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, next]);
      return { ok: true as const };
    },
    [users]
  );

  const updateUserRole = useCallback(
    (id: number, role: UserRole) => {
      const target = users.find((u) => u.id === id);
      if (!target) return { ok: false as const, error: "User not found." };
      if (target.role === "admin" && role === "customer") {
        const adminCount = users.filter(
          (u) => u.role === "admin" && u.status === "active"
        ).length;
        if (adminCount <= 1) {
          return {
            ok: false as const,
            error: "Cannot demote the last active administrator.",
          };
        }
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role } : u))
      );
      return { ok: true as const };
    },
    [users]
  );

  const toggleUserStatus = useCallback(
    (id: number) => {
      const target = users.find((u) => u.id === id);
      if (!target) return { ok: false as const, error: "User not found." };
      if (target.role === "admin" && target.status === "active") {
        const adminCount = users.filter(
          (u) => u.role === "admin" && u.status === "active"
        ).length;
        if (adminCount <= 1) {
          return {
            ok: false as const,
            error: "Cannot deactivate the last active administrator.",
          };
        }
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? { ...u, status: u.status === "active" ? "inactive" : "active" }
            : u
        )
      );
      return { ok: true as const };
    },
    [users]
  );

  const value = useMemo(
    () => ({
      user,
      isHydrated,
      login,
      register,
      logout,
      users,
      createUser,
      updateUserRole,
      toggleUserStatus,
    }),
    [
      user,
      isHydrated,
      login,
      register,
      logout,
      users,
      createUser,
      updateUserRole,
      toggleUserStatus,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
