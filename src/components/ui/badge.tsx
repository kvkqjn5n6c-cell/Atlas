import { cn } from "@/lib/utils";

const variants = {
  default: "border-slate-200 bg-slate-50 text-slate-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-rose-200 bg-rose-50 text-rose-700",
  brand: "border-brand-100 bg-brand-50 text-brand-700"
};

export function Badge({
  variant = "default",
  className,
  children
}: Readonly<{
  variant?: keyof typeof variants;
  className?: string;
  children: React.ReactNode;
}>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
