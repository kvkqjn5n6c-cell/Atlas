import { Badge } from "@/components/ui/badge";
import type { PaymentStatus } from "@/types/payment";

const statusConfig: Record<
  PaymentStatus,
  { label: string; variant: "default" | "success" | "warning" | "danger" | "brand" }
> = {
  pending: { label: "en attente", variant: "warning" },
  partial: { label: "partiel", variant: "warning" },
  paid: { label: "paye", variant: "success" },
  late: { label: "en retard", variant: "danger" },
  cancelled: { label: "annule", variant: "default" }
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
