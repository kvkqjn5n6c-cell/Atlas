import { Badge } from "@/components/ui/badge";
import { formatDataSourceStatus } from "@/lib/formatters/status-labels";
import type { DataSourceStatus } from "@/types/atlas";

const statusConfig: Record<
  DataSourceStatus,
  { label: string; variant: "default" | "success" | "warning" | "danger" | "brand" }
> = {
  connected: { label: "Connecté", variant: "success" },
  "to-check": { label: "À vérifier", variant: "warning" },
  error: { label: "erreur", variant: "danger" },
  inactive: { label: "inactif", variant: "default" }
};

export function DataSourceStatusBadge({ status }: { status: DataSourceStatus }) {
  const config = statusConfig[status];

  return <Badge variant={config.variant}>{formatDataSourceStatus(status)}</Badge>;
}
