import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "border border-line bg-white text-slate-700 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-ink"
};

export function Button({
  variant = "secondary",
  className,
  children,
  type = "button",
  ...props
}: Readonly<{
  variant?: keyof typeof variants;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
