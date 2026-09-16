"use client";

import React, { useState, useEffect, useRef } from "react";

// ── Button ────────────────────────────────────────────────────────────────────
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading,
  icon,
  iconRight,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-[10px] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer select-none";
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-[#4F46E5] text-white hover:bg-[#4338CA] focus-visible:ring-[#4F46E5] shadow-sm",
    secondary: "bg-[#F1F5F9] text-[#334155] hover:bg-[#E2E8F0] focus-visible:ring-[#4F46E5]",
    ghost: "bg-transparent text-[#64748B] hover:bg-[#F1F5F9] focus-visible:ring-[#4F46E5]",
    danger: "bg-[#EF4444] text-white hover:bg-[#DC2626] focus-visible:ring-[#EF4444] shadow-sm",
    success: "bg-[#10B981] text-white hover:bg-[#059669] focus-visible:ring-[#10B981] shadow-sm",
    outline: "border border-[#E2E8F0] bg-white text-[#334155] hover:bg-[#F8FAFC] focus-visible:ring-[#4F46E5]",
  };
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${disabled || loading ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
};

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner: React.FC<{ size?: "sm" | "md" | "lg"; className?: string }> = ({ size = "md", className = "" }) => {
  const sizes = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" };
  return (
    <svg className={`${sizes[size]} animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
};

// ── Input ─────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, hint, icon, iconRight, className = "", id, ...props }) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#334155]">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">{icon}</span>}
        <input
          id={inputId}
          className={`w-full rounded-[10px] border px-3 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] transition-colors bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] disabled:opacity-60 disabled:cursor-not-allowed ${icon ? "pl-9" : ""} ${iconRight ? "pr-9" : ""} ${error ? "border-[#EF4444] focus:ring-[#EF4444]/30" : "border-[#E2E8F0]"} ${className}`}
          {...props}
        />
        {iconRight && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">{iconRight}</span>}
      </div>
      {error && <p className="text-xs text-[#EF4444] flex items-center gap-1"><IconAlert size={12} />{error}</p>}
      {hint && !error && <p className="text-xs text-[#94A3B8]">{hint}</p>}
    </div>
  );
};

// ── Textarea ──────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, hint, className = "", id, ...props }) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={inputId} className="text-sm font-medium text-[#334155]">{label}</label>}
      <textarea
        id={inputId}
        className={`w-full rounded-[10px] border px-3 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] transition-colors bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] resize-none ${error ? "border-[#EF4444]" : "border-[#E2E8F0]"} ${className}`}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-[#EF4444]">{error}</p>}
      {hint && !error && <p className="text-xs text-[#94A3B8]">{hint}</p>}
    </div>
  );
};

// ── Select ────────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, error, options, className = "", id, ...props }) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={inputId} className="text-sm font-medium text-[#334155]">{label}</label>}
      <div className="relative">
        <select
          id={inputId}
          className={`w-full appearance-none rounded-[10px] border px-3 py-2.5 pr-8 text-sm text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] ${error ? "border-[#EF4444]" : "border-[#E2E8F0]"} ${className}`}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
        </span>
      </div>
      {error && <p className="text-xs text-[#EF4444]">{error}</p>}
    </div>
  );
};

// ── Card ──────────────────────────────────────────────────────────────────────
export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = "", onClick }) => (
  <div
    className={`bg-white rounded-xl border border-[#E2E8F0] shadow-sm ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

// ── Badge ─────────────────────────────────────────────────────────────────────
type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "muted";

export const Badge: React.FC<{ variant?: BadgeVariant; children: React.ReactNode; className?: string }> = ({ variant = "default", children, className = "" }) => {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-[#EEF2FF] text-[#4338CA]",
    success: "bg-[#ECFDF5] text-[#065F46]",
    warning: "bg-[#FFFBEB] text-[#92400E]",
    danger: "bg-[#FEF2F2] text-[#991B1B]",
    info: "bg-[#EFF6FF] text-[#1E40AF]",
    muted: "bg-[#F1F5F9] text-[#475569]",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { label: string; variant: BadgeVariant; dot: string }> = {
    ALLOCATED: { label: "Allocated", variant: "info", dot: "bg-blue-400" },
    PROCESSING: { label: "Processing", variant: "warning", dot: "bg-amber-400" },
    OUT_FOR_DELIVERY: { label: "Out for Delivery", variant: "default", dot: "bg-indigo-400" },
    DELIVERED: { label: "Delivered", variant: "success", dot: "bg-emerald-400" },
    CANCELLED: { label: "Cancelled", variant: "danger", dot: "bg-red-400" },
    PENDING: { label: "Pending", variant: "warning", dot: "bg-amber-400" },
    PAID: { label: "Paid", variant: "success", dot: "bg-emerald-400" },
    active: { label: "Active", variant: "success", dot: "bg-emerald-400" },
    inactive: { label: "Inactive", variant: "muted", dot: "bg-slate-400" },
    customer: { label: "Customer", variant: "info", dot: "bg-blue-400" },
    admin: { label: "Admin", variant: "default", dot: "bg-indigo-400" },
  };
  const config = map[status] || { label: status, variant: "muted" as BadgeVariant, dot: "bg-slate-400" };
  return (
    <Badge variant={config.variant}>
      <span className={`w-1.5 h-1.5 rounded-full inline-block ${config.dot}`} />
      {config.label}
    </Badge>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, size = "md" }) => {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;
  const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} animate-fade-in max-h-[90vh] flex flex-col`}>
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
            <h2 className="font-display text-lg font-bold text-[#0F172A]">{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#334155] transition-colors">
              <IconX size={18} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
};

// ── Alert ─────────────────────────────────────────────────────────────────────
type AlertVariant = "info" | "success" | "warning" | "danger";

export const Alert: React.FC<{ variant?: AlertVariant; title?: string; children: React.ReactNode; className?: string }> = ({ variant = "info", title, children, className = "" }) => {
  const variants: Record<AlertVariant, { bg: string; text: string; icon: React.ReactNode }> = {
    info: { bg: "bg-[#EFF6FF] border-[#BFDBFE]", text: "text-[#1E40AF]", icon: <IconInfo size={16} /> },
    success: { bg: "bg-[#ECFDF5] border-[#A7F3D0]", text: "text-[#065F46]", icon: <IconCheck size={16} /> },
    warning: { bg: "bg-[#FFFBEB] border-[#FDE68A]", text: "text-[#92400E]", icon: <IconAlert size={16} /> },
    danger: { bg: "bg-[#FEF2F2] border-[#FECACA]", text: "text-[#991B1B]", icon: <IconAlert size={16} /> },
  };
  const v = variants[variant];
  return (
    <div className={`rounded-xl border p-4 ${v.bg} ${v.text} ${className}`}>
      <div className="flex gap-3">
        <span className="mt-0.5 shrink-0">{v.icon}</span>
        <div className="flex-1">
          {title && <p className="font-semibold mb-1">{title}</p>}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
};

// ── Toast ─────────────────────────────────────────────────────────────────────
export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

export const ToastContainer: React.FC<{ toasts: ToastMessage[]; onRemove: (id: string) => void }> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
};

const Toast: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const styles: Record<string, string> = {
    success: "bg-[#065F46] text-white",
    error: "bg-[#991B1B] text-white",
    info: "bg-[#1E40AF] text-white",
    warning: "bg-[#92400E] text-white",
  };
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-fade-in ${styles[toast.type]}`}>
      <span className="text-sm font-medium flex-1">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="opacity-70 hover:opacity-100">
        <IconX size={14} />
      </button>
    </div>
  );
};

