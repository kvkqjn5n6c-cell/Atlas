import { cn } from "@/lib/utils";

export function Card({
  className,
  children
}: Readonly<{
  className?: string;
  children: React.ReactNode;
}>) {
  return (
    <section className={cn("rounded-lg border border-line bg-white shadow-soft", className)}>
      {children}
    </section>
  );
}

export function CardHeader({
  className,
  children
}: Readonly<{
  className?: string;
  children: React.ReactNode;
}>) {
  return <div className={cn("p-5 pb-3", className)}>{children}</div>;
}

export function CardContent({
  className,
  children
}: Readonly<{
  className?: string;
  children: React.ReactNode;
}>) {
  return <div className={cn("p-5 pt-2", className)}>{children}</div>;
}

export function CardTitle({
  className,
  children
}: Readonly<{
  className?: string;
  children: React.ReactNode;
}>) {
  return <h2 className={cn("text-base font-semibold text-ink", className)}>{children}</h2>;
}
