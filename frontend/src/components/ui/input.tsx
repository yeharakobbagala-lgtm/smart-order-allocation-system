import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, rightElement, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full space-y-1.5">
        {label ? (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        ) : null}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-foreground placeholder:text-slate-400 outline-none transition focus:ring-2",
              error
                ? "border-danger focus:ring-danger/20"
                : "border-border focus:border-primary focus:ring-primary/20",
              rightElement && "pr-11",
              className
            )}
            {...props}
          />
          {rightElement ? (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {rightElement}
            </div>
          ) : null}
        </div>
        {error ? <p className="text-xs text-danger">{error}</p> : null}
        {!error && hint ? <p className="text-xs text-muted">{hint}</p> : null}
      </div>
    );
  }
);

Input.displayName = "Input";
