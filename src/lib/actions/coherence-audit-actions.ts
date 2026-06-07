"use server";

import { runCoherenceAudit } from "@/lib/audit/coherence-audit.service";
import type { CoherenceAuditSnapshotDomain } from "@/types/coherence-audit-types";

export async function runCoherenceAuditAction(localSnapshot: CoherenceAuditSnapshotDomain[]) {
  try {
    const report = await runCoherenceAudit(localSnapshot);
    return {
      success: true,
      report
    };
  } catch (error) {
    return {
      success: false,
      report: null,
      error: error instanceof Error ? error.message : "Audit coherence Local / Prisma impossible."
    };
  }
}
