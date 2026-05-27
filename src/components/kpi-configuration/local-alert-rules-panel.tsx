"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BellRing, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  deleteLocalAlertRule,
  getLocalAlertRulesByKpiId,
  saveLocalAlertRule,
  updateLocalAlertRule
} from "@/lib/local/local-alert-rules-store";
import {
  deleteLocalAlertRuleAction,
  saveLocalAlertRuleAction,
  toggleLocalAlertRuleAction,
  updateLocalAlertRuleAction
} from "@/lib/actions/local-alert-rules-actions";
import type {
  LocalAlertComparisonOperator,
  LocalAlertRule,
  LocalAlertRuleSeverity,
  LocalAlertRuleType
} from "@/types/local-alert-rules";
import type { LocalKpiConfiguration } from "@/types/local-kpi";

type PersistenceSource = "local" | "prisma" | "fallback";

const ruleTypeOptions: { value: LocalAlertRuleType; label: string }[] = [
  { value: "threshold", label: "Seuil simple" },
  { value: "target-gap", label: "Écart objectif" },
  { value: "variation", label: "Variation" },
  { value: "persistence", label: "Persistance" }
];

const operatorOptions: { value: LocalAlertComparisonOperator; label: string; ruleType: LocalAlertRuleType }[] = [
  { value: "greater_than", label: "Supérieur à", ruleType: "threshold" },
  { value: "less_than", label: "Inférieur à", ruleType: "threshold" },
  { value: "target_gap_greater_than", label: "Écart objectif supérieur à", ruleType: "target-gap" },
  { value: "target_gap_less_than", label: "Écart objectif inférieur à", ruleType: "target-gap" },
  { value: "variation_up_greater_than", label: "Hausse supérieure à", ruleType: "variation" },
  { value: "variation_down_greater_than", label: "Baisse supérieure à", ruleType: "variation" },
  { value: "consecutive_periods", label: "N périodes consécutives", ruleType: "persistence" }
];

function defaultOperator(ruleType: LocalAlertRuleType): LocalAlertComparisonOperator {
  return operatorOptions.find((option) => option.ruleType === ruleType)?.value ?? "greater_than";
}

function defaultDraft(kpi: LocalKpiConfiguration): LocalAlertRule {
  const now = new Date().toISOString();
  const isLowerBetter = kpi.direction === "lower_is_better";

  return {
    id: `local-alert-rule-${kpi.id}-${Date.now()}`,
    organizationId: kpi.organizationId,
    kpiId: kpi.id,
    name: isLowerBetter ? "Dépassement à surveiller" : "Sous-performance à surveiller",
    isActive: true,
    ruleType: "threshold",
    severity: "warning",
    condition: isLowerBetter ? "valeur supérieure au seuil" : "valeur inférieure au seuil",
    thresholdValue: kpi.warningThreshold,
    comparisonOperator: isLowerBetter ? "greater_than" : "less_than",
    consecutivePeriods: 2,
    variationPercent: 10,
    message: `${kpi.name} déclenche une règle d'alerte personnalisée.`,
    recommendedAction: "Vérifier l'écart, confirmer le seuil métier puis prioriser une action corrective.",
    createdAt: now,
    updatedAt: now,
    persisted: false
  };
}

function needsThreshold(rule: LocalAlertRule) {
  return rule.ruleType === "threshold" || rule.ruleType === "target-gap";
}

function needsVariation(rule: LocalAlertRule) {
  return rule.ruleType === "variation";
}

function needsPeriods(rule: LocalAlertRule) {
  return rule.ruleType === "persistence";
}

function validateRule(rule: LocalAlertRule) {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!rule.name.trim()) errors.push("Le nom de la règle est obligatoire.");
  if (needsThreshold(rule) && !Number.isFinite(rule.thresholdValue)) errors.push("La valeur seuil est obligatoire.");
  if (needsVariation(rule) && !Number.isFinite(rule.variationPercent)) errors.push("Le pourcentage de variation est obligatoire.");
  if (needsPeriods(rule) && (!rule.consecutivePeriods || rule.consecutivePeriods < 2)) {
    errors.push("La persistance doit couvrir au moins 2 périodes.");
  }
  if (!rule.message.trim()) warnings.push("Le message est recommandé pour rendre l'alerte lisible.");

  return { errors, warnings };
}

