import { Badge } from "@/components/ui/badge";
import type { ClientRiskLevel } from "@/types/client";

const riskConfig = {
  low: { label: "faible", variant: "success" },
  medium: { label: "modere", variant: "warning" },
  high: { label: "eleve", variant: "danger" },
  critical: { label: "critique", variant: "danger" }
} as const;

export function ClientRiskBadge({ riskLevel }: { riskLevel: ClientRiskLevel }) {
  const config = riskConfig[riskLevel];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
