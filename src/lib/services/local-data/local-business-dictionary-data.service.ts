import {
  deleteBusinessDictionaryField,
  getBusinessDictionary,
  registerBusinessFieldUsage,
  updateBusinessDictionaryField
} from "@/lib/local/business-dictionary-store";
import type { BusinessDictionaryField } from "@/types/business-dictionary";
import type { DetectedColumnType } from "@/types/data-import";
import type { LocalDataResult } from "@/types/local-data-result";

export function getLocalBusinessDictionaryData(organizationId: string): LocalDataResult<BusinessDictionaryField[]> {
  return {
    data: getBusinessDictionary(organizationId),
    source: "localStorage",
    fallbackUsed: false,
    warnings: [],
    lastUpdated: new Date().toISOString()
  };
}

export function updateLocalBusinessDictionaryField(field: BusinessDictionaryField) {
  updateBusinessDictionaryField(field);
}

export function deleteLocalBusinessDictionaryField(id: string) {
  deleteBusinessDictionaryField(id);
}

export function registerLocalBusinessFieldUsage(input: {
  organizationId: string;
  label: string;
  sourceColumn: string;
  detectedType: DetectedColumnType;
  linkedKpi?: string;
  examples?: string[];
  tags?: string[];
}) {
  return registerBusinessFieldUsage(input);
}
