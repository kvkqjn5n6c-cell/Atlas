import type { DatasetGroupByAnalysis, DatasetGroupByResult } from "@/lib/datasets/dataset-groupby-types";
import type { DatasetGroupByInsight, DatasetGroupByInsightSeverity } from "@/lib/datasets/dataset-groupby-insight-types";

function now() {
  return new Date().toISOString();
}

function normalizeId(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function totalValue(results: DatasetGroupByResult[]) {
  return results.reduce((total, result) => total + result.value, 0);
}

function averageValue(results: DatasetGroupByResult[]) {
  return results.length === 0 ? 0 : totalValue(results) / results.length;
}

function gapRatio(best?: DatasetGroupByResult, worst?: DatasetGroupByResult) {
  if (!best || !worst) return 0;
  if (worst.value === 0) return best.value > 0 ? Number.POSITIVE_INFINITY : 0;
  return best.value / Math.abs(worst.value);
}

function severityFromGap(gap: number): DatasetGroupByInsightSeverity {
  if (gap >= 1000) return "critical";
  if (gap > 0) return "watch";
  return "info";
}

function insightId(analysis: DatasetGroupByAnalysis, type: string, groupValue: string) {
  return `groupby-insight-${normalizeId(analysis.id)}-${type}-${normalizeId(groupValue)}`;
}

export function detectBestGroup(analysis: DatasetGroupByAnalysis): DatasetGroupByInsight | null {
  const best = analysis.results[0];
  if (!best) return null;

  return {
    id: insightId(analysis, "best", best.groupValue),
    datasetId: analysis.datasetId,
    groupByAnalysisId: analysis.id,
    title: `${best.groupValue} ressort comme meilleur groupe`,
    summary: `${analysis.groupedBy.label} ${best.groupValue} presente la valeur la plus elevee : ${best.value}.`,
    insightType: "best_group",
    severity: "info",
    groupValue: best.groupValue,
    value: best.value,
    reasons: ["Valeur maximale observee dans l'analyse comparative."],
    recommendedAction: "Identifier les pratiques ou facteurs qui expliquent cette performance.",
    createdAt: now(),
    persisted: false
  };
}

export function detectWeakGroup(analysis: DatasetGroupByAnalysis): DatasetGroupByInsight | null {
  const weak = analysis.results.length > 0 ? analysis.results[analysis.results.length - 1] : undefined;
  const best = analysis.results[0];
  if (!weak || !best || weak.groupValue === best.groupValue) return null;

  const gap = Math.round((best.value - weak.value) * 100) / 100;

  return {
    id: insightId(analysis, "weak", weak.groupValue),
    datasetId: analysis.datasetId,
    groupByAnalysisId: analysis.id,
    title: `${weak.groupValue} ressort comme groupe faible`,
    summary: `${analysis.groupedBy.label} ${weak.groupValue} presente la valeur la plus basse : ${weak.value}.`,
    insightType: "weak_group",
    severity: severityFromGap(gap),
    groupValue: weak.groupValue,
    value: weak.value,
    comparisonValue: best.value,
    gap,
    reasons: ["Valeur minimale observee dans l'analyse comparative.", `Ecart avec le meilleur groupe : ${gap}.`],
    recommendedAction: "Verifier si ce groupe necessite une action corrective ou une analyse complementaire.",
    createdAt: now(),
    persisted: false
  };
}

export function detectConcentration(analysis: DatasetGroupByAnalysis): DatasetGroupByInsight | null {
  const best = analysis.results[0];
  const total = totalValue(analysis.results);
  if (!best || total <= 0) return null;

  const share = Math.round((best.value / total) * 100);
  if (share <= 50) return null;

  return {
    id: insightId(analysis, "concentration", best.groupValue),
    datasetId: analysis.datasetId,
    groupByAnalysisId: analysis.id,
    title: `${best.groupValue} concentre ${share}% de la valeur`,
    summary: `${analysis.groupedBy.label} ${best.groupValue} pese plus de la moitie de l'analyse (${share}%).`,
    insightType: "concentration",
    severity: share >= 70 ? "critical" : "watch",
    groupValue: best.groupValue,
    value: best.value,
    comparisonValue: total,
    gap: share,
    reasons: [`Part du premier groupe superieure a 50% : ${share}%.`],
    recommendedAction: "Evaluer si cette concentration represente une dependance ou une opportunite prioritaire.",
    createdAt: now(),
    persisted: false
  };
}

export function detectDispersion(analysis: DatasetGroupByAnalysis): DatasetGroupByInsight | null {
  const best = analysis.results[0];
  const worst = analysis.results.length > 0 ? analysis.results[analysis.results.length - 1] : undefined;
  if (!best || !worst || analysis.results.length < 2) return null;

  const gap = Math.round((best.value - worst.value) * 100) / 100;
  const ratio = gapRatio(best, worst);
  if (gap <= 0 || ratio < 2) return null;

  return {
    id: insightId(analysis, "dispersion", `${best.groupValue}-${worst.groupValue}`),
    datasetId: analysis.datasetId,
    groupByAnalysisId: analysis.id,
    title: `Ecart marque entre ${best.groupValue} et ${worst.groupValue}`,
    summary: `L'ecart entre le meilleur et le moins bon groupe atteint ${gap}.`,
    insightType: "dispersion",
    severity: ratio >= 4 ? "critical" : "watch",
    groupValue: best.groupValue,
    value: best.value,
    comparisonValue: worst.value,
    gap,
    reasons: [`Ratio max/min superieur a 2 (${Number.isFinite(ratio) ? Math.round(ratio * 100) / 100 : "infini"}).`],
    recommendedAction: "Comparer les causes operationnelles entre les groupes extremes.",
    createdAt: now(),
    persisted: false
  };
}

export function detectAnomalyCandidate(analysis: DatasetGroupByAnalysis): DatasetGroupByInsight | null {
  const best = analysis.results[0];
  if (!best || analysis.results.length < 3) return null;

  const average = averageValue(analysis.results);
  if (average === 0) return null;

  const distance = Math.abs(best.value - average);
  const ratio = distance / Math.abs(average);
  if (ratio < 0.8) return null;

  return {
    id: insightId(analysis, "anomaly", best.groupValue),
    datasetId: analysis.datasetId,
    groupByAnalysisId: analysis.id,
    title: `${best.groupValue} se distingue fortement du reste`,
    summary: `${best.groupValue} est tres eloigne de la moyenne simple des groupes (${Math.round(average * 100) / 100}).`,
    insightType: "anomaly_candidate",
    severity: ratio >= 1.5 ? "critical" : "watch",
    groupValue: best.groupValue,
    value: best.value,
    comparisonValue: Math.round(average * 100) / 100,
    gap: Math.round(distance * 100) / 100,
    reasons: ["Ecart important avec la moyenne simple des groupes.", "Signal deterministe a verifier avant decision."],
    recommendedAction: "Controler la qualite des donnees et analyser ce groupe en priorite.",
    createdAt: now(),
    persisted: false
  };
}

export function rankGroupByInsights(insights: DatasetGroupByInsight[]) {
  const severityRank: Record<DatasetGroupByInsight["severity"], number> = {
    critical: 3,
    watch: 2,
    info: 1
  };
  const typeRank: Record<DatasetGroupByInsight["insightType"], number> = {
    concentration: 5,
    anomaly_candidate: 4,
    dispersion: 3,
    weak_group: 2,
    best_group: 1
  };

  return [...insights].sort((first, second) =>
    severityRank[second.severity] - severityRank[first.severity] ||
    typeRank[second.insightType] - typeRank[first.insightType] ||
    (second.gap ?? 0) - (first.gap ?? 0)
  );
}

export function generateGroupByInsights(analysis: DatasetGroupByAnalysis): DatasetGroupByInsight[] {
  if (analysis.results.length === 0) return [];

  return rankGroupByInsights([
    detectBestGroup(analysis),
    detectWeakGroup(analysis),
    detectConcentration(analysis),
    detectDispersion(analysis),
    detectAnomalyCandidate(analysis)
  ].filter((insight): insight is DatasetGroupByInsight => Boolean(insight)));
}
