import { Star } from "lucide-react";
import type { ReactNode } from "react";
import { initials, type Student } from "../lib/store";

export function Avatar({ student, size = 40 }: { student: Student; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-display font-bold text-white"
      style={{
        width: size,
        height: size,
        background: student.color,
        fontSize: size * 0.36,
      }}
      title={student.name}
    >
      {initials(student.name)}
    </div>
  );
}

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= Math.round(value) ? "fill-sun text-sun" : "text-border"}
          strokeWidth={2}
        />
      ))}
    </div>
  );
}

export function StarPicker({
  value,
  onChange,
  size = 30,
}: {
  value: number;
  onChange: (n: number) => void;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-115 active:scale-95"
          aria-label={`${n} stars`}
        >
          <Star
            size={size}
            className={n <= value ? "fill-sun text-sun" : "text-border hover:text-sun/50"}
            strokeWidth={2}
          />
        </button>
      ))}
    </div>
  );
}

const TYPE_STYLES: Record<string, string> = {
  technical: "bg-primary/10 text-primary",
  behavioral: "bg-teal/15 text-teal",
};

export function TypeBadge({ type }: { type: "technical" | "behavioral" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wide ${TYPE_STYLES[type]}`}
    >
      {type}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-border bg-card ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  const styles: Record<string, string> = {
    primary:
      "bg-primary text-primary-foreground hover:brightness-110 shadow-[3px_3px_0_0_var(--foreground)] hover:shadow-[1px_1px_0_0_var(--foreground)] hover:translate-x-0.5 hover:translate-y-0.5",
    outline: "border-2 border-foreground bg-transparent hover:bg-foreground hover:text-background",
    ghost: "hover:bg-muted text-foreground",
    danger: "border-2 border-coral text-coral hover:bg-coral hover:text-white",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 font-display text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-40 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function SectionTitle({
  kicker,
  title,
  children,
}: {
  kicker?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {kicker && (
          <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {kicker}
          </div>
        )}
        <h2 className="font-display text-2xl font-bold tracking-tight">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title: string;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border-2 border-foreground bg-card shadow-[8px_8px_0_0_var(--foreground)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="font-display text-lg font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md px-2 text-2xl leading-none text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
