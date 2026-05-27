"use server";

import {
  deleteLocalAlertRuleData,
  saveLocalAlertRuleData,
  toggleLocalAlertRuleData,
  updateLocalAlertRuleData
} from "@/lib/services/local-alert-rules.service";
import type { LocalAlertRule } from "@/types/local-alert-rules";

export async function saveLocalAlertRuleAction(input: { organizationId: string; rule: LocalAlertRule }) {
  const result = await saveLocalAlertRuleData(input.rule, input.organizationId);
  return {
    success: true,
    source: result.source,
    data: result.data
  };
}

export async function updateLocalAlertRuleAction(input: { organizationId: string; rule: LocalAlertRule }) {
  const result = await updateLocalAlertRuleData(input.rule, input.organizationId);
  return {
    success: true,
    source: result.source,
    data: result.data
  };
}

export async function toggleLocalAlertRuleAction(input: { organizationId: string; rule: LocalAlertRule }) {
  const result = await toggleLocalAlertRuleData(input.rule, input.organizationId);
  return {
    success: true,
    source: result.source,
    data: result.data
  };
}

export async function deleteLocalAlertRuleAction(id: string) {
  const result = await deleteLocalAlertRuleData(id);
  return {
    success: true,
    source: result.source
  };
}
