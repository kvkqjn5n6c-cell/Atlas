import { Badge } from "@/components/ui/badge";
import { formatDataQuality } from "@/lib/formatters/status-labels";
import type { KPIDataQuality } from "@/types/atlas";

const qualityConfig: Record<KPIDataQuality, { label: string; variant: "success" | "warning" | "danger" | "default" }> = {
  reliable: { label: "Fiable", variant: "success" },
  partial: { label: "Partielle", variant: "warning" },
  outdated: { label: "Obsolète", variant: "warning" },
  error: { label: "En erreur", variant: "danger" }
};

export function KpiDataQualityBadge({ quality }: { quality: KPIDataQuality }) {
  const config = qualityConfig[quality];

  return <Badge variant={config.variant}>{formatDataQuality(quality)}</Badge>;
}
