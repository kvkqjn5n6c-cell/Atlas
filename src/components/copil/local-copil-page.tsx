"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalKpiWorkspace } from "@/hooks/use-local-kpi-workspace";
import {
  generateLocalCopilBrief,
  generateLocalCopilBriefMarkdown
} from "@/lib/copil/local-copil-brief-engine";
import { activeOrganizationId, activePeriod } from "@/lib/context/scope-defaults";
import { getAtlasMemoryKnowledge } from "@/lib/local/atlas-memory-knowledge-store";
import { getAtlasMemoryDocuments } from "@/lib/local/atlas-memory-store";
import { buildAtlasContextPack } from "@/lib/memory/atlas-context-pack-engine";
import { extractAtlasKnowledgeItems } from "@/lib/memory/atlas-memory-engine";
import type { AtlasContextPack, AtlasContextSource } from "@/types/atlas-context-pack";
import type { AtlasMemoryDocument } from "@/types/atlas-memory";
import type { AtlasKnowledgeItem } from "@/types/atlas-memory-knowledge";
import type { LocalCopilBrief } from "@/types/local-copil";

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-line bg-slate-50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <Badge>{items.length}</Badge>
      </div>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">Aucun élément disponible pour cette section.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item, index) => (
            <li key={`${title}-${index}-${item}`} className="rounded-md border border-line bg-white px-3 py-2 text-sm leading-5 text-slate-700">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ContextSourceList({ title, sources }: { title: string; sources: AtlasContextSource[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      {sources.length === 0 ? (
        <p className="mt-2 rounded-md border border-line bg-slate-50 p-3 text-sm text-slate-600">
          Aucune source incluse.
        </p>
      ) : (
        <div className="mt-2 space-y-2">
          {sources.slice(0, 5).map((source, index) => (
            <div key={`${source.type}-${source.id}-${index}`} className="rounded-md border border-line bg-slate-50 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{source.type}</Badge>
                {source.status ? <Badge>{source.status}</Badge> : null}
                {source.sourceDocument ? <Badge>{source.sourceDocument}</Badge> : null}
              </div>
              <p className="mt-2 text-sm font-medium text-ink">{source.title}</p>
              {source.excerpt ? <p className="mt-1 text-xs leading-5 text-slate-600">{source.excerpt}</p> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CopilContextCard({ pack }: { pack?: AtlasContextPack }) {
  if (!pack) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sources utilisées</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
            Aucun context pack COPIL disponible pour l&apos;instant.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Sources utilisées</CardTitle>
          <Badge variant="brand">{pack.title}</Badge>
          <Badge>Sans IA</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-500">{pack.summary}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <ContextSourceList title="Documents mémoire" sources={pack.includedDocuments} />
          <ContextSourceList title="Connaissances validées" sources={pack.includedKnowledge} />
          <ContextSourceList title="KPI et alertes" sources={[...pack.includedKpis, ...pack.includedAlerts]} />
          <ContextSourceList title="Priorités Atlas" sources={pack.includedPriorities} />
          <ContextSourceList title="Dashboard dirigeant" sources={pack.includedExecutiveDashboard} />
          <ContextSourceList title="Décisions récentes" sources={pack.includedDecisionHistory} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Limites</p>
          <div className="mt-2 space-y-2">
            {pack.limitations.slice(0, 5).map((limitation, index) => (
              <p key={`copil-limitation-${index}-${limitation}`} className="rounded-md border border-line bg-slate-50 p-3 text-sm text-slate-600">
                {limitation}
              </p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function buildCopilContextPack(
  documents: AtlasMemoryDocument[],
  knowledgeItems: AtlasKnowledgeItem[],
  workspace: ReturnType<typeof useLocalKpiWorkspace>["data"]
) {
  return buildAtlasContextPack("copil_preparation", {
    organizationId: activeOrganizationId,
    documents,
    knowledgeItems,
    kpiConfigurations: workspace.configurations,
    kpiResults: workspace.results,
    alerts: workspace.alerts,
    alertRules: workspace.alertRules,
    insights: workspace.insights,
    recommendations: workspace.recommendations,
    recommendationFeedback: workspace.recommendationFeedback,
    recommendationConfidence: workspace.recommendationConfidence,
    actionPlans: workspace.actionPlans,
    actionPlanImpacts: workspace.actionPlanImpacts,
    decisionJournalEntries: workspace.decisionJournalEntries,
    priorities: workspace.priorities,
    executiveDashboard: workspace.executiveDashboard
  });
}

export function LocalCopilPage() {
  const { data: workspace } = useLocalKpiWorkspace();
  const [mounted, setMounted] = useState(false);
  const [documents, setDocuments] = useState<AtlasMemoryDocument[]>([]);
  const [knowledgeItems, setKnowledgeItems] = useState<AtlasKnowledgeItem[]>([]);
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextDocuments = getAtlasMemoryDocuments(activeOrganizationId);
      setDocuments(nextDocuments);
      setKnowledgeItems(getAtlasMemoryKnowledge(activeOrganizationId, extractAtlasKnowledgeItems(nextDocuments, activeOrganizationId)));
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const copilContextPack = useMemo(
    () => mounted ? buildCopilContextPack(documents, knowledgeItems, workspace) : undefined,
    [documents, knowledgeItems, mounted, workspace]
  );

  const brief: LocalCopilBrief = useMemo(
    () =>
      generateLocalCopilBrief({
        organizationId: activeOrganizationId,
        periodLabel: activePeriod,
        kpiResults: workspace.results,
        alerts: workspace.alerts,
        insights: workspace.insights,
        executiveSummary: workspace.executiveSummary,
        recommendations: workspace.recommendations,
        actionPlans: workspace.actionPlans,
        impacts: workspace.actionPlanImpacts,
        feedbackItems: workspace.recommendationFeedback,
        confidenceScores: workspace.recommendationConfidence,
        priorities: workspace.priorities,
        memoryReferences: workspace.usedMemoryReferences,
        decisionJournalEntries: workspace.decisionJournalEntries,
        copilContextPack,
        datasetGroupByInsights: workspace.datasetGroupByInsights
      }),
    [copilContextPack, workspace]
  );

  async function copyBrief() {
    const markdown = generateLocalCopilBriefMarkdown(brief);

    try {
      await navigator.clipboard.writeText(markdown);
      setCopyMessage("Brief COPIL copié en Markdown.");
    } catch {
      setCopyMessage("Copie automatique indisponible. Le brief Markdown reste généré localement.");
    }
  }

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Préparation COPIL</CardTitle>
          <p className="mt-1 text-sm text-slate-500">Chargement des données locales de pilotage.</p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">Préparation COPIL</Badge>
              <Badge>{brief.periodLabel}</Badge>
              <Badge>Local</Badge>
              <Badge>Sans IA</Badge>
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">{brief.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Préparer une réunion de pilotage avec les KPI, alertes, recommandations, plans, impacts, décisions récentes et connaissances mémoire validées.
            </p>
          </div>
          <div className="flex flex-col gap-2 rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-ink">Généré localement</p>
            <p>{new Date(brief.generatedAt).toLocaleString("fr-FR")}</p>
            <Button onClick={copyBrief}>Copier le brief</Button>
            {copyMessage ? <Badge variant="success">{copyMessage}</Badge> : null}
          </div>
        </div>
      </section>

      <Card className="border-brand-100">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Résumé de situation</CardTitle>
            <Badge variant="brand">Brief déterministe</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-base font-semibold leading-7 text-ink">{brief.globalSituation}</p>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        <ListBlock title="Priorités principales" items={brief.mainPriorities} />
        <ListBlock title="KPI à examiner" items={brief.keyKpis} />
        <ListBlock title="Alertes critiques" items={brief.criticalAlerts} />
        <ListBlock title="Recommandations clés" items={brief.keyRecommendations} />
        <ListBlock title="Plans d'action actifs" items={brief.activeActionPlans} />
        <ListBlock title="Impacts mesurés" items={brief.measuredImpacts} />
        <ListBlock title="Décisions récentes" items={brief.recentDecisions} />
        <ListBlock title="Signaux comparatifs Dataset" items={brief.comparativeInsights ?? []} />
        <ListBlock title="Points à arbitrer" items={brief.arbitrationPoints} />
        <ListBlock title="Prochaines actions" items={brief.nextActions} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ListBlock title="Risques à porter en réunion" items={brief.risks} />
        <ListBlock title="Notes de confiance" items={brief.confidenceNotes} />
      </section>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Mémoire mobilisée</CardTitle>
            <Badge>{brief.memoryReferences.length} référence(s)</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {brief.memoryReferences.length === 0 ? (
            <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
              Aucune connaissance mémoire validée n&apos;est mobilisée dans ce brief.
            </p>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {brief.memoryReferences.map((reference, index) => (
                <article key={`${reference.sourceDocument}-${reference.knowledgeId ?? index}-${reference.value}`} className="rounded-md border border-line bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{reference.sourceDocument}</Badge>
                    <Badge variant="success">{reference.status}</Badge>
                    <Badge>{reference.knowledgeType}</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{reference.value}</p>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CopilContextCard pack={copilContextPack} />
    </div>
  );
}
