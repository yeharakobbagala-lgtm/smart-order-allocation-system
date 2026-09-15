import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

type AlertVariant = "info" | "success" | "warning" | "danger";

const styles: Record<
  AlertVariant,
  { wrap: string; icon: React.ReactNode }
> = {
  info: {
    wrap: "border-blue-200 bg-info-soft text-blue-900",
    icon: <Info className="h-5 w-5 text-info" />,
  },
  success: {
    wrap: "border-green-200 bg-success-soft text-green-900",
    icon: <CheckCircle2 className="h-5 w-5 text-success" />,
  },
  warning: {
    wrap: "border-amber-200 bg-warning-soft text-amber-900",
    icon: <AlertTriangle className="h-5 w-5 text-warning" />,
  },
  danger: {
    wrap: "border-red-200 bg-danger-soft text-red-900",
    icon: <AlertCircle className="h-5 w-5 text-danger" />,
  },
};

export function Alert({
  variant = "info",
  title,
  children,
  onClose,
  className,
}: {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}) {
  const style = styles[variant];
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border px-4 py-3",
        style.wrap,
        className
      )}
      role="alert"
    >
      <div className="mt-0.5 shrink-0">{style.icon}</div>
      <div className="min-w-0 flex-1">
        {title ? <p className="text-sm font-semibold">{title}</p> : null}
        <div className={cn("text-sm", title && "mt-0.5 opacity-90")}>
          {children}
        </div>
      </div>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg p-1 hover:bg-black/5"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
