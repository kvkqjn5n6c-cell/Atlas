import type {
  CoherenceAuditDomain,
  CoherenceAuditDomainName,
  CoherenceAuditReport
} from "@/types/coherence-audit-types";

export const primarySourceDecisionDomains: CoherenceAuditDomainName[] = [
  "local_action_plans",
  "decision_journal",
  "recommendation_feedback"
];

export function isBlockingCoherenceWarning(domain: CoherenceAuditDomain) {
  return domain.status === "COUNT_MISMATCH" || domain.status === "CONTENT_MISMATCH";
}

export function getPrimarySourceCoherenceWarnings(report: CoherenceAuditReport | null) {
  if (!report) return [];

  return report.domains
    .filter((domain) => primarySourceDecisionDomains.includes(domain.domain))
    .filter(isBlockingCoherenceWarning)
    .map((domain) => ({
      domain: domain.domain,
      label: domain.label,
      status: domain.status,
      message: `${domain.label} presente un ecart ${domain.status}. La lecture est maintenue avec fallback local disponible.`
    }));
}
