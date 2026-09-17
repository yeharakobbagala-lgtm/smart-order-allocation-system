"use client";

import React, { useState } from "react";
import type { User, Page } from "@/lib/types";
import {
  loginWithApi,
  registerUser,
  setAccessToken,
  ApiError,
} from "@/lib/api";
import { mapApiUser } from "@/lib/mappers";
import { Button, Input, Alert, IconPackage, IconEye, IconEyeOff } from "@/components/ui";

// ── Login ─────────────────────────────────────────────────────────────────────
interface LoginProps {
  onLogin: (user: User) => void;
  navigate: (page: Page) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, navigate }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const result = await loginWithApi(email, password);
      setAccessToken(result.access_token);
      onLogin(mapApiUser(result.user));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Incorrect email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#4F46E5] flex-col justify-between p-12">
        <div className="flex items-center gap-2 text-white">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <IconPackage size={16} />
          </div>
          <span className="font-display font-bold text-lg">SmartOrder</span>
        </div>
        <div>
          <h2 className="font-display text-4xl font-bold text-white mb-4">Welcome back to intelligent order fulfillment</h2>
          <p className="text-[#C7D2FE] leading-relaxed">Every order automatically routed to the best branch. Closer, faster, smarter.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[["4 Branches", "active"], ["10 min", "reservation"], ["60/40", "allocation weights"], ["Real-time", "order tracking"]].map(([v, l]) => (
            <div key={v} className="bg-white/10 rounded-2xl p-4">
              <p className="font-display font-bold text-xl text-white">{v}</p>
              <p className="text-xs text-[#C7D2FE]">{l}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center">
              <IconPackage size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-[#0F172A]">SmartOrder</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-[#0F172A] mb-1">Sign in</h1>
          <p className="text-[#64748B] mb-8">Enter your credentials to continue.</p>

          {error && <Alert variant="danger" className="mb-5">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Input
              label="Password"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              iconRight={
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-[#94A3B8] hover:text-[#64748B]">
                  {showPw ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </button>
              }
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded" />
                <span className="text-sm text-[#64748B]">Remember me</span>
              </label>
              <button type="button" className="text-sm text-[#4F46E5] hover:text-[#4338CA] font-medium">
                Forgot password?
              </button>
            </div>
            <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
              Sign in
            </Button>
          </form>

          <p className="text-sm text-center text-[#64748B] mt-6">
            Don&apos;t have an account?{" "}
            <button onClick={() => navigate("register")} className="text-[#4F46E5] hover:text-[#4338CA] font-medium">
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Register ──────────────────────────────────────────────────────────────────
interface RegisterProps {
  navigate: (page: Page) => void;
}

export const Register: React.FC<RegisterProps> = ({ navigate }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    if (!form.email.includes("@")) e.email = "Enter a valid email address.";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      setSuccess(true);
    } catch (err) {
      setErrors({
        form:
          err instanceof ApiError
            ? err.message
            : "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#ECFDF5] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h2 className="font-display text-2xl font-bold text-[#0F172A] mb-2">Account created!</h2>
          <p className="text-[#64748B] mb-6">Welcome to SmartOrder. You can now sign in with your credentials.</p>
          <Button size="lg" onClick={() => navigate("login")} className="w-full">Sign in to your account</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center">
            <IconPackage size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg text-[#0F172A]">SmartOrder</span>
        </div>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8">
          <h1 className="font-display text-2xl font-bold text-[#0F172A] mb-1">Create your account</h1>
          <p className="text-[#64748B] text-sm mb-6">All fields are required.</p>

          {errors.form && <Alert variant="danger" className="mb-4">{errors.form}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full name" placeholder="Sarah Chen" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
            <Input label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
            <Input
              label="Password"
              type={showPw ? "text" : "password"}
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
              hint="Use a mix of letters, numbers, and symbols."
              iconRight={
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-[#94A3B8] hover:text-[#64748B]">
                  {showPw ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </button>
              }
            />
            <Input
              label="Confirm password"
              type={showPw ? "text" : "password"}
              placeholder="Re-enter your password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              error={errors.confirm}
            />
            <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
              Create account
            </Button>
          </form>

          <p className="text-sm text-center text-[#64748B] mt-5">
            Already have an account?{" "}
            <button onClick={() => navigate("login")} className="text-[#4F46E5] hover:text-[#4338CA] font-medium">Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
};