// ── Empty State ───────────────────────────────────────────────────────────────
export const EmptyState: React.FC<{ icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
    {icon && <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] flex items-center justify-center text-[#94A3B8] mb-2">{icon}</div>}
    <h3 className="font-display font-bold text-[#0F172A] text-lg">{title}</h3>
    {description && <p className="text-sm text-[#64748B] max-w-xs">{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

// ── Loading State ─────────────────────────────────────────────────────────────
export const LoadingState: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
    <Spinner size="lg" className="text-[#4F46E5]" />
    <p className="text-sm text-[#64748B]">{message}</p>
  </div>
);

// ── Skeleton ──────────────────────────────────────────────────────────────────
export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`bg-[#F1F5F9] rounded-lg animate-pulse ${className}`} />
);

// ── Tabs ──────────────────────────────────────────────────────────────────────
export const Tabs: React.FC<{ tabs: { key: string; label: string; count?: number }[]; active: string; onChange: (key: string) => void }> = ({ tabs, active, onChange }) => (
  <div className="flex gap-1 bg-[#F1F5F9] p-1 rounded-xl overflow-x-auto">
    {tabs.map((t) => (
      <button
        key={t.key}
        onClick={() => onChange(t.key)}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${active === t.key ? "bg-white text-[#0F172A] shadow-sm" : "text-[#64748B] hover:text-[#334155]"}`}
      >
        {t.label}
        {t.count !== undefined && (
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${active === t.key ? "bg-[#4F46E5] text-white" : "bg-[#E2E8F0] text-[#64748B]"}`}>
            {t.count}
          </span>
        )}
      </button>
    ))}
  </div>
);

