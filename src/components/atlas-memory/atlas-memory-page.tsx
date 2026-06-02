"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, BrainCircuit, Check, Database, GitBranch, RotateCcw, Save, Search, ScrollText, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalKpiWorkspace } from "@/hooks/use-local-kpi-workspace";
import { activeOrganizationId } from "@/lib/context/scope-defaults";
import {
  recordMemoryKnowledgeApproved,
  recordMemoryKnowledgeRejected
} from "@/lib/journal/decision-journal-engine";
import {
  approveAtlasKnowledgeItem,
  getAtlasMemoryKnowledge,
  rejectAtlasKnowledgeItem,
  resetAtlasKnowledgeItem
} from "@/lib/local/atlas-memory-knowledge-store";
import {
  getAtlasMemoryDocuments,
  resetAtlasMemoryDocument,
  saveAtlasMemoryDocument
} from "@/lib/local/atlas-memory-store";
import { buildAtlasContextPack } from "@/lib/memory/atlas-context-pack-engine";
import { extractAtlasKnowledgeItems, generateMemoryContext } from "@/lib/memory/atlas-memory-engine";
import { buildAtlasMemorySearchIndex, searchAtlasMemory } from "@/lib/memory/atlas-memory-search-engine";
import { getAtlasMemoryMockByOrganization } from "@/lib/mock/atlas-memory";
import type { AtlasContextPack, AtlasContextPurpose, AtlasContextSource } from "@/types/atlas-context-pack";
import type { AtlasMemoryDocument, AtlasMemoryDocumentKey } from "@/types/atlas-memory";
import type { AtlasKnowledgeItem, AtlasKnowledgeType, KnowledgeStatus } from "@/types/atlas-memory-knowledge";
import type { AtlasMemorySearchResult, AtlasMemorySearchResultType, AtlasMemorySearchScope } from "@/types/atlas-memory-search";

const memoryLinks = [
  {
    title: "Atlas Core",
    description: "Contexte stable de l'organisation active.",
    icon: BrainCircuit
  },
  {
    title: "Business Engine",
    description: "Règles, KPI et décisions explicables.",
    icon: GitBranch
  },
  {
    title: "Agents futurs",
    description: "Agents spécialisés alimentés par une mémoire validée.",
    icon: Bot
  },
  {
    title: "Connecteurs",
    description: "Sources et documents structurés autour du même vocabulaire.",
    icon: Database
  }
];

function getInitialDocuments() {
  return getAtlasMemoryMockByOrganization(activeOrganizationId);
}

function getInitialKnowledgeItems() {
  return extractAtlasKnowledgeItems(getInitialDocuments(), activeOrganizationId);
}

const knowledgeStatusLabels: Record<KnowledgeStatus, string> = {
  detected: "Détectée",
  approved: "Validée",
  rejected: "Rejetée"
};

const knowledgeStatusVariants: Record<KnowledgeStatus, "default" | "success" | "danger"> = {
  detected: "default",
  approved: "success",
  rejected: "danger"
};

const knowledgeTypeLabels: Record<AtlasKnowledgeType, string> = {
  objective: "Objectif",
  business_rule: "Règle métier",
  decision: "Décision",
  glossary: "Glossaire"
};

const searchScopeOptions: Array<{ value: AtlasMemorySearchScope; label: string }> = [
  { value: "all", label: "Tout" },
  { value: "documents", label: "Documents" },
  { value: "knowledge", label: "Connaissances" },
  { value: "approved", label: "Validées" },
  { value: "detected", label: "Détectées" },
  { value: "rejected", label: "Rejetées" }
];

const searchTypeLabels: Record<AtlasMemorySearchResultType, string> = {
  document: "Document",
  knowledge: "Connaissance",
  objective: "Objectif",
  rule: "Règle",
  decision: "Décision",
  glossary: "Glossaire"
};

const contextPackPurposes: AtlasContextPurpose[] = [
  "kpi_analysis",
  "executive_summary",
  "risk_review",
  "copil_preparation",
  "operational_recommendations",
  "commercial_review"
];