function conditionLabel(rule: LocalAlertRule) {
  const operatorLabel = operatorOptions.find((option) => option.value === rule.comparisonOperator)?.label;
  if (needsPeriods(rule)) return `${rule.consecutivePeriods ?? 2} périodes consécutives`;
  if (needsVariation(rule)) return `${operatorLabel} ${rule.variationPercent ?? 0} %`;
  return `${operatorLabel} ${rule.thresholdValue ?? 0}`;
}

function sourceLabel(source: PersistenceSource) {
  if (source === "prisma") return "Prisma";
  if (source === "fallback") return "Fallback local";
  return "Local";
}

export function LocalAlertRulesPanel({ kpi }: { kpi: LocalKpiConfiguration }) {
  const [isOpen, setIsOpen] = useState(false);
  const [rules, setRules] = useState<LocalAlertRule[]>([]);
  const [draft, setDraft] = useState<LocalAlertRule>(() => defaultDraft(kpi));
  const [source, setSource] = useState<PersistenceSource>("local");

  const reloadRules = useCallback(() => {
    setRules(getLocalAlertRulesByKpiId(kpi.id));
  }, [kpi.id]);

  useEffect(() => {
    const timeoutId = window.setTimeout(reloadRules, 0);
    return () => window.clearTimeout(timeoutId);
  }, [reloadRules]);

  const validation = useMemo(() => validateRule(draft), [draft]);
  const availableOperators = operatorOptions.filter((option) => option.ruleType === draft.ruleType);

  function update<K extends keyof LocalAlertRule>(key: K, value: LocalAlertRule[K]) {
    setDraft((current) => ({ ...current, [key]: value, updatedAt: new Date().toISOString() }));
  }

  function updateRuleType(ruleType: LocalAlertRuleType) {
    setDraft((current) => ({
      ...current,
      ruleType,
      comparisonOperator: defaultOperator(ruleType),
      updatedAt: new Date().toISOString()
    }));
  }

  function persistSource(promise: Promise<{ source: PersistenceSource }>) {
    void promise.then((result) => setSource(result.source)).catch(() => setSource("fallback"));
  }

  function saveRule() {
    if (validation.errors.length > 0) return;
    const nextRule = {
      ...draft,
      organizationId: kpi.organizationId,
      condition: conditionLabel(draft),
      updatedAt: new Date().toISOString()
    };

    saveLocalAlertRule(nextRule);
    persistSource(saveLocalAlertRuleAction({ organizationId: kpi.organizationId, rule: nextRule }));
    setDraft(defaultDraft(kpi));
    reloadRules();
  }

  function editRule(rule: LocalAlertRule) {
    setDraft(rule);
    setIsOpen(true);
  }

  function toggleRule(rule: LocalAlertRule) {
    const nextRule = { ...rule, isActive: !rule.isActive, updatedAt: new Date().toISOString() };
    updateLocalAlertRule(nextRule);
    persistSource(toggleLocalAlertRuleAction({ organizationId: kpi.organizationId, rule }));
    reloadRules();
  }

  function deleteRule(id: string) {
    deleteLocalAlertRule(id);
    persistSource(deleteLocalAlertRuleAction(id));
    reloadRules();
  }

  return (
    <div className="mt-4 rounded-md border border-line bg-slate-50 p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="brand">Règles d&apos;alerte</Badge>
          <Badge>{rules.length} règle(s)</Badge>
          <Badge variant={source === "fallback" ? "warning" : "default"}>{sourceLabel(source)}</Badge>
        </div>
        <Button className="h-9 justify-center" onClick={() => setIsOpen((current) => !current)}>
          <BellRing className="h-4 w-4" aria-hidden="true" />
          Règles d&apos;alerte
        </Button>
      </div>

      {rules.length > 0 ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {rules.map((rule) => (
            <article key={rule.id} className="rounded-md border border-line bg-white p-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-ink">{rule.name}</p>
                <Badge variant={rule.severity === "critical" ? "danger" : "warning"}>
                  {rule.severity === "critical" ? "Critique" : "Surveillance"}
                </Badge>
                <Badge variant={rule.isActive ? "success" : "default"}>{rule.isActive ? "Active" : "Inactive"}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-600">{conditionLabel(rule)}</p>
              <p className="mt-2 text-sm font-medium text-ink">{rule.message}</p>
              <p className="mt-1 text-xs text-slate-500">{rule.recommendedAction}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button className="h-8" onClick={() => editRule(rule)}>Modifier</Button>
                <Button className="h-8" onClick={() => toggleRule(rule)}>
                  {rule.isActive ? "Désactiver" : "Activer"}
                </Button>
                <Button className="h-8" onClick={() => deleteRule(rule.id)}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Supprimer
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          Aucune règle personnalisée. Les alertes classiques par statut restent actives.
        </p>
      )}

      {isOpen ? (
        <div className="mt-4 rounded-md border border-brand-100 bg-white p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <label>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Nom règle</span>
              <input
                value={draft.name}
                onChange={(event) => update("name", event.target.value)}
                className="mt-2 h-9 w-full rounded-md border border-line px-3 text-sm"
              />
            </label>
            <label>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Type règle</span>
              <select
                value={draft.ruleType}
                onChange={(event) => updateRuleType(event.target.value as LocalAlertRuleType)}
                className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm"
              >
                {ruleTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Criticité</span>
              <select
                value={draft.severity}
                onChange={(event) => update("severity", event.target.value as LocalAlertRuleSeverity)}
                className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm"
              >
                <option value="warning">Surveillance</option>
                <option value="critical">Critique</option>
              </select>
            </label>
            <label>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Condition</span>
              <select
                value={draft.comparisonOperator}
                onChange={(event) => update("comparisonOperator", event.target.value as LocalAlertComparisonOperator)}
                className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm"
              >
                {availableOperators.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            {needsThreshold(draft) ? (
              <label>
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Valeur seuil</span>
                <input
                  type="number"
                  value={draft.thresholdValue ?? 0}
                  onChange={(event) => update("thresholdValue", Number(event.target.value))}
                  className="mt-2 h-9 w-full rounded-md border border-line px-3 text-sm"
                />
              </label>
            ) : null}
            {needsVariation(draft) ? (
              <label>
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Variation %</span>
                <input
                  type="number"
                  value={draft.variationPercent ?? 0}
                  onChange={(event) => update("variationPercent", Number(event.target.value))}
                  className="mt-2 h-9 w-full rounded-md border border-line px-3 text-sm"
                />
              </label>
            ) : null}
            {needsPeriods(draft) ? (
              <label>
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Périodes</span>
                <input
                  type="number"
                  value={draft.consecutivePeriods ?? 2}
                  onChange={(event) => update("consecutivePeriods", Number(event.target.value))}
                  className="mt-2 h-9 w-full rounded-md border border-line px-3 text-sm"
                />
              </label>
            ) : null}
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Message alerte</span>
              <input
                value={draft.message}
                onChange={(event) => update("message", event.target.value)}
                className="mt-2 h-9 w-full rounded-md border border-line px-3 text-sm"
              />
            </label>
            <label>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Action recommandée</span>
              <input
                value={draft.recommendedAction}
                onChange={(event) => update("recommendedAction", event.target.value)}
                className="mt-2 h-9 w-full rounded-md border border-line px-3 text-sm"
              />
            </label>
          </div>

          {[...validation.errors, ...validation.warnings].length > 0 ? (
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {[...validation.errors, ...validation.warnings].map((item) => <p key={item}>{item}</p>)}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="primary" onClick={saveRule} disabled={validation.errors.length > 0}>
              Enregistrer la règle
            </Button>
            <Button onClick={() => setDraft(defaultDraft(kpi))}>Réinitialiser</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
