import { isPrismaMode } from "@/lib/config/data-mode";
import {
  deleteLocalAlertRule as deleteLocalAlertRuleLocal,
  getLocalAlertRules,
  getLocalAlertRulesByKpiId as getLocalAlertRulesByKpiIdLocal,
  saveLocalAlertRule,
  updateLocalAlertRule as updateLocalAlertRuleLocal
} from "@/lib/local/local-alert-rules-store";
import {
  AlertComparisonOperator as PrismaAlertComparisonOperator,
  AlertRuleSeverity as PrismaAlertRuleSeverity,
  AlertRuleType as PrismaAlertRuleType
} from "@prisma/client";
import type {
  LocalAlertComparisonOperator,
  LocalAlertRule,
  LocalAlertRuleSeverity,
  LocalAlertRuleType
} from "@/types/local-alert-rules";

let lastFallbackUsed = false;

export function wasLocalAlertRulesFallbackUsed() {
  return lastFallbackUsed;
}

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

function toPrismaRuleType(ruleType: LocalAlertRuleType) {
  const map: Record<LocalAlertRuleType, PrismaAlertRuleType> = {
    threshold: PrismaAlertRuleType.THRESHOLD,
    "target-gap": PrismaAlertRuleType.TARGET_GAP,
    variation: PrismaAlertRuleType.VARIATION,
    persistence: PrismaAlertRuleType.PERSISTENCE
  };
  return map[ruleType];
}

function fromPrismaRuleType(ruleType: string): LocalAlertRuleType {
  const map: Record<string, LocalAlertRuleType> = {
    THRESHOLD: "threshold",
    TARGET_GAP: "target-gap",
    VARIATION: "variation",
    PERSISTENCE: "persistence"
  };
  return map[ruleType] ?? "threshold";
}

function toPrismaSeverity(severity: LocalAlertRuleSeverity) {
  return severity === "critical" ? PrismaAlertRuleSeverity.CRITICAL : PrismaAlertRuleSeverity.WARNING;
}

function fromPrismaSeverity(severity: string): LocalAlertRuleSeverity {
  return severity === "CRITICAL" ? "critical" : "warning";
}

function toPrismaOperator(operator: LocalAlertComparisonOperator) {
  const map: Record<LocalAlertComparisonOperator, PrismaAlertComparisonOperator> = {
    greater_than: PrismaAlertComparisonOperator.GREATER_THAN,
    less_than: PrismaAlertComparisonOperator.LESS_THAN,
    target_gap_greater_than: PrismaAlertComparisonOperator.TARGET_GAP_GREATER_THAN,
    target_gap_less_than: PrismaAlertComparisonOperator.TARGET_GAP_LESS_THAN,
    variation_up_greater_than: PrismaAlertComparisonOperator.VARIATION_UP_GREATER_THAN,
    variation_down_greater_than: PrismaAlertComparisonOperator.VARIATION_DOWN_GREATER_THAN,
    consecutive_periods: PrismaAlertComparisonOperator.CONSECUTIVE_PERIODS
  };
  return map[operator];
}

function fromPrismaOperator(operator: string): LocalAlertComparisonOperator {
  const map: Record<string, LocalAlertComparisonOperator> = {
    GREATER_THAN: "greater_than",
    LESS_THAN: "less_than",
    TARGET_GAP_GREATER_THAN: "target_gap_greater_than",
    TARGET_GAP_LESS_THAN: "target_gap_less_than",
    VARIATION_UP_GREATER_THAN: "variation_up_greater_than",
    VARIATION_DOWN_GREATER_THAN: "variation_down_greater_than",
    CONSECUTIVE_PERIODS: "consecutive_periods"
  };
  return map[operator] ?? "greater_than";
}

