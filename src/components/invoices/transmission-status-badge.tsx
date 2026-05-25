import { Badge } from "@/components/ui/badge";
import type { InvoiceTransmissionStatus } from "@/types/invoice";

const statusConfig: Record<
  InvoiceTransmissionStatus,
  { label: string; variant: "default" | "success" | "warning" | "danger" | "brand" }
> = {
  "not-transmitted": { label: "non transmise", variant: "default" },
  pending: { label: "en attente", variant: "warning" },
  transmitted: { label: "transmise", variant: "brand" },
  accepted: { label: "acceptee", variant: "success" },
  rejected: { label: "rejetee", variant: "danger" },
  error: { label: "erreur", variant: "danger" }
};

export function TransmissionStatusBadge({ status }: { status: InvoiceTransmissionStatus }) {
  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
