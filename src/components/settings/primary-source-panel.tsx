"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Database, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { runCoherenceAuditAction } from "@/lib/actions/coherence-audit-actions";
import { getPrimarySourceSettingsAction } from "@/lib/actions/hybrid-read-actions";
import { buildLocalCoherenceSnapshot } from "@/lib/audit/local-coherence-snapshot";
import {
  getPrimarySourceCoherenceWarnings,
  primarySourceDecisionDomains
} from "@/lib/audit/coherence-guardrails";
import type { CoherenceAuditDomain, CoherenceAuditReport, CoherenceAuditStatus } from "@/types/coherence-audit-types";

type SettingsState = Awaited<ReturnType<typeof getPrimarySourceSettingsAction>>;

const statusVariants: Record<CoherenceAuditStatus, "default" | "success" | "warning" | "danger" | "brand"> = {
  MATCH: "success",
  LOCAL_ONLY: "warning",
  PRISMA_ONLY: "warning",
  COUNT_MISMATCH: "danger",
  CONTENT_MISMATCH: "danger"
};

function decisionDomains(report: CoherenceAuditReport | null): CoherenceAuditDomain[] {
  if (!report) return [];
  return report.domains.filter((domain) => primarySourceDecisionDomains.includes(domain.domain));
}

export function PrimarySourcePanel() {
  const [settings, setSettings] = useState<SettingsState | null>(null);
  const [report, setReport] = useState<CoherenceAuditReport | null>(null);
  const [message, setMessage] = useState("Chargement de la source de verite.");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [settingsResult, auditResult] = await Promise.all([
          getPrimarySourceSettingsAction(),
          runCoherenceAuditAction(buildLocalCoherenceSnapshot())
        ]);

        if (cancelled) return;
        setSettings(settingsResult);
        setReport(auditResult.success ? auditResult.report : null);
        setMessage(auditResult.success ? "Cohérence controlee en lecture seule." : "Etat coherence indisponible.");
      } catch {
        if (!cancelled) setMessage("Source de verite lisible, audit coherence indisponible.");
      }
    }

    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  const warnings = getPrimarySourceCoherenceWarnings(report);
  const domains = decisionDomains(report);

  return (
    <Card className="border-brand-100">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Source de verite</CardTitle>
          <Badge>Lecture controlee</Badge>
          <Badge>Aucune migration automatique</Badge>
          {settings ? <Badge variant={settings.primarySource === "prisma" ? "brand" : "default"}>{settings.primarySource === "prisma" ? "Prisma" : "Local"}</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-slate-600">
          Les plans d&apos;action, le journal decisionnel et le feedback recommandations sont les seuls domaines autorises a lire Prisma en priorite lorsque `PRIMARY_SOURCE=prisma`.
          En cas d&apos;erreur Prisma, Atlas conserve le fallback local.
        </p>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-line bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Database className="h-4 w-4" aria-hidden="true" />
              <p className="text-xs font-medium uppercase tracking-wide">DATA_MODE</p>
            </div>
            <p className="mt-2 text-sm font-semibold text-ink">{settings?.dataMode ?? "Lecture en cours"}</p>
          </div>
          <div className="rounded-md border border-line bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <p className="text-xs font-medium uppercase tracking-wide">PRIMARY_SOURCE</p>
            </div>
            <p className="mt-2 text-sm font-semibold text-ink">{settings?.primarySource ?? "local"}</p>
          </div>
          <div className="rounded-md border border-line bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Strategie</p>
            <p className="mt-2 text-sm font-semibold text-ink">{settings?.decisionDomains[0]?.readStrategy ?? "LOCAL_ONLY"}</p>
          </div>
        </div>

        <div className="rounded-md border border-line bg-white p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-ink">Domaines basculables</p>
            <Badge>Phase 81</Badge>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {(settings?.decisionDomains ?? []).map((domain) => (
              <div key={domain.id} className="rounded-md border border-line bg-slate-50 p-3">
                <p className="text-sm font-semibold text-ink">{domain.label}</p>
                <p className="mt-1 text-xs text-slate-600">{domain.readStrategy}</p>
              </div>
            ))}
          </div>
        </div>

        {warnings.length > 0 ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              <p className="text-sm font-semibold">Warning coherence</p>
            </div>
            <ul className="mt-2 space-y-1">
              {warnings.map((warning) => (
                <li key={`${warning.domain}-${warning.status}`} className="text-xs leading-5 text-amber-800">
                  {warning.message}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="rounded-md border border-line bg-slate-50 p-3 text-sm text-slate-600">{message}</p>
        )}

        {domains.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-3">
            {domains.map((domain) => (
              <article key={domain.domain} className="rounded-md border border-line bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={statusVariants[domain.status]}>{domain.status}</Badge>
                  <Badge>{domain.localCount} local</Badge>
                  <Badge>{domain.prismaCount} Prisma</Badge>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-ink">{domain.label}</h3>
              </article>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
