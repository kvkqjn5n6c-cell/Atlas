"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  saveDecisionJournalEntryAction,
  saveLocalActionPlanAction,
  saveRecommendationFeedbackAction
} from "@/lib/actions/decision-engine-persistence-actions";
import { Progress } from "@/components/ui/progress";
import { buildLocalActionPlanFromRecommendation } from "@/lib/action-plans/local-action-plan-builder";
import { useLocalKpiWorkspace } from "@/hooks/use-local-kpi-workspace";
import { formatKpiDirection } from "@/lib/kpi-engine/local-kpi-direction";
import { calculateScoreWithLocalKpis } from "@/lib/kpi-engine/local-kpi-results";
import { formatVariation } from "@/lib/kpi-engine/local-kpi-trends";
import { saveLocalActionPlan } from "@/lib/local/local-action-plans-store";
import { saveRecommendationFeedback } from "@/lib/local/local-recommendation-feedback-store";
import { recordActionPlanCreated, recordFeedbackRecorded } from "@/lib/journal/decision-journal-engine";
import {
  buildEmptyRecommendationFeedback,
  calculateRecommendationFeedbackStats
} from "@/lib/recommendations/local-recommendation-feedback";
import { getAvailableApprovedMemoryKnowledge } from "@/lib/services/local-data/local-kpis-data.service";
import type { AtlasKnowledgeItem, AtlasKnowledgeType } from "@/types/atlas-memory-knowledge";
import type { LocalActionPlan } from "@/types/local-action-plans";
import type { LocalActionPlanImpact } from "@/types/local-action-plan-impact";
import type { LocalInsightMemoryReference } from "@/types/local-insights";
import type { LocalKpiResult } from "@/types/local-kpi-results";
import type { LocalPriorityItem } from "@/types/local-priorities";
import type {
  LocalRecommendationFeedback,
  RecommendationActionTaken,
  RecommendationImpactObserved,
  RecommendationRelevance
} from "@/types/local-recommendation-feedback";
import type { LocalRecommendation, RecommendationPriority } from "@/types/local-recommendations";
import type { ConfidenceLevel, RecommendationConfidence } from "@/types/recommendation-confidence";
import type { DecisionJournalEntry, DecisionJournalEntryType } from "@/types/decision-journal";

const statusVariant = {
  healthy: "success",
  watch: "warning",
  critical: "danger",
  "not-tested": "default"
} as const;

const statusLabels = {
  healthy: "Conforme",
  watch: "À surveiller",
  critical: "Critique",
  "not-tested": "Non testé"
} as const;

const calculationLabels: Record<LocalKpiResult["calculationType"], string> = {
  sum: "Somme",
  average: "Moyenne",
  count: "Comptage",
  "distinct-count": "Comptage unique",
  rate: "Taux",
  ratio: "Ratio",
  "period-change": "Évolution période"
};

const insightVariant = {
  info: "default",
  watch: "warning",
  critical: "danger"
} as const;

const insightLabels = {
  info: "Information",
  watch: "À surveiller",
  critical: "Critique"
} as const;

const knowledgeTypeLabels: Record<AtlasKnowledgeType, string> = {
  objective: "Objectif validé",
  business_rule: "Règle métier validée",
  decision: "Décision historique validée",
  glossary: "Glossaire validé"
};

const recommendationPriorityVariant: Record<RecommendationPriority, "default" | "warning" | "danger"> = {
  low: "default",
  medium: "default",
  high: "warning",
  critical: "danger"
};

const recommendationPriorityLabels: Record<RecommendationPriority, string> = {
  low: "Basse",
  medium: "Moyenne",
  high: "Haute",
  critical: "Critique"
};

const relevanceLabels: Record<RecommendationRelevance, string> = {
  relevant: "Oui",
  not_relevant: "Non",
  unknown: "À confirmer"
};

const actionTakenLabels: Record<RecommendationActionTaken, string> = {
  yes: "Oui",
  no: "Non",
  planned: "Prévue"
};

const impactObservedLabels: Record<RecommendationImpactObserved, string> = {
  positive: "Positif",
  neutral: "Neutre",
  negative: "Négatif",
  unknown: "Inconnu"
};