// ── Divider ───────────────────────────────────────────────────────────────────
export const Divider: React.FC<{ className?: string }> = ({ className = "" }) => (
  <hr className={`border-[#E2E8F0] ${className}`} />
);

// ── Score Bar ─────────────────────────────────────────────────────────────────
export const ScoreBar: React.FC<{ value: number; max?: number; color?: string }> = ({ value, max = 1, color = "#4F46E5" }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${(value / max) * 100}%`, backgroundColor: color }} />
    </div>
    <span className="font-mono-data text-xs text-[#64748B] w-8 text-right">{(value * 100).toFixed(0)}%</span>
  </div>
);

// ── Quantity Selector ─────────────────────────────────────────────────────────
export const QuantitySelector: React.FC<{ value: number; onChange: (v: number) => void; min?: number; max?: number }> = ({ value, onChange, min = 1, max = 99 }) => (
  <div className="flex items-center gap-0">
    <button
      onClick={() => onChange(Math.max(min, value - 1))}
      className="w-8 h-8 flex items-center justify-center rounded-l-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#334155] hover:bg-[#F1F5F9] transition-colors"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14" /></svg>
    </button>
    <div className="w-10 h-8 flex items-center justify-center border-t border-b border-[#E2E8F0] text-sm font-medium text-[#0F172A] bg-white">
      {value}
    </div>
    <button
      onClick={() => onChange(Math.min(max, value + 1))}
      className="w-8 h-8 flex items-center justify-center rounded-r-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#334155] hover:bg-[#F1F5F9] transition-colors"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
    </button>
  </div>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
export const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; color?: string; change?: string }> = ({ label, value, icon, color = "#4F46E5", change }) => (
  <Card className="p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-[#64748B] font-medium">{label}</p>
        <p className="font-display text-2xl font-bold text-[#0F172A] mt-1">{value}</p>
        {change && <p className="text-xs text-[#10B981] mt-1 font-medium">{change}</p>}
      </div>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15`, color }}>
        {icon}
      </div>
    </div>
  </Card>
);

