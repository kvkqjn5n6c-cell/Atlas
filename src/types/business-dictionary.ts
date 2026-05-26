import type { DetectedColumnType } from "@/types/data-import";

export type BusinessDictionaryField = {
  id: string;
  organizationId: string;
  label: string;
  normalizedLabel: string;
  sourceColumns: string[];
  detectedType: DetectedColumnType;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  linkedKpis: string[];
  tags?: string[];
  examples?: string[];
  persisted: false;
};

export type BusinessDictionarySuggestion = {
  matched: boolean;
  confidence: number;
  suggestedField?: BusinessDictionaryField;
  sourceColumn: string;
  reason: string;
};
