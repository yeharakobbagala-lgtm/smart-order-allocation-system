import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, error, options, placeholder, id, ...props },
    ref
  ) => {
    const selectId = id || props.name;
    return (
      <div className="w-full space-y-1.5">
        {label ? (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        ) : null}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "h-11 w-full appearance-none rounded-xl border bg-white px-3.5 text-sm outline-none transition focus:ring-2",
            error
              ? "border-danger focus:ring-danger/20"
              : "border-border focus:border-primary focus:ring-primary/20",
            className
          )}
          {...props}
        >
          {placeholder ? (
            <option value="">{placeholder}</option>
          ) : null}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error ? <p className="text-xs text-danger">{error}</p> : null}
      </div>
    );
  }
);

Select.displayName = "Select";