// ── Order Timeline ────────────────────────────────────────────────────────────
export const OrderTimeline: React.FC<{ status: string }> = ({ status }) => {
  const isCancelled = status === "CANCELLED";
  const steps = isCancelled
    ? [
        { key: "ALLOCATED", label: "Allocated" },
        { key: "CANCELLED", label: "Cancelled" },
      ]
    : [
        { key: "ALLOCATED", label: "Allocated" },
        { key: "PROCESSING", label: "Processing" },
        { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
        { key: "DELIVERED", label: "Delivered" },
      ];

  const order = ["ALLOCATED", "PROCESSING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];
  const currentIndex = order.indexOf(status);

  return (
    <div className="flex items-start gap-0">
      {steps.map((step, i) => {
        const stepIndex = order.indexOf(step.key);
        const isDone = stepIndex <= currentIndex;
        const isCurrent = step.key === status;
        const isLast = i === steps.length - 1;
        return (
          <div key={step.key} className="flex-1 flex flex-col items-center">
            <div className="flex items-center w-full">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border-2 transition-all ${
                isCurrent && isCancelled ? "bg-[#FEF2F2] border-[#EF4444] text-[#EF4444]"
                : isDone ? "bg-[#4F46E5] border-[#4F46E5] text-white"
                : "bg-white border-[#E2E8F0] text-[#94A3B8]"
              }`}>
                {isDone && !isCurrent ? <IconCheck size={14} /> : i + 1}
              </div>
              {!isLast && (
                <div className={`flex-1 h-0.5 ${isDone && !isCurrent ? "bg-[#4F46E5]" : "bg-[#E2E8F0]"}`} />
              )}
            </div>
            <p className={`text-xs mt-2 text-center font-medium ${isCurrent ? (isCancelled ? "text-[#EF4444]" : "text-[#4F46E5]") : isDone ? "text-[#10B981]" : "text-[#94A3B8]"}`}>
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
};

// ── Checkout Allocation Widget ────────────────────────────────────────────────
export const AllocationWidget: React.FC<{ state: "idle" | "loading" | "success" | "error"; branchName?: string; estimatedDelivery?: string }> = ({ state, branchName, estimatedDelivery }) => {
  if (state === "idle") return null;
  if (state === "loading") {
    return (
      <div className="rounded-xl border-2 border-dashed border-[#C7D2FE] bg-[#EEF2FF] p-6 flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#4F46E5]/10 flex items-center justify-center">
          <Spinner size="md" className="text-[#4F46E5]" />
        </div>
        <div className="text-center">
          <p className="font-display font-semibold text-[#4338CA]">Finding the best branch&hellip;</p>
          <p className="text-sm text-[#6366F1] mt-1">Checking availability and distance across all branches</p>
        </div>
        <div className="flex gap-2 mt-1">
          {["Checking stock", "Scoring branches", "Selecting best match"].map((s, i) => (
            <span key={i} className="text-xs bg-white border border-[#C7D2FE] text-[#4338CA] px-2 py-1 rounded-full">{s}</span>
          ))}
        </div>
      </div>
    );
  }
  if (state === "success") {
    return (
      <div className="rounded-xl border-2 border-[#A7F3D0] bg-[#ECFDF5] p-6 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center shrink-0">
            <IconCheck size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-display font-bold text-[#065F46]">Branch allocated successfully</p>
            <p className="text-sm text-[#047857] mt-0.5">Best available branch selected automatically</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="bg-white/70 rounded-lg p-3">
                <p className="text-xs text-[#64748B] mb-0.5">Selected Branch</p>
                <p className="font-semibold text-[#0F172A] text-sm">{branchName}</p>
              </div>
              <div className="bg-white/70 rounded-lg p-3">
                <p className="text-xs text-[#64748B] mb-0.5">Estimated Delivery</p>
                <p className="font-semibold text-[#0F172A] text-sm">{estimatedDelivery}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (state === "error") {
    return (
      <Alert variant="danger" title="No branch available">
        Unfortunately, no branch has sufficient stock to fulfill your order. Please remove some items or try again later.
      </Alert>
    );
  }
  return null;
};

// ── Countdown Timer ───────────────────────────────────────────────────────────
export const CountdownTimer: React.FC<{ seconds: number; total?: number }> = ({ seconds, total = 600 }) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = seconds / total;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  const color = seconds > 120 ? "#10B981" : seconds > 30 ? "#F59E0B" : "#EF4444";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#F1F5F9" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={radius} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-2xl" style={{ color }}>{`${mins}:${secs.toString().padStart(2, "0")}`}</span>
          <span className="text-xs text-[#94A3B8]">remaining</span>
        </div>
      </div>
    </div>
  );
};

// ── Icons ─────────────────────────────────────────────────────────────────────
type IconProps = { size?: number; className?: string };
const iconProps = (size = 18, className?: string) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className });

export const IconSearch: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>;
export const IconCart: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>;
export const IconX: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
export const IconCheck: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><polyline points="20 6 9 17 4 12" /></svg>;
export const IconAlert: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
export const IconInfo: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>;
export const IconMenu: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
export const IconChevronRight: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><polyline points="9 18 15 12 9 6" /></svg>;
export const IconChevronDown: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><polyline points="6 9 12 15 18 9" /></svg>;
export const IconPackage: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;
export const IconUsers: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>;
export const IconBranch: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
export const IconBarChart: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg>;
export const IconSettings: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>;
export const IconLogout: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
export const IconEdit: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
export const IconPlus: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
export const IconEye: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
export const IconEyeOff: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>;
export const IconTruck: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>;
export const IconMapPin: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>;
export const IconCalendar: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
export const IconStar: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)} fill="#F59E0B" stroke="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
export const IconInventory: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>;
export const IconFilter: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>;
export const IconRefresh: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>;
export const IconArrowLeft: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>;
export const IconBolt: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)} fill="currentColor" stroke="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>;
export const IconShield: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
export const IconClock: React.FC<IconProps> = ({ size = 18, className }) => <svg {...iconProps(size, className)}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;

// ── useToast hook ─────────────────────────────────────────────────────────────
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const add = (message: string, type: ToastMessage["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
  };
  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));
  return { toasts, add, remove };
};
