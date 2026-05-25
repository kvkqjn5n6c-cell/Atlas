import { AppShell } from "@/components/app-shell/app-shell";

export default function AuthenticatedLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell>{children}</AppShell>;
}
