"use server";

import {
  deleteBusinessDictionaryField,
  registerBusinessFieldUsage,
  updateBusinessDictionaryField
} from "@/lib/repositories/business-dictionary.repository";
import type { BusinessDictionaryField } from "@/types/business-dictionary";
import type { DetectedColumnType } from "@/types/data-import";

export async function registerBusinessFieldUsageAction(input: {
  organizationId: string;
  label: string;
  sourceColumn: string;
  detectedType: DetectedColumnType;
  linkedKpi?: string;
  tags?: string[];
  examples?: string[];
}) {
  return registerBusinessFieldUsage(input);
}

export async function updateBusinessDictionaryFieldAction(field: BusinessDictionaryField) {
  return updateBusinessDictionaryField(field);
}

export async function deleteBusinessDictionaryFieldAction(id: string) {
  return deleteBusinessDictionaryField(id);
}
