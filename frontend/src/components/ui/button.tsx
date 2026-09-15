import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover shadow-sm disabled:bg-indigo-300",
  secondary:
    "bg-primary-soft text-primary hover:bg-indigo-100 disabled:opacity-60",
  outline:
    "border border-border bg-white text-foreground hover:bg-slate-50 disabled:opacity-60",
  ghost: "bg-transparent text-muted hover:bg-slate-100 hover:text-foreground",
  danger: "bg-danger text-white hover:bg-red-700 disabled:bg-red-300",
  success: "bg-success text-white hover:bg-green-700 disabled:bg-green-300",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-lg gap-1.5",
  md: "h-11 px-4 text-sm rounded-xl gap-2",
  lg: "h-12 px-5 text-base rounded-xl gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      fullWidth,
      children,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin-slow" /> : null}
      {children}
    </button>
  )
);

Button.displayName = "Button";
