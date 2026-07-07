import { forwardRef } from "react";
import { cn } from "@/utils/cn";

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div>
        <label htmlFor={inputId} className="mb-1.5 block text-xs font-medium text-paper-200/70">
          {label}
        </label>
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-paper-50 outline-none transition placeholder:text-paper-200/25 focus:border-blue-500/50",
            error && "border-signal-red/60",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-signal-red">{error}</p>}
      </div>
    );
  }
);
TextField.displayName = "TextField";
