import { Badge } from "@/components/ui/badge";
import type { PaymentRiskLevel } from "@/types/payment";

const riskConfig: Record<
  PaymentRiskLevel,
  { label: string; variant: "default" | "success" | "warning" | "danger" }
> = {
  low: { label: "faible", variant: "success" },
  medium: { label: "modere", variant: "warning" },
  high: { label: "eleve", variant: "danger" },
  critical: { label: "critique", variant: "danger" }
};

export function PaymentRiskBadge({ riskLevel }: { riskLevel: PaymentRiskLevel }) {
  const config = riskConfig[riskLevel];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
