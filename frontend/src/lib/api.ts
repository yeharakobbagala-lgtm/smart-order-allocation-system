const TOKEN_KEY = "soa_access_token";

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

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  auth = false
): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error("API URL is not configured. Set NEXT_PUBLIC_API_URL.");
  }

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = getAccessToken();
    if (!token) {
      throw new Error("You must be signed in as an admin to perform this action.");
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${base}${path}`, { ...options, headers });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const data = (await res.json()) as { detail?: string };
      if (typeof data.detail === "string") detail = data.detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export interface ApiAdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface ApiBranch {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  active: boolean;
}

export interface ApiLoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export function fetchAdminUsers() {
  return apiFetch<ApiAdminUser[]>("/admin/users", { method: "GET" }, true);
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

export function loginWithApi(email: string, password: string) {
  return apiFetch<ApiLoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
