import { Badge } from "@/components/ui/badge";
import type { ServiceResult } from "@/types/service-results";

export function TechnicalModeBadge({ result }: { result: Pick<ServiceResult<unknown>, "sourceMode" | "fallbackUsed"> }) {
  if (result.fallbackUsed) {
    return <Badge variant="warning">Fallback mock actif</Badge>;
  }

  return (
    <Badge variant={result.sourceMode === "prisma" ? "success" : "default"}>
      Mode {result.sourceMode === "prisma" ? "Prisma" : "mock"}
    </Badge>
  );
}
