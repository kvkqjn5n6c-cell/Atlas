import { isPrismaMode } from "@/lib/config/data-mode";
import {
  createLocalAlertRule,
  deleteLocalAlertRule,
  getLocalAlertRuleById,
  getLocalAlertRulesByKpiId,
  getLocalAlertRulesByOrganization,
  toggleLocalAlertRule,
  updateLocalAlertRule,
  wasLocalAlertRulesFallbackUsed
} from "@/lib/repositories/local-alert-rules.repository";
import type { LocalAlertRule } from "@/types/local-alert-rules";

function currentSource() {
  if (wasLocalAlertRulesFallbackUsed()) return "fallback" as const;
  return isPrismaMode() ? "prisma" as const : "local" as const;
}

export async function getLocalAlertRulesData(organizationId: string) {
  const data = await getLocalAlertRulesByOrganization(organizationId);
  return {
    data,
    source: currentSource()
  };
}

export async function getLocalAlertRulesByKpiData(kpiId: string, organizationId?: string) {
  const data = await getLocalAlertRulesByKpiId(kpiId, organizationId);
  return {
    data,
    source: currentSource()
  };
}

export async function getLocalAlertRuleByIdData(id: string, organizationId?: string) {
  const data = await getLocalAlertRuleById(id, organizationId);
  return {
    data,
    source: currentSource()
  };
}

export async function saveLocalAlertRuleData(rule: LocalAlertRule, organizationId: string) {
  const data = await createLocalAlertRule(rule, organizationId);
  return {
    data,
    source: currentSource()
  };
}

export const createLocalAlertRuleData = saveLocalAlertRuleData;

export async function updateLocalAlertRuleData(rule: LocalAlertRule, organizationId: string) {
  const data = await updateLocalAlertRule(rule, organizationId);
  return {
    data,
    source: currentSource()
  };
}

export async function toggleLocalAlertRuleData(rule: LocalAlertRule, organizationId: string) {
  const data = await toggleLocalAlertRule(rule, organizationId);
  return {
    data,
    source: currentSource()
  };
}

export async function deleteLocalAlertRuleData(id: string) {
  await deleteLocalAlertRule(id);
  return {
    success: true,
    source: currentSource()
  };
}
