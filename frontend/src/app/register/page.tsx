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

export default function RegisterPage() {
  const { register } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Full name is required.";
    if (!email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Enter a valid email.";
    if (password.length < 8)
      next.password = "Password must be at least 8 characters.";
    if (password !== confirm) next.confirm = "Passwords do not match.";
    setFieldErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    setError("");
    const result = await register({ name, email, password });
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    toast({
      title: "Account created",
      description: "You're registered as a customer.",
      tone: "success",
    });
    router.push("/products");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="mt-1 text-sm text-muted">
          New accounts are registered as customers automatically
        </p>
      </div>

      <Card>
        <CardBody>
          <form className="space-y-4" onSubmit={onSubmit}>
            {error ? (
              <Alert variant="danger" title="Registration failed">
                {error}
              </Alert>
            ) : null}

            <Input
              label="Full name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={fieldErrors.name}
              placeholder="Your full name"
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              hint="At least 8 characters"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-muted hover:text-foreground"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />
            <Input
              label="Confirm password"
              type={showPassword ? "text" : "password"}
              name="confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={fieldErrors.confirm}
            />

            <Button type="submit" fullWidth loading={loading}>
              Create account
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary">
              Login
            </Link>
          </p>
        </CardBody>
      </Card>
    </main>
  );
}
