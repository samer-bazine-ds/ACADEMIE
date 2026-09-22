import { ReactNode } from "react";
import { X, LoaderCircle } from "lucide-react";
export const Button = ({
  children,
  variant = "primary",
  className = "",
  ...p
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 ${variant === "primary" ? "bg-brand-600 text-white shadow-[0_8px_20px_rgba(16,110,86,.2)] hover:-translate-y-0.5 hover:bg-brand-700" : variant === "secondary" ? "border border-black/[.09] bg-white text-ink shadow-sm hover:-translate-y-0.5 hover:border-brand-500/30 hover:shadow-md" : variant === "danger" ? "bg-red-50 text-red-600 hover:bg-red-100" : "hover:bg-black/[.05]"} ${className}`}
    {...p}
  >
    {children}
  </button>
);
export const Card = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-[20px] border border-white/80 bg-white/95 shadow-[0_10px_35px_rgba(30,45,39,.07)] ring-1 ring-black/[.035] ${className}`}
  >
    {children}
  </div>
);
export const Badge = ({
  children,
  tone = "green",
}: {
  children: ReactNode;
  tone?: "green" | "red" | "blue" | "gray" | "amber";
}) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone === "green" ? "bg-emerald-50 text-emerald-700" : tone === "red" ? "bg-red-50 text-red-600" : tone === "blue" ? "bg-blue-50 text-blue-700" : tone === "amber" ? "bg-amber-50 text-amber-700" : "bg-stone-100 text-stone-600"}`}
  >
    {children}
  </span>
);
export const Avatar = ({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) => (
  <div
    className={`grid shrink-0 place-items-center rounded-xl bg-brand-100 font-bold text-brand-700 ${size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-14 w-14 text-lg" : "h-10 w-10 text-sm"}`}
  >
    {name
      .split(" ")
      .map((x) => x[0])
      .join("")
      .slice(0, 2)}
  </div>
);
export const Field = ({
  label,
  ...p
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <label className="grid gap-1.5 text-sm font-medium text-stone-700">
    {label}
    <input
      className="h-11 rounded-xl border border-black/[.09] bg-white px-3 shadow-sm outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
      {...p}
    />
  </label>
);
export const Select = ({
  label,
  children,
  ...p
}: {
  label: string;
  children: ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <label className="grid gap-1.5 text-sm font-medium text-stone-700">
    {label}
    <select
      className="h-11 rounded-xl border border-black/10 bg-white px-3 outline-none focus:border-brand-500"
      {...p}
    >
      {children}
    </select>
  </label>
);
export const Modal = ({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) =>
  !open ? null : (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-2 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={onClose}
    >
      <div
        className="my-2 max-h-[calc(100dvh-1rem)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-2xl bg-white p-4 shadow-2xl sm:my-0 sm:max-h-[calc(100dvh-2rem)] sm:p-6"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="sticky -top-4 z-10 mb-4 flex items-center justify-between border-b border-black/[.06] bg-white py-3 sm:-top-6 sm:mb-5 sm:py-4">
          <h2 className="pr-3 font-display text-lg font-bold leading-tight sm:text-xl">
            {title}
          </h2>
          <button
            className="shrink-0 rounded-lg p-2 hover:bg-stone-100"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
export const Spinner = () => (
  <div className="grid min-h-[40vh] place-items-center">
    <LoaderCircle className="animate-spin text-brand-600" />
  </div>
);