function KnowledgeGovernanceList({
  items,
  onApprove,
  onReject,
  onReset
}: {
  items: AtlasKnowledgeItem[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onReset: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
          Aucune connaissance détectée dans les documents mémoire.
        </p>
      ) : (
        items.map((item) => (
          <article key={item.id} className="rounded-md border border-line bg-slate-50 p-4">
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{knowledgeTypeLabels[item.type]}</Badge>
                  <Badge variant={knowledgeStatusVariants[item.status]}>{knowledgeStatusLabels[item.status]}</Badge>
                  <Badge>Source mémoire : {item.sourceDocument}</Badge>
                </div>
                <p className="mt-3 text-sm font-medium leading-6 text-ink">{item.value}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.approvedAt ? `Validée le ${new Date(item.approvedAt).toLocaleDateString("fr-FR")}` : null}
                  {item.rejectedAt ? `Rejetée le ${new Date(item.rejectedAt).toLocaleDateString("fr-FR")}` : null}
                  {!item.approvedAt && !item.rejectedAt ? "En attente de validation humaine." : null}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button onClick={() => onApprove(item.id)} disabled={item.status === "approved"}>
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Valider
                </Button>
                <Button onClick={() => onReject(item.id)} disabled={item.status === "rejected"}>
                  <X className="h-4 w-4" aria-hidden="true" />
                  Rejeter
                </Button>
                <Button variant="ghost" onClick={() => onReset(item.id)} disabled={item.status === "detected"}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Réinitialiser
                </Button>
              </div>
            </div>
          </article>
        ))
      )}
    </div>
  );
}