const confidenceLevelLabels: Record<ConfidenceLevel, string> = {
  low: "Faible",
  medium: "Moyenne",
  high: "Élevée",
  very_high: "Très élevée"
};

function confidenceVariant(level: ConfidenceLevel) {
  if (level === "very_high" || level === "high") return "success";
  if (level === "medium") return "warning";
  return "danger";
}

const journalEntryTypeLabels: Record<DecisionJournalEntryType, string> = {
  recommendation_created: "Recommandation",
  action_plan_created: "Plan créé",
  action_plan_updated: "Plan mis à jour",
  impact_measured: "Impact mesuré",
  feedback_recorded: "Feedback",
  confidence_calculated: "Confiance",
  memory_knowledge_approved: "Mémoire validée",
  memory_knowledge_rejected: "Mémoire rejetée",
  dataset_analysis: "Analyse Dataset",
  groupby_insight: "Insight comparatif"
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

const priorityUrgencyLabels: Record<LocalPriorityItem["urgency"], string> = {
  low: "Faible",
  medium: "Moyenne",
  high: "Élevée",
  critical: "Critique"
};

function priorityUrgencyVariant(urgency: LocalPriorityItem["urgency"]) {
  if (urgency === "critical") return "danger";
  if (urgency === "high") return "warning";
  if (urgency === "medium") return "brand";
  return "default";
}

function TrendIcon({ trend }: { trend?: LocalKpiResult["trend"] }) {
  const Icon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : ArrowRight;
  return <Icon className="h-4 w-4" aria-hidden="true" />;
}

function SummaryList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.map((item, index) => (
          <li key={`${title}-${index}-${item}`} className="rounded-md border border-line bg-white px-3 py-2 text-sm leading-5 text-slate-700">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MemoryReferencesCard({
  usedReferences,
  availableKnowledge
}: {
  usedReferences: LocalInsightMemoryReference[];
  availableKnowledge: AtlasKnowledgeItem[];
}) {
  return (
    <Card className="border-brand-100">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Références mémoire utilisées</CardTitle>
          <Badge variant="brand">Atlas Memory</Badge>
          <Badge>{usedReferences.length} mobilisée(s)</Badge>
          <Badge>{availableKnowledge.length} disponible(s)</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Séparation entre les connaissances validées qui influencent l&apos;analyse courante et celles qui restent disponibles pour d&apos;autres lectures.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <section>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Connaissances mobilisées dans l&apos;analyse</p>
          {usedReferences.length === 0 ? (
            <p className="mt-2 rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
              Aucune connaissance validée n&apos;est utilisée pour cette analyse.
            </p>
          ) : (
            <div className="mt-2 grid gap-3 lg:grid-cols-2">
              {usedReferences.map((reference) => (
                <article
                  key={`${reference.sourceDocument}-${reference.knowledgeType}-${reference.value}`}
                  className="rounded-md border border-line bg-slate-50 p-4"
                >
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
        </section>

        <section>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Autres connaissances validées disponibles</p>
          {availableKnowledge.length === 0 ? (
            <p className="mt-2 rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
              Aucune autre connaissance validée disponible pour cette analyse.
            </p>
          ) : (
            <div className="mt-2 grid gap-3 lg:grid-cols-2">
              {availableKnowledge.map((item) => (
              <article
                key={item.id}
                className="rounded-md border border-line bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{item.sourceDocument}</Badge>
                  <Badge variant="success">Validée</Badge>
                  <Badge>{knowledgeTypeLabels[item.type]}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{item.value}</p>
              </article>
              ))}
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  );
}

function RecommendationFeedbackPanel({
  recommendation,
  feedback,
  actionPlans,
  actionPlanImpacts,
  onSaved
}: {
  recommendation: LocalRecommendation;
  feedback?: LocalRecommendationFeedback;
  actionPlans: LocalActionPlan[];
  actionPlanImpacts: LocalActionPlanImpact[];
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<LocalRecommendationFeedback>(() =>
    feedback ?? buildEmptyRecommendationFeedback(recommendation, actionPlans, actionPlanImpacts)
  );

  function saveFeedback() {
    const saved = saveRecommendationFeedback(draft);
    const journalEntry = recordFeedbackRecorded(saved);
    void saveRecommendationFeedbackAction({ organizationId: recommendation.organizationId, feedback: saved });
    void saveDecisionJournalEntryAction({ organizationId: recommendation.organizationId, entry: journalEntry });
    setDraft(saved);
    onSaved();
  }

  return (
    <div className="mt-4 rounded-md border border-line bg-white p-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-ink">Feedback métier</p>
        {feedback ? <Badge variant="success">Feedback enregistré</Badge> : <Badge>Non renseigné</Badge>}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="text-xs font-medium text-slate-600">
          Pertinente ?
          <select
            className="mt-1 h-9 w-full rounded-md border border-line bg-white px-2 text-sm text-ink"
            value={draft.relevance}
            onChange={(event) => setDraft((current) => ({
              ...current,
              relevance: event.target.value as RecommendationRelevance
            }))}
          >
            {Object.entries(relevanceLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-600">
          Action suivie ?
          <select
            className="mt-1 h-9 w-full rounded-md border border-line bg-white px-2 text-sm text-ink"
            value={draft.actionTaken}
            onChange={(event) => setDraft((current) => ({
              ...current,
              actionTaken: event.target.value as RecommendationActionTaken
            }))}
          >
            {Object.entries(actionTakenLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-600">
          Impact observé ?
          <select
            className="mt-1 h-9 w-full rounded-md border border-line bg-white px-2 text-sm text-ink"
            value={draft.impactObserved}
            onChange={(event) => setDraft((current) => ({
              ...current,
              impactObserved: event.target.value as RecommendationImpactObserved
            }))}
          >
            {Object.entries(impactObservedLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="mt-3 block text-xs font-medium text-slate-600">
        Commentaire
        <textarea
          className="mt-1 min-h-20 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
          value={draft.comment ?? ""}
          onChange={(event) => setDraft((current) => ({ ...current, comment: event.target.value }))}
          placeholder="Pourquoi cette recommandation aide ou non la décision ?"
        />
      </label>
      {draft.linkedActionPlanId ? (
        <p className="mt-2 text-xs text-slate-500">Plan lié : {draft.linkedActionPlanId}</p>
      ) : null}
      <Button className="mt-3" onClick={saveFeedback}>
        Sauvegarder le feedback
      </Button>
    </div>
  );
}

function RecommendationConfidenceBlock({ confidence }: { confidence?: RecommendationConfidence }) {
  if (!confidence) {
    return (
      <div className="mt-4 rounded-md border border-line bg-white p-3 text-sm text-slate-600">
        Confiance Atlas non calculée pour cette recommandation.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-md border border-brand-100 bg-white p-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-ink">Confiance Atlas : {confidence.score} %</p>
        <Badge variant={confidenceVariant(confidence.level)}>{confidenceLevelLabels[confidence.level]}</Badge>
        <Badge>Déterministe</Badge>
      </div>
      <div className="mt-3 space-y-2">
        {confidence.factors.map((factor) => (
          <div key={`${factor.label}-${factor.weight}`} className="rounded-md border border-line bg-slate-50 p-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={factor.value >= 0 ? "success" : "warning"}>
                {factor.value >= 0 ? "+" : "-"} {factor.label}
              </Badge>
              <span className="text-xs text-slate-500">Poids {factor.weight}</span>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-600">{factor.explanation}</p>
          </div>
        ))}
      </div>
      {confidence.warnings.length > 0 ? (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs leading-5 text-amber-700">
          {confidence.warnings.join(" ")}
        </div>
      ) : null}
    </div>
  );
}

function RecommendationsSection({
  recommendations,
  actionPlans,
  actionPlanImpacts,
  feedbackItems,
  confidenceItems,
  onDataChanged
}: {
  recommendations: LocalRecommendation[];
  actionPlans: LocalActionPlan[];
  actionPlanImpacts: LocalActionPlanImpact[];
  feedbackItems: LocalRecommendationFeedback[];
  confidenceItems: RecommendationConfidence[];
  onDataChanged: () => void;
}) {
  const [createdRecommendationIds, setCreatedRecommendationIds] = useState<string[]>(() =>
    actionPlans.map((plan) => plan.sourceRecommendationId).filter((id): id is string => Boolean(id))
  );
  const [message, setMessage] = useState("");
  const knownRecommendationIds = new Set([
    ...actionPlans.map((plan) => plan.sourceRecommendationId).filter((id): id is string => Boolean(id)),
    ...createdRecommendationIds
  ]);

  function createPlan(recommendation: LocalRecommendation) {
    if (knownRecommendationIds.has(recommendation.id)) {
      setMessage("Un plan d'action local existe déjà pour cette recommandation.");
      return;
    }

    const plan = saveLocalActionPlan(buildLocalActionPlanFromRecommendation(recommendation));
    const journalEntry = recordActionPlanCreated(plan);
    void saveLocalActionPlanAction(plan);
    void saveDecisionJournalEntryAction({ organizationId: plan.organizationId, entry: journalEntry });
    setCreatedRecommendationIds((current) => [...current, recommendation.id]);
    setMessage(`Plan d'action local créé : ${plan.title}`);
    onDataChanged();
  }

  return (
    <Card className="border-brand-100">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Recommandations Atlas</CardTitle>
          <Badge variant="brand">Déterministe</Badge>
          <Badge>{recommendations.length} action(s)</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Actions priorisées à partir des KPI, alertes, règles, insights et connaissances mémoire validées.
        </p>
      </CardHeader>
      <CardContent>
        {message ? (
          <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}
        {recommendations.length === 0 ? (
          <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
            Aucune recommandation prioritaire pour l&apos;instant. Les KPI locaux restent insuffisants ou conformes.
          </p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {recommendations.slice(0, 5).map((recommendation) => (
              <article key={recommendation.id} className="rounded-md border border-line bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={recommendationPriorityVariant[recommendation.priority]}>
                    Priorité {recommendationPriorityLabels[recommendation.priority]}
                  </Badge>
                  <Badge>{recommendation.category}</Badge>
                  <Badge>Effort {recommendation.effort}</Badge>
                  <Badge>Urgence {recommendation.urgency}</Badge>
                  {recommendation.sourceType === "dataset_groupby_insight" ? <Badge variant="brand">Dataset / Group By</Badge> : null}
                  {recommendation.groupValue ? <Badge>Groupe {recommendation.groupValue}</Badge> : null}
                  {knownRecommendationIds.has(recommendation.id) ? <Badge variant="success">Plan créé</Badge> : null}
                </div>
                <h3 className="mt-3 font-semibold text-ink">{recommendation.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{recommendation.summary}</p>
                <p className="mt-3 text-sm font-medium text-ink">Impact attendu : {recommendation.expectedImpact}</p>
                {recommendation.recommendedActions[0] ? (
                  <div className="mt-3 rounded-md bg-white p-3">
                    <p className="text-sm font-semibold text-ink">{recommendation.recommendedActions[0].label}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{recommendation.recommendedActions[0].description}</p>
                  </div>
                ) : null}
                {recommendation.evidence[0] ? (
                  <p className="mt-3 text-xs text-slate-500">
                    Preuve : {recommendation.evidence[0].label} - {recommendation.evidence[0].value}
                  </p>
                ) : null}
                <RecommendationConfidenceBlock
                  confidence={confidenceItems.find((item) => item.recommendationId === recommendation.id)}
                />
                <Button
                  className="mt-4"
                  disabled={knownRecommendationIds.has(recommendation.id)}
                  onClick={() => createPlan(recommendation)}
                >
                  {knownRecommendationIds.has(recommendation.id) ? "Plan créé" : "Créer un plan d'action"}
                </Button>
                <RecommendationFeedbackPanel
                  recommendation={recommendation}
                  feedback={feedbackItems.find((item) => item.recommendationId === recommendation.id)}
                  actionPlans={actionPlans}
                  actionPlanImpacts={actionPlanImpacts}
                  onSaved={onDataChanged}
                />
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecommendationFeedbackDashboard({
  recommendations,
  feedbackItems
}: {
  recommendations: LocalRecommendation[];
  feedbackItems: LocalRecommendationFeedback[];
}) {
  const stats = calculateRecommendationFeedbackStats(recommendations, feedbackItems);

  return (
    <Card className="border-brand-100">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Feedback sur les recommandations</CardTitle>
          <Badge variant="brand">Boucle métier</Badge>
          <Badge>{stats.feedbackCount} feedback(s)</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Mesure simple de la pertinence perçue, du suivi et de l&apos;impact observé.
        </p>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="rounded-md border border-line bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Recommandations</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{stats.generatedCount}</p>
        </div>
        <div className="rounded-md border border-line bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Feedback enregistrés</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{stats.feedbackCount}</p>
        </div>
        <div className="rounded-md border border-line bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Pertinence</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{stats.relevanceRate}%</p>
        </div>
        <div className="rounded-md border border-line bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Taux de suivi</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{stats.followRate}%</p>
        </div>
        <div className="rounded-md border border-line bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Impacts positifs</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{stats.positiveImpactCount}</p>
        </div>
        <div className="rounded-md border border-line bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Impacts négatifs</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{stats.negativeImpactCount}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionPlanImpactOverview({ impacts }: { impacts: LocalActionPlanImpact[] }) {
  const positiveCount = impacts.filter((impact) => impact.status === "positive").length;
  const negativeCount = impacts.filter((impact) => impact.status === "negative").length;
  const pendingCount = impacts.filter((impact) => impact.status === "pending" || impact.status === "not_measurable").length;
  const visibleImpacts = impacts.slice(0, 4);

  return (
    <Card className="border-brand-100">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Efficacité des plans d&apos;action</CardTitle>
          <Badge variant="brand">Mesure locale</Badge>
          <Badge variant={positiveCount > 0 ? "success" : "default"}>{positiveCount} positif(s)</Badge>
          <Badge variant={negativeCount > 0 ? "danger" : "default"}>{negativeCount} négatif(s)</Badge>
          <Badge>{pendingCount} en attente</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Lecture simple des impacts mesurés sur les KPI liés aux plans locaux.
        </p>
      </CardHeader>
      <CardContent>
        {visibleImpacts.length === 0 ? (
          <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
            Aucun impact mesuré pour l&apos;instant. Lancez une mesure depuis Plans d&apos;action après un nouveau point KPI.
          </p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {visibleImpacts.map((impact) => (
              <article key={impact.id} className="rounded-md border border-line bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={impact.status === "positive" ? "success" : impact.status === "negative" ? "danger" : "warning"}>
                    {impact.status === "positive" ? "Fonctionne" : impact.status === "negative" ? "À revoir" : "À confirmer"}
                  </Badge>
                  <Badge>KPI {impact.relatedKpiId}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{impact.interpretation}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Variation : {impact.variation === undefined ? "non disponible" : `${impact.variation > 0 ? "+" : ""}${impact.variation.toFixed(1)}%`}
                </p>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DecisionActivityCard({ entries }: { entries: DecisionJournalEntry[] }) {
  const visibleEntries = entries.slice(0, 5);

  return (
    <Card className="border-brand-100">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Activité Atlas récente</CardTitle>
          <Badge variant="brand">Journal décisionnel</Badge>
          <Badge>{entries.length} événement(s)</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Dernières traces locales des recommandations, plans, feedbacks, impacts et validations mémoire.
        </p>
      </CardHeader>
      <CardContent>
        {visibleEntries.length === 0 ? (
          <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
            Aucun événement décisionnel local pour l&apos;instant.
          </p>
        ) : (
          <div className="space-y-3">
            {visibleEntries.map((entry, index) => (
              <article key={`${entry.id}-${index}`} className="rounded-md border border-line bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{journalEntryTypeLabels[entry.type]}</Badge>
                  {entry.priority ? <Badge>Priorité {entry.priority}</Badge> : null}
                  {entry.status ? <Badge>{entry.status}</Badge> : null}
                  {entry.confidenceScore !== undefined ? <Badge variant="brand">{entry.confidenceScore} %</Badge> : null}
                </div>
                <h3 className="mt-2 text-sm font-semibold text-ink">{entry.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{entry.description}</p>
                <p className="mt-2 text-xs text-slate-500">{formatDate(entry.createdAt)}</p>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TopPrioritiesCard({ priorities }: { priorities: LocalPriorityItem[] }) {
  const visiblePriorities = priorities.slice(0, 3);

  return (
    <Card className="border-brand-100">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Top priorités Atlas</CardTitle>
          <Badge variant="brand">À traiter maintenant</Badge>
          <Badge>{visiblePriorities.length} sujet(s)</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Classement déterministe issu des KPI, alertes, recommandations, plans, impacts, feedbacks et mémoire validée.
        </p>
      </CardHeader>
      <CardContent>
        {visiblePriorities.length === 0 ? (
          <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
            Aucune priorité particulière détectée.
          </p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-3">
            {visiblePriorities.map((priority) => (
              <article key={`pilotage-${priority.id}`} className="rounded-md border border-line bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="brand">#{priority.rank}</Badge>
                  <Badge variant={priorityUrgencyVariant(priority.urgency)}>{priorityUrgencyLabels[priority.urgency]}</Badge>
                  <Badge>{priority.priorityScore}/100</Badge>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-ink">{priority.title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-600">{priority.summary}</p>
                <p className="mt-3 text-xs font-medium text-ink">{priority.recommendedNextAction}</p>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ExecutiveDashboardLinkCard() {
  return (
    <Card className="border-brand-100">
      <CardContent className="flex flex-col justify-between gap-4 p-5 lg:flex-row lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brand">Dashboard dirigeant</Badge>
            <Badge>Synthèse exécutive</Badge>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Accédez à la lecture la plus synthétique : situation, priorités, risques, actions, décisions récentes et confiance Atlas.
          </p>
        </div>
        <Link
          href="/executive"
          className="inline-flex h-9 items-center justify-center rounded-md bg-brand-600 px-3 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          Voir le dashboard dirigeant
        </Link>
      </CardContent>
    </Card>
  );
}

function DatasetActivityCard({
  datasetCount,
  analysisCount,
  insightCount,
  recommendationCount,
  planCount,
  topSignals
}: {
  datasetCount: number;
  analysisCount: number;
  insightCount: number;
  recommendationCount: number;
  planCount: number;
  topSignals: string[];
}) {
  return (
    <Card className="border-brand-100">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Activité Dataset</CardTitle>
          <Badge variant="brand">Donnée → Décision</Badge>
          <Badge>{insightCount} signal(aux)</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Synthèse des données externes transformées en analyses, recommandations et plans.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-5">
          <Badge>{datasetCount} dataset(s)</Badge>
          <Badge>{analysisCount} analyse(s)</Badge>
          <Badge>{insightCount} insight(s)</Badge>
          <Badge>{recommendationCount} recommandation(s)</Badge>
          <Badge>{planCount} plan(s)</Badge>
        </div>
        {topSignals.length === 0 ? (
          <p className="rounded-md border border-line bg-slate-50 p-3 text-sm text-slate-600">
            Aucun signal Dataset exploitable pour l&apos;instant.
          </p>
        ) : (
          <div className="grid gap-2 lg:grid-cols-3">
            {topSignals.map((signal, index) => (
              <p key={`dataset-signal-${index}-${signal}`} className="rounded-md border border-line bg-slate-50 p-3 text-sm leading-5 text-slate-700">
                {signal}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function LocalKpiPilotageSection({ baseScore }: { baseScore: number }) {
  const [mounted, setMounted] = useState(false);
  const { data: workspace, refresh } = useLocalKpiWorkspace();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KPI personnalisés</CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Chargement des données locales du cockpit.
          </p>
        </CardHeader>
      </Card>
    );
  }

  const results = workspace.results;
  const insights = workspace.insights;
  const summary = workspace.executiveSummary;
  const usedMemoryReferences = workspace.usedMemoryReferences;
  const availableMemoryKnowledge = getAvailableApprovedMemoryKnowledge(workspace.approvedMemoryKnowledge, usedMemoryReferences);
  const recommendations = workspace.recommendations;
  const actionPlans = workspace.actionPlans;
  const actionPlanImpacts = workspace.actionPlanImpacts;
  const recommendationFeedback = workspace.recommendationFeedback;
  const recommendationConfidence = workspace.recommendationConfidence;
  const decisionJournalEntries = workspace.decisionJournalEntries;
  const priorities = workspace.priorities;
  const datasetRecommendationCount = recommendations.filter((recommendation) => recommendation.sourceType === "dataset_groupby_insight").length;
  const datasetPlanCount = actionPlans.filter((plan) => plan.sourceType === "dataset_groupby_insight").length;
  const topDatasetSignals = workspace.datasetGroupByInsights.slice(0, 3).map((insight) =>
    `${insight.title} - ${insight.groupValue}`
  );

  if (results.length === 0) {
    return (
      <div className="space-y-6">
        <ExecutiveDashboardLinkCard />
        <DatasetActivityCard
          datasetCount={workspace.datasets.length}
          analysisCount={workspace.datasetGroupByAnalyses.length}
          insightCount={workspace.datasetGroupByInsights.length}
          recommendationCount={datasetRecommendationCount}
          planCount={datasetPlanCount}
          topSignals={topDatasetSignals}
        />
        <Card>
          <CardHeader>
            <CardTitle>KPI personnalisés</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Aucun KPI local n&apos;alimente encore le cockpit. Créez un KPI depuis Imports & mappings pour l&apos;exploiter ici.
            </p>
          </CardHeader>
        </Card>
        <TopPrioritiesCard priorities={priorities} />
        <MemoryReferencesCard usedReferences={usedMemoryReferences} availableKnowledge={availableMemoryKnowledge} />
        <DecisionActivityCard entries={decisionJournalEntries} />
      </div>
    );
  }

  const adjustedScore = calculateScoreWithLocalKpis(baseScore, results);
  const criticalCount = results.filter((result) => result.status === "critical").length;
  const watchCount = results.filter((result) => result.status === "watch").length;
  const ruleAlertCount = workspace.alerts.filter((alert) => alert.alertSource === "rule").length;

  return (
    <div className="space-y-6">
      <ExecutiveDashboardLinkCard />
      <DatasetActivityCard
        datasetCount={workspace.datasets.length}
        analysisCount={workspace.datasetGroupByAnalyses.length}
        insightCount={workspace.datasetGroupByInsights.length}
        recommendationCount={datasetRecommendationCount}
        planCount={datasetPlanCount}
        topSignals={topDatasetSignals}
      />
      <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="border-brand-100">
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">Données importées</Badge>
              <Badge>{results.length} KPI personnalisés pris en compte</Badge>
            </div>
            <p className="mt-4 text-sm text-slate-500">Score Atlas ajusté localement</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-4xl font-semibold text-ink">{adjustedScore}</span>
              <span className="pb-1 text-sm text-slate-500">/100</span>
            </div>
            <Progress value={adjustedScore} className="mt-5" />
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Calcul déterministe : un KPI conforme ajoute un léger bonus, un KPI à surveiller ou critique dégrade le score.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant={criticalCount > 0 ? "danger" : "default"}>{criticalCount} critiques</Badge>
              <Badge variant={watchCount > 0 ? "warning" : "default"}>{watchCount} à surveiller</Badge>
              {ruleAlertCount > 0 ? <Badge variant="warning">{ruleAlertCount} règle(s) déclenchée(s)</Badge> : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>KPI personnalisés</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Résultats issus des imports CSV locaux. Ils complètent les KPI historiques sans les remplacer.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 lg:grid-cols-2">
              {results.map((result) => {
                const history = workspace.historyByKpiId[result.kpiId] ?? [];

                return (
                  <article key={result.id} className="rounded-md border border-line bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-ink">{result.name}</h3>
                        <p className="mt-1 text-xs text-slate-500">{calculationLabels[result.calculationType]} - {result.sourceFileName}</p>
                      </div>
                      <Badge variant={statusVariant[result.status]}>{statusLabels[result.status]}</Badge>
                    </div>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <p className="text-2xl font-semibold text-ink">{result.value}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <TrendIcon trend={result.trend} />
                        {formatVariation(result.variation)}
                      </div>
                    </div>
                    {history.length > 1 ? (
                      <div className="mt-3 flex h-8 items-end gap-1">
                        {history.slice(0, 8).reverse().map((point) => {
                          const maxValue = Math.max(...history.slice(0, 8).map((item) => Math.abs(item.value)), 1);
                          return (
                            <span
                              key={point.id}
                              className="flex-1 rounded-t bg-brand-200"
                              style={{ height: `${Math.max(20, (Math.abs(point.value) / maxValue) * 100)}%` }}
                            />
                          );
                        })}
                      </div>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {result.displayFieldLabel ? <Badge>Champ personnalisé</Badge> : null}
                      <Badge>{formatKpiDirection(result.direction)}</Badge>
                      <Badge>Local</Badge>
                      <Badge>Non persisté</Badge>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">Calculé le {formatDate(result.calculatedAt)}</p>
                  </article>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      {summary ? (
        <Card className="border-brand-100">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Synthèse dirigeant locale</CardTitle>
              <Badge variant="brand">Générée par Atlas</Badge>
              <Badge>Non persistée</Badge>
            </div>
            <p className="mt-2 text-base font-medium leading-7 text-ink">{summary.globalSituation}</p>
            <p className="text-xs text-slate-500">
              Éléments utilisés : {summary.relatedKpiIds.length} KPI, {summary.relatedAlertIds.length} alerte(s), tendances et règles locales.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            <SummaryList title="Risques prioritaires" items={summary.mainRisks} />
            <SummaryList title="Actions recommandées" items={summary.recommendedActions} />
            <SummaryList title="Fiabilité des données" items={summary.dataReliabilityNotes} />
            {summary.memoryHighlights.length > 0 ? (
              <SummaryList title="Mémoire Atlas" items={summary.memoryHighlights} />
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <RecommendationsSection
        recommendations={recommendations}
        actionPlans={actionPlans}
        actionPlanImpacts={actionPlanImpacts}
        feedbackItems={recommendationFeedback}
        confidenceItems={recommendationConfidence}
        onDataChanged={refresh}
      />

      <RecommendationFeedbackDashboard recommendations={recommendations} feedbackItems={recommendationFeedback} />

      <ActionPlanImpactOverview impacts={actionPlanImpacts} />

      <TopPrioritiesCard priorities={priorities} />

      <DecisionActivityCard entries={decisionJournalEntries} />

      <MemoryReferencesCard usedReferences={usedMemoryReferences} availableKnowledge={availableMemoryKnowledge} />

      <Card className="border-brand-100">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Lecture Atlas des KPI personnalisés</CardTitle>
            <Badge variant="brand">Déterministe</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Analyse locale basée sur les valeurs, seuils, tendances, règles d&apos;alerte et historique disponible.
          </p>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
              Aucun insight local prioritaire pour l&apos;instant. Recalculez un KPI ou ajoutez une règle d&apos;alerte pour enrichir la lecture.
            </p>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {insights.slice(0, 5).map((insight) => (
                <article key={insight.id} className="rounded-md border border-line bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-ink">{insight.title}</h3>
                    <Badge variant={insightVariant[insight.severity]}>{insightLabels[insight.severity]}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{insight.summary}</p>
                  {insight.evidence[0] ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Preuve : {insight.evidence[0].kpiName} = {insight.evidence[0].value}
                      {insight.evidence[0].variation !== undefined ? ` (${formatVariation(insight.evidence[0].variation)})` : ""}
                    </p>
                  ) : null}
                  {insight.memorySources?.length ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Source mémoire : {insight.memorySources.join(", ")}. Connaissance : {insight.memoryKnowledgeLabels?.join(", ") ?? "validée"}.
                    </p>
                  ) : null}
                  <p className="mt-3 text-sm font-medium text-ink">{insight.recommendedAction}</p>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
