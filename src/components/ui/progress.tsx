import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  indicatorClassName
}: Readonly<{
  value: number;
  className?: string;
  indicatorClassName?: string;
}>) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-slate-100", className)}>
      <div
        className={cn("h-full rounded-full bg-brand-600 transition-all", indicatorClassName)}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