function ContextSourceList({ title, sources }: { title: string; sources: AtlasContextSource[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      {sources.length === 0 ? (
        <p className="mt-2 rounded-md border border-line bg-slate-50 p-3 text-sm text-slate-600">Aucune source incluse.</p>
      ) : (
        <div className="mt-2 space-y-2">
          {sources.slice(0, 5).map((source) => (
            <div key={`${source.type}-${source.id}`} className="rounded-md border border-line bg-slate-50 p-3">
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

function ContextPacksSection({
  packs,
  selectedPack,
  onSelectPack
}: {
  packs: AtlasContextPack[];
  selectedPack?: AtlasContextPack;
  onSelectPack: (purpose: AtlasContextPurpose) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Contextes prêts pour agents futurs</CardTitle>
          <Badge variant="brand">Préparation</Badge>
          <Badge>Sans IA</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Paquets de contexte déterministes destinés aux futurs agents spécialisés. Ils utilisent uniquement les connaissances validées.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 lg:grid-cols-3">
          {packs.map((pack) => {
            const sourceCount =
              pack.includedDocuments.length +
              pack.includedKnowledge.length +
              pack.includedKpis.length +
              pack.includedAlerts.length +
              pack.includedRules.length +
              pack.includedDecisionHistory.length;

            return (
              <article key={pack.id} className="rounded-md border border-line bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="brand">{pack.title}</Badge>
                  <Badge>{sourceCount} source(s)</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{pack.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge>{pack.includedKnowledge.length} connaissance(s)</Badge>
                  <Badge>{pack.includedKpis.length} KPI</Badge>
                  <Badge>{pack.includedAlerts.length} alerte(s)</Badge>
                </div>
                <p className="mt-3 text-xs text-slate-500">{pack.limitations.length} limite(s) détectée(s)</p>
                <Button className="mt-4" onClick={() => onSelectPack(pack.purpose)}>
                  Prévisualiser le contexte
                </Button>
              </article>
            );
          })}
        </div>

        {selectedPack ? (
          <div className="rounded-md border border-brand-100 bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">{selectedPack.title}</Badge>
              <Badge>Contexte local</Badge>
              <Badge>Non persisté</Badge>
            </div>
            <p className="mt-3 text-base font-semibold leading-7 text-ink">{selectedPack.summary}</p>
            <p className="mt-2 text-sm text-slate-500">
              Ce contexte pourra être transmis à un agent spécialisé plus tard. Aucun agent réel ni IA générative n&apos;est activé ici.
            </p>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <ContextSourceList title="Documents utilisés" sources={selectedPack.includedDocuments} />
              <ContextSourceList title="Connaissances validées" sources={selectedPack.includedKnowledge} />
              <ContextSourceList title="KPI inclus" sources={selectedPack.includedKpis} />
              <ContextSourceList title="Alertes et règles" sources={[...selectedPack.includedAlerts, ...selectedPack.includedRules]} />
              <ContextSourceList title="Recommandations incluses" sources={selectedPack.includedRecommendations} />
              <ContextSourceList title="Feedbacks inclus" sources={selectedPack.includedRecommendationFeedback} />
              <ContextSourceList title="Scores de confiance inclus" sources={selectedPack.includedRecommendationConfidence} />
              <ContextSourceList title="Plans d'action inclus" sources={selectedPack.includedActionPlans} />
              <ContextSourceList title="Impacts mesurés inclus" sources={selectedPack.includedActionPlanImpacts} />
              <ContextSourceList title="Historique décisionnel inclus" sources={selectedPack.includedDecisionHistory} />
            </div>
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Limites et exclusions</p>
              {selectedPack.limitations.length === 0 ? (
                <p className="mt-2 rounded-md border border-line bg-slate-50 p-3 text-sm text-slate-600">
                  Aucune limite majeure détectée pour ce contexte local.
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {selectedPack.limitations.map((limitation) => (
                    <li key={limitation} className="rounded-md border border-line bg-slate-50 p-3 text-sm text-slate-700">
                      {limitation}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function MemorySearchSection({
  query,
  scope,
  results,
  onQueryChange,
  onScopeChange,
  onOpenDocument
}: {
  query: string;
  scope: AtlasMemorySearchScope;
  results: AtlasMemorySearchResult[];
  onQueryChange: (query: string) => void;
  onScopeChange: (scope: AtlasMemorySearchScope) => void;
  onOpenDocument: (key: AtlasMemoryDocumentKey) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Recherche dans la mémoire</CardTitle>
          <Badge variant="brand">Locale</Badge>
          <Badge>Sans IA</Badge>
          <Badge>{results.length} résultat(s)</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Recherche locale déterministe, sans IA ni vectorisation. Les résultats indiquent les termes trouvés, la source et le statut.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Rechercher un objectif, une règle, une décision, une définition..."
              className="h-10 w-full rounded-md border border-line bg-white py-2 pl-9 pr-3 text-sm text-ink outline-none transition focus:border-brand-300"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {searchScopeOptions.map((option) => (
              <Button
                key={option.value}
                variant={scope === option.value ? "primary" : "secondary"}
                onClick={() => onScopeChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {results.length === 0 ? (
          <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
            Aucun résultat trouvé. Essayez un autre terme ou élargissez le filtre.
          </p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {results.map((result) => (
              <article key={result.id} className="rounded-md border border-line bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{searchTypeLabels[result.type]}</Badge>
                  {result.status ? (
                    <Badge variant={knowledgeStatusVariants[result.status]}>{knowledgeStatusLabels[result.status]}</Badge>
                  ) : null}
                  <Badge>{result.sourceDocument}</Badge>
                  <Badge>Score {result.score}</Badge>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-ink">{result.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{result.excerpt}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    {result.matchedTerms.length > 0 ? (
                      result.matchedTerms.map((term) => <Badge key={`${result.id}-${term}`}>Terme : {term}</Badge>)
                    ) : (
                      <Badge>Aucun terme saisi</Badge>
                    )}
                  </div>
                  <Button variant="ghost" onClick={() => onOpenDocument(result.sourceDocument)}>
                    Ouvrir source
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AtlasMemoryPage() {
  const [mounted, setMounted] = useState(false);
  const { data: localKpiWorkspace } = useLocalKpiWorkspace();
  const [documents, setDocuments] = useState<AtlasMemoryDocument[]>(getInitialDocuments);
  const [knowledgeItems, setKnowledgeItems] = useState<AtlasKnowledgeItem[]>(getInitialKnowledgeItems);
  const [selectedKey, setSelectedKey] = useState<AtlasMemoryDocumentKey>("entreprise.md");
  const selectedDocument = useMemo(
    () => documents.find((document) => document.key === selectedKey) ?? documents[0],
    [documents, selectedKey]
  );
  const [draftByKey, setDraftByKey] = useState<Record<string, string>>(() =>
    Object.fromEntries(getInitialDocuments().map((document) => [document.key, document.content]))
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchScope, setSearchScope] = useState<AtlasMemorySearchScope>("all");
  const [selectedContextPurpose, setSelectedContextPurpose] = useState<AtlasContextPurpose>("kpi_analysis");
  const draftContent = selectedDocument ? draftByKey[selectedDocument.key] ?? selectedDocument.content : "";
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const detectedKnowledgeItems = useMemo(() => extractAtlasKnowledgeItems(documents, activeOrganizationId), [documents]);
  const memoryContext = useMemo(() => generateMemoryContext(documents, knowledgeItems), [documents, knowledgeItems]);
  const searchIndex = useMemo(() => buildAtlasMemorySearchIndex(documents, knowledgeItems), [documents, knowledgeItems]);
  const searchResults = useMemo(
    () => searchAtlasMemory(searchQuery, searchIndex, { scope: searchScope, limit: 12 }),
    [searchIndex, searchQuery, searchScope]
  );
  const contextPacks = useMemo(
    () =>
      contextPackPurposes.map((purpose) =>
        buildAtlasContextPack(purpose, {
          organizationId: activeOrganizationId,
          documents,
          knowledgeItems,
          kpiConfigurations: localKpiWorkspace.configurations,
          kpiResults: localKpiWorkspace.results,
          alerts: localKpiWorkspace.alerts,
          alertRules: localKpiWorkspace.alertRules,
          insights: localKpiWorkspace.insights,
          recommendations: localKpiWorkspace.recommendations,
          recommendationFeedback: localKpiWorkspace.recommendationFeedback,
          recommendationConfidence: localKpiWorkspace.recommendationConfidence,
          actionPlans: localKpiWorkspace.actionPlans,
          actionPlanImpacts: localKpiWorkspace.actionPlanImpacts,
          decisionJournalEntries: localKpiWorkspace.decisionJournalEntries
        })
      ),
    [documents, knowledgeItems, localKpiWorkspace]
  );
  const selectedContextPack = contextPacks.find((pack) => pack.purpose === selectedContextPurpose) ?? contextPacks[0];
  const approvedKnowledgeCount = knowledgeItems.filter((item) => item.status === "approved").length;
  const rejectedKnowledgeCount = knowledgeItems.filter((item) => item.status === "rejected").length;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextDocuments = getAtlasMemoryDocuments(activeOrganizationId);
      setDocuments(nextDocuments);
      setKnowledgeItems(getAtlasMemoryKnowledge(activeOrganizationId, extractAtlasKnowledgeItems(nextDocuments, activeOrganizationId)));
      setDraftByKey(Object.fromEntries(nextDocuments.map((document) => [document.key, document.content])));
      setSelectedKey((current) => nextDocuments.find((document) => document.key === current)?.key ?? nextDocuments[0]?.key ?? "entreprise.md");
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function refreshDocuments(preferredKey = selectedKey) {
    const nextDocuments = getAtlasMemoryDocuments(activeOrganizationId);
    setDocuments(nextDocuments);
    setKnowledgeItems(getAtlasMemoryKnowledge(activeOrganizationId, extractAtlasKnowledgeItems(nextDocuments, activeOrganizationId)));
    setDraftByKey(Object.fromEntries(nextDocuments.map((document) => [document.key, document.content])));
    setSelectedKey(nextDocuments.find((document) => document.key === preferredKey)?.key ?? nextDocuments[0]?.key ?? "entreprise.md");
  }

  function saveDocument() {
    if (!selectedDocument) return;

    saveAtlasMemoryDocument({
      ...selectedDocument,
      content: draftContent
    });
    refreshDocuments(selectedDocument.key);
    setSaveMessage("Document sauvegardé localement.");
  }

  function resetDocument() {
    if (!selectedDocument) return;
    const resetDocumentValue = resetAtlasMemoryDocument(activeOrganizationId, selectedDocument.key);
    refreshDocuments(selectedDocument.key);
    setDraftByKey((current) => ({
      ...current,
      [selectedDocument.key]: resetDocumentValue?.content ?? ""
    }));
    setSaveMessage("Document réinitialisé depuis le modèle.");
  }

  function approveKnowledge(id: string) {
    const nextItems = approveAtlasKnowledgeItem(activeOrganizationId, detectedKnowledgeItems, id);
    const approvedItem = nextItems.find((item) => item.id === id);
    if (approvedItem) recordMemoryKnowledgeApproved(approvedItem);
    setKnowledgeItems(nextItems);
    setSaveMessage("Connaissance validée pour le moteur métier.");
  }

  function rejectKnowledge(id: string) {
    const nextItems = rejectAtlasKnowledgeItem(activeOrganizationId, detectedKnowledgeItems, id);
    const rejectedItem = nextItems.find((item) => item.id === id);
    if (rejectedItem) recordMemoryKnowledgeRejected(rejectedItem);
    setKnowledgeItems(nextItems);
    setSaveMessage("Connaissance rejetée et ignorée par le moteur métier.");
  }

  function resetKnowledge(id: string) {
    setKnowledgeItems(resetAtlasKnowledgeItem(activeOrganizationId, detectedKnowledgeItems, id));
    setSaveMessage("Statut de connaissance réinitialisé.");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">Atlas Memory</Badge>
              <Badge>Mémoire locale non persistée</Badge>
              <Badge>{documents.length} documents</Badge>
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
              Mémoire métier structurée
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Centraliser les connaissances métier d&apos;une organisation sous forme de documents Markdown simulés :
              contexte, stratégie, règles, glossaire, KPI, décisions et équipe.
            </p>
          </div>
          <div className="rounded-md border border-line bg-slate-50 p-3 text-sm text-slate-600">
            <ScrollText className="mb-2 h-5 w-5 text-brand-700" aria-hidden="true" />
            Organisation active : {activeOrganizationId}
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        {memoryLinks.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-brand-50 p-2 text-brand-700">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <p className="font-semibold text-ink">{item.title}</p>
                </div>
                <p className="mt-3 text-sm leading-5 text-slate-600">{item.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <MemorySearchSection
        query={searchQuery}
        scope={searchScope}
        results={searchResults}
        onQueryChange={setSearchQuery}
        onScopeChange={setSearchScope}
        onOpenDocument={setSelectedKey}
      />

      <ContextPacksSection
        packs={contextPacks}
        selectedPack={selectedContextPack}
        onSelectPack={setSelectedContextPurpose}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Connaissances détectées</CardTitle>
            <Badge variant="brand">Moteur déterministe</Badge>
            <Badge>{approvedKnowledgeCount} validée(s)</Badge>
            <Badge variant={rejectedKnowledgeCount > 0 ? "danger" : "default"}>{rejectedKnowledgeCount} rejetée(s)</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Atlas détecte les connaissances depuis les documents mémoire. Seules les connaissances validées enrichissent les insights, les risques et la synthèse dirigeant.
          </p>
        </CardHeader>
        <CardContent>
          <KnowledgeGovernanceList
            items={knowledgeItems}
            onApprove={approveKnowledge}
            onReject={rejectKnowledge}
            onReset={resetKnowledge}
          />
          {memoryContext.warnings.length > 0 ? (
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">Limites de gouvernance</p>
              <ul className="mt-2 space-y-1 text-sm text-amber-900">
                {memoryContext.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Documents mémoire</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Structure cible simulée. Aucun contenu n&apos;est écrit en base.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {documents.map((document) => (
              <button
                key={document.key}
                type="button"
                onClick={() => setSelectedKey(document.key)}
                className={`w-full rounded-md border p-3 text-left transition ${
                  selectedDocument?.key === document.key
                    ? "border-brand-200 bg-brand-50"
                    : "border-line bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-ink">{document.title}</p>
                  <Badge variant={document.source === "local" ? "warning" : "default"}>
                    {document.source === "local" ? "Local" : "Mock"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">{document.key}</p>
                <p className="mt-2 text-sm leading-5 text-slate-600">{document.description}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>{selectedDocument?.title ?? "Document mémoire"}</CardTitle>
                  <Badge>{selectedDocument?.key}</Badge>
                  <Badge variant={selectedDocument?.source === "local" ? "warning" : "default"}>
                    {selectedDocument?.source === "local" ? "Version locale" : "Modèle initial"}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Édition locale Markdown. Le contenu sera utilisable plus tard par le moteur métier, les agents et Atlas IA.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={saveDocument} disabled={!mounted || !selectedDocument}>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Sauvegarder
                </Button>
                <Button onClick={resetDocument} disabled={!mounted || !selectedDocument}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Réinitialiser
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={draftContent}
              onChange={(event) => {
                if (!selectedDocument) return;
                setDraftByKey((current) => ({
                  ...current,
                  [selectedDocument.key]: event.target.value
                }));
                setSaveMessage(null);
              }}
              className="min-h-[420px] w-full rounded-md border border-line bg-slate-50 p-4 font-mono text-sm leading-6 text-ink outline-none transition focus:border-brand-300 focus:bg-white"
              spellCheck={false}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Mémoire locale non persistée</Badge>
              <Badge>Markdown simulé</Badge>
              <Badge>{mounted ? "Client prêt" : "Chargement local"}</Badge>
              {saveMessage ? <Badge variant="success">{saveMessage}</Badge> : null}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