type LocalAlertRuleRecord = {
  id: string;
  organizationId: string;
  localKpiConfigurationId: string | null;
  kpiConfigurationId: string | null;
  name: string;
  isActive: boolean;
  ruleType: string;
  severity: string;
  comparisonOperator: string;
  thresholdValue: number | null;
  consecutivePeriods: number | null;
  variationPercent: number | null;
  message: string | null;
  recommendedAction: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function toLocalAlertRule(record: LocalAlertRuleRecord): LocalAlertRule {
  const ruleType = fromPrismaRuleType(record.ruleType);
  const comparisonOperator = fromPrismaOperator(record.comparisonOperator);

  return {
    id: record.id,
    organizationId: record.organizationId,
    kpiId: record.localKpiConfigurationId ?? record.kpiConfigurationId ?? "",
    kpiConfigurationId: record.kpiConfigurationId ?? undefined,
    name: record.name,
    isActive: record.isActive,
    ruleType,
    severity: fromPrismaSeverity(record.severity),
    condition: conditionFromRule(ruleType, comparisonOperator, record.thresholdValue, record.consecutivePeriods, record.variationPercent),
    thresholdValue: record.thresholdValue ?? undefined,
    comparisonOperator,
    consecutivePeriods: record.consecutivePeriods ?? undefined,
    variationPercent: record.variationPercent ?? undefined,
    message: record.message ?? "",
    recommendedAction: record.recommendedAction ?? "",
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    persisted: false
  };
}

function conditionFromRule(
  ruleType: LocalAlertRuleType,
  operator: LocalAlertComparisonOperator,
  thresholdValue: number | null,
  consecutivePeriods: number | null,
  variationPercent: number | null
) {
  if (ruleType === "persistence") return `${consecutivePeriods ?? 2} périodes consécutives`;
  if (ruleType === "variation") return `${operator} ${variationPercent ?? 0} %`;
  return `${operator} ${thresholdValue ?? 0}`;
}

function toPrismaData(rule: LocalAlertRule, organizationId: string) {
  const isLocalKpiRule = !rule.kpiConfigurationId;

  return {
    id: rule.id,
    organizationId,
    localKpiConfigurationId: isLocalKpiRule ? rule.kpiId : undefined,
    kpiConfigurationId: rule.kpiConfigurationId,
    name: rule.name,
    isActive: rule.isActive,
    ruleType: toPrismaRuleType(rule.ruleType),
    severity: toPrismaSeverity(rule.severity),
    comparisonOperator: toPrismaOperator(rule.comparisonOperator),
    thresholdValue: rule.thresholdValue,
    consecutivePeriods: rule.consecutivePeriods,
    variationPercent: rule.variationPercent,
    message: rule.message,
    recommendedAction: rule.recommendedAction,
    persistedSource: "prisma"
  };
}

export async function getLocalAlertRulesByOrganization(organizationId: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getLocalAlertRules().filter((rule) => !rule.organizationId || rule.organizationId === organizationId);

  try {
    const prisma = await getPrisma();
    const records = await prisma.localAlertRule.findMany({
      where: { organizationId },
      orderBy: { updatedAt: "desc" }
    });
    return records.map(toLocalAlertRule);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getLocalAlertRulesByOrganization failed, falling back to localStorage.", error);
    return getLocalAlertRules().filter((rule) => !rule.organizationId || rule.organizationId === organizationId);
  }
}

export async function getLocalAlertRulesByKpiId(kpiId: string, organizationId?: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getLocalAlertRulesByKpiIdLocal(kpiId);

  try {
    const prisma = await getPrisma();
    const records = await prisma.localAlertRule.findMany({
      where: {
        OR: [
          { localKpiConfigurationId: kpiId },
          { kpiConfigurationId: kpiId }
        ],
        ...(organizationId ? { organizationId } : {})
      },
      orderBy: { updatedAt: "desc" }
    });
    return records.map(toLocalAlertRule);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getLocalAlertRulesByKpiId failed, falling back to localStorage.", error);
    return getLocalAlertRulesByKpiIdLocal(kpiId);
  }
}

export async function createLocalAlertRule(rule: LocalAlertRule, organizationId: string) {
  return upsertLocalAlertRule(rule, organizationId);
}

export async function updateLocalAlertRule(rule: LocalAlertRule, organizationId: string) {
  return upsertLocalAlertRule({ ...rule, updatedAt: new Date().toISOString() }, organizationId);
}

async function upsertLocalAlertRule(rule: LocalAlertRule, organizationId: string) {
  lastFallbackUsed = false;
  const nextRule = { ...rule, organizationId };

  if (!isPrismaMode()) {
    saveLocalAlertRule(nextRule);
    return nextRule;
  }

  try {
    const prisma = await getPrisma();
    const record = await prisma.localAlertRule.upsert({
      where: { id: rule.id },
      create: toPrismaData(nextRule, organizationId),
      update: toPrismaData(nextRule, organizationId)
    });
    return toLocalAlertRule(record);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] upsertLocalAlertRule failed, falling back to localStorage.", error);
    saveLocalAlertRule(nextRule);
    return nextRule;
  }
}

export async function deleteLocalAlertRule(id: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    deleteLocalAlertRuleLocal(id);
    return;
  }

  try {
    const prisma = await getPrisma();
    await prisma.localAlertRule.delete({ where: { id } });
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] deleteLocalAlertRule failed, falling back to localStorage.", error);
    deleteLocalAlertRuleLocal(id);
  }
}

export async function toggleLocalAlertRule(rule: LocalAlertRule, organizationId: string) {
  const nextRule = { ...rule, isActive: !rule.isActive, updatedAt: new Date().toISOString() };
  updateLocalAlertRuleLocal(nextRule);
  return updateLocalAlertRule(nextRule, organizationId);
}
