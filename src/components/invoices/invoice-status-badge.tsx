import { Badge } from "@/components/ui/badge";
import type { InvoiceBusinessStatus } from "@/types/invoice";

const statusConfig: Record<
  InvoiceBusinessStatus,
  { label: string; variant: "default" | "success" | "warning" | "danger" | "brand" }
> = {
  draft: { label: "brouillon", variant: "default" },
  validated: { label: "validee", variant: "brand" },
  "ready-transmission": { label: "prete transmission", variant: "warning" },
  transmitted: { label: "transmise", variant: "brand" },
  accepted: { label: "acceptee", variant: "success" },
  rejected: { label: "rejetee", variant: "danger" },
  "partially-paid": { label: "payee partiellement", variant: "warning" },
  paid: { label: "payee", variant: "success" },
  cancelled: { label: "annulee", variant: "default" }
};

export function InvoiceStatusBadge({ status }: { status: InvoiceBusinessStatus }) {
  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
