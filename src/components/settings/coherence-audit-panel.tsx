"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, RefreshCw, SearchCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildLocalCoherenceSnapshot } from "@/lib/audit/local-coherence-snapshot";
import { runCoherenceAuditAction } from "@/lib/actions/coherence-audit-actions";
import type { CoherenceAuditReport, CoherenceAuditStatus } from "@/types/coherence-audit-types";

const statusVariants: Record<CoherenceAuditStatus, "default" | "success" | "warning" | "danger" | "brand"> = {
  MATCH: "success",
  LOCAL_ONLY: "warning",
  PRISMA_ONLY: "warning",
  COUNT_MISMATCH: "danger",
  CONTENT_MISMATCH: "danger"
};

export function CoherenceAuditPanel() {
  const [mounted, setMounted] = useState(false);
  const [report, setReport] = useState<CoherenceAuditReport | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const localSnapshot = useMemo(() => (mounted ? buildLocalCoherenceSnapshot() : []), [mounted]);
  const localCount = localSnapshot.reduce((total, domain) => total + domain.records.length, 0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  async function runAudit() {
    setIsLoading(true);
    setMessage("");
    const snapshot = buildLocalCoherenceSnapshot();
    const result = await runCoherenceAuditAction(snapshot);
    setIsLoading(false);

    if (!result.success || !result.report) {
      setMessage(result.error ?? "Audit Local / Prisma indisponible.");
      return;
    }

    setReport(result.report);
    setMessage("Audit de coherence termine. Aucune donnee n'a ete modifiee.");
  }

  function exportReport() {
    if (!report) return;

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Rapport JSON exporte localement.");
  }

  return (
    <Card className="border-brand-100">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Cohérence Local / Prisma</CardTitle>
          <Badge>Audit uniquement</Badge>
          <Badge>Aucune correction</Badge>
          {isLoading ? <Badge>Analyse en cours</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-slate-600">
          Diagnostiquer les ecarts entre les donnees du navigateur et les donnees PostgreSQL/Prisma. L&apos;audit compare les compteurs et les identifiants, sans migration automatique.
        </p>

        {!mounted ? (
          <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
            Preparation du snapshot local.
          </p>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-md border border-line bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Snapshot local</p>
                <p className="mt-2 text-sm font-semibold text-ink">{localCount} objet(s)</p>
              </div>
              <div className="rounded-md border border-line bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Domaines</p>
                <p className="mt-2 text-sm font-semibold text-ink">{localSnapshot.length}</p>
              </div>
              <div className="rounded-md border border-line bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Score coherence</p>
                <p className="mt-2 text-sm font-semibold text-ink">{report ? `${report.summary.score}%` : "Non lance"}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void runAudit()} disabled={isLoading}>
                <SearchCheck className="h-4 w-4" aria-hidden="true" />
                Lancer l&apos;audit
              </Button>
              <Button onClick={() => void runAudit()} disabled={isLoading}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Relancer
              </Button>
              <Button onClick={exportReport} disabled={!report}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Export JSON du rapport
              </Button>
            </div>

            {message ? <p className="rounded-md border border-line bg-white p-3 text-sm text-slate-600">{message}</p> : null}

            {report ? (
              <>
                <div className="grid gap-3 md:grid-cols-5">
                  <div className="rounded-md border border-line bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">MATCH</p>
                    <p className="mt-1 text-lg font-semibold text-ink">{report.summary.matchingDomains}</p>
                  </div>
                  <div className="rounded-md border border-line bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">LOCAL_ONLY</p>
                    <p className="mt-1 text-lg font-semibold text-ink">{report.summary.localOnly}</p>
                  </div>
                  <div className="rounded-md border border-line bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">PRISMA_ONLY</p>
                    <p className="mt-1 text-lg font-semibold text-ink">{report.summary.prismaOnly}</p>
                  </div>
                  <div className="rounded-md border border-line bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">COUNT</p>
                    <p className="mt-1 text-lg font-semibold text-ink">{report.summary.countMismatches}</p>
                  </div>
                  <div className="rounded-md border border-line bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">CONTENT</p>
                    <p className="mt-1 text-lg font-semibold text-ink">{report.summary.contentMismatches}</p>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  {report.domains.map((domain) => (
                    <article key={domain.domain} className="rounded-md border border-line bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={statusVariants[domain.status]}>{domain.status}</Badge>
                        <Badge>{domain.localCount} local</Badge>
                        <Badge>{domain.prismaCount} Prisma</Badge>
                      </div>
                      <h3 className="mt-3 text-sm font-semibold text-ink">{domain.label}</h3>
                      {domain.differences.length > 0 ? (
                        <ul className="mt-2 space-y-1">
                          {domain.differences.slice(0, 4).map((difference, index) => (
                            <li key={`${domain.domain}-${difference.status}-${difference.id ?? index}`} className="text-xs leading-5 text-slate-600">
                              {difference.message}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-xs text-slate-600">Aucun ecart detecte sur les identifiants.</p>
                      )}
                    </article>
                  ))}
                </div>
              </>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
