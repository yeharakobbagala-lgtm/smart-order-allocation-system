import { cn } from "@/lib/utils";

type BadgeVariant =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "primary";

const styles: Record<BadgeVariant, string> = {
  neutral: "bg-slate-100 text-slate-700",
  info: "bg-info-soft text-info",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  primary: "bg-primary-soft text-primary",
};

export function Badge({
  children,
  variant = "neutral",
  className,
  dot,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        styles[variant],
        className
      )}
    >
      {dot ? (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      ) : null}
      {children}
    </span>
  );
}
