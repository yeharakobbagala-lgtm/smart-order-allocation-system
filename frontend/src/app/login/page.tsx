"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Card, CardBody } from "@/components/ui/card";
import { DEMO_CREDENTIALS } from "@/lib/mock-data";

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: typeof fieldErrors = {};
    if (!email.trim()) nextErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      nextErrors.email = "Enter a valid email.";
    if (!password) nextErrors.password = "Password is required.";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    setError("");
    const result = await login(email, password, remember);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    toast({ title: "Welcome back", tone: "success" });
    router.push(result.user.role === "admin" ? "/admin" : "/products");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-muted">
          Access your customer account or admin console
        </p>
      </div>

      <Card>
        <CardBody>
          <form className="space-y-4" onSubmit={onSubmit}>
            {error ? (
              <Alert variant="danger" title="Login failed">
                {error}
              </Alert>
            ) : null}

            <Input
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
              placeholder="you@example.com"
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              placeholder="••••••••"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-muted hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />

            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary"
                />
                Remember me
              </label>
              <button
                type="button"
                className="text-sm font-medium text-primary hover:underline"
                onClick={() =>
                  toast({
                    title: "Password reset",
                    description: "Prototype only — contact an administrator.",
                    tone: "info",
                  })
                }
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Login
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-primary">
              Register
            </Link>
          </p>

          <div className="mt-5 rounded-xl bg-slate-50 p-3 text-xs text-muted">
            <p className="font-semibold text-slate-700">Demo accounts</p>
            <p className="mt-1">
              Customer: {DEMO_CREDENTIALS.customer.email} /{" "}
              {DEMO_CREDENTIALS.customer.password}
            </p>
            <p>
              Admin: {DEMO_CREDENTIALS.admin.email} /{" "}
              {DEMO_CREDENTIALS.admin.password}
            </p>
          </div>
        </CardBody>
      </Card>
    </main>
  );
}
