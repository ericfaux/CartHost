import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from "react";
import { Search } from "lucide-react";

// Base Input
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className = "", id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="dossier-label">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              dossier-input
              ${icon ? "pl-10" : ""}
              ${error ? "border-accent-legal focus:border-accent-legal focus:ring-accent-legal" : ""}
              ${className}
            `.trim()}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-accent-legal">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-ink-muted">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

// Search Input
export interface SearchInputProps extends Omit<InputProps, "icon"> {
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="search"
        icon={<Search className="h-4 w-4" />}
        className={className}
        {...props}
      />
    );
  }
);

SearchInput.displayName = "SearchInput";

// Select
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, className = "", id, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="dossier-label">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            dossier-select
            ${error ? "border-accent-legal focus:border-accent-legal focus:ring-accent-legal" : ""}
            ${className}
          `.trim()}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-xs text-accent-legal">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-ink-muted">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

// Textarea
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const textareaId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="dossier-label">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            dossier-textarea
            ${error ? "border-accent-legal focus:border-accent-legal focus:ring-accent-legal" : ""}
            ${className}
          `.trim()}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-accent-legal">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-ink-muted">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

// Toggle/Switch
export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
  className = "",
}: ToggleProps) {
  return (
    <label
      className={`
        inline-flex items-center gap-3 cursor-pointer
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `.trim()}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-info focus-visible:ring-offset-2
          ${checked ? "bg-accent-ops" : "bg-rule"}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform
            ${checked ? "translate-x-6" : "translate-x-1"}
          `}
        />
      </button>
      {label && <span className="text-sm text-ink">{label}</span>}
    </label>
  );
}
