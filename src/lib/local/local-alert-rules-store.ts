import type { LocalAlertRule } from "@/types/local-alert-rules";

const storageKey = "atlas:local-alert-rules";
const maxRulesPerKpi = 12;

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function sortRules(rules: LocalAlertRule[]) {
  return [...rules].sort(
    (first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()
  );
}

function normalizeRule(rule: LocalAlertRule): LocalAlertRule {
  return {
    ...rule,
    isActive: rule.isActive ?? true,
    persisted: false
  };
}

export function getLocalAlertRules(): LocalAlertRule[] {
  if (!canUseLocalStorage()) return [];

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) return [];
    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? sortRules((parsedValue as LocalAlertRule[]).map(normalizeRule)) : [];
  } catch (error) {
    console.warn("Impossible de relire les règles d'alerte locales Atlas.", error);
    return [];
  }
}

export function getLocalAlertRulesByKpiId(kpiId: string) {
  return getLocalAlertRules().filter((rule) => rule.kpiId === kpiId);
}

export function saveLocalAlertRule(rule: LocalAlertRule) {
  if (!canUseLocalStorage()) return;

  try {
    const rules = getLocalAlertRules();
    const sameKpiRules = rules.filter((item) => item.kpiId === rule.kpiId && item.id !== rule.id);
    const otherRules = rules.filter((item) => item.kpiId !== rule.kpiId);
    const nextSameKpiRules = sortRules([normalizeRule(rule), ...sameKpiRules]).slice(0, maxRulesPerKpi);
    window.localStorage.setItem(storageKey, JSON.stringify(sortRules([...nextSameKpiRules, ...otherRules])));
  } catch (error) {
    console.warn("Impossible d'enregistrer la règle d'alerte locale Atlas.", error);
  }
}

export function updateLocalAlertRule(rule: LocalAlertRule) {
  saveLocalAlertRule({
    ...rule,
    updatedAt: new Date().toISOString()
  });
}

export function deleteLocalAlertRule(id: string) {
  if (!canUseLocalStorage()) return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(getLocalAlertRules().filter((rule) => rule.id !== id)));
  } catch (error) {
    console.warn("Impossible de supprimer la règle d'alerte locale Atlas.", error);
  }
}

export function clearLocalAlertRules() {
  if (!canUseLocalStorage()) return;

  try {
    window.localStorage.removeItem(storageKey);
  } catch (error) {
    console.warn("Impossible d'effacer les règles d'alerte locales Atlas.", error);
  }
}
