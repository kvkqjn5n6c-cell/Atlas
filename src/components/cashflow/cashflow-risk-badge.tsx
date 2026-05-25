import { Badge } from "@/components/ui/badge";
import type { CashflowRiskLevel } from "@/types/cashflow";

const riskConfig: Record<
  CashflowRiskLevel,
  { label: string; variant: "default" | "success" | "warning" | "danger" }
> = {
  low: { label: "faible", variant: "success" },
  medium: { label: "modere", variant: "warning" },
  high: { label: "eleve", variant: "danger" },
  critical: { label: "critique", variant: "danger" }
};

export function CashflowRiskBadge({ riskLevel }: { riskLevel: CashflowRiskLevel }) {
  const config = riskConfig[riskLevel];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
