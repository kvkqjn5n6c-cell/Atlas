import type { DetectedColumnType } from "@/types/data-import";
import type { BusinessDictionaryField } from "@/types/business-dictionary";

const storageKey = "atlas:business-dictionary";

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function normalizeBusinessLabel(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getAllFields(): BusinessDictionaryField[] {
  if (!canUseLocalStorage()) return [];

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) return [];
    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? (parsedValue as BusinessDictionaryField[]) : [];
  } catch (error) {
    console.warn("Impossible de relire le dictionnaire métier local Atlas.", error);
    return [];
  }
}

function saveAllFields(fields: BusinessDictionaryField[]) {
  if (!canUseLocalStorage()) return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(fields));
  } catch (error) {
    console.warn("Impossible d'enregistrer le dictionnaire métier local Atlas.", error);
  }
}

export function getBusinessDictionary(organizationId: string) {
  return getAllFields().filter((field) => field.organizationId === organizationId);
}

export function saveBusinessDictionaryField(field: BusinessDictionaryField) {
  const fields = getAllFields().filter((item) => item.id !== field.id);
  saveAllFields([field, ...fields]);
}

export function updateBusinessDictionaryField(field: BusinessDictionaryField) {
  saveBusinessDictionaryField({
    ...field,
    normalizedLabel: normalizeBusinessLabel(field.label),
    updatedAt: new Date().toISOString(),
    persisted: false
  });
}

export function registerBusinessFieldUsage(input: {
  organizationId: string;
  label: string;
  sourceColumn: string;
  detectedType: DetectedColumnType;
  linkedKpi?: string;
  examples?: string[];
  tags?: string[];
}) {
  const normalizedLabel = normalizeBusinessLabel(input.label);
  if (!normalizedLabel) return null;

  const fields = getAllFields();
  const existing = fields.find(
    (field) => field.organizationId === input.organizationId && field.normalizedLabel === normalizedLabel
  );
  const now = new Date().toISOString();

  if (existing) {
    const updatedField: BusinessDictionaryField = {
      ...existing,
      sourceColumns: Array.from(new Set([...existing.sourceColumns, input.sourceColumn])),
      linkedKpis: Array.from(new Set([...existing.linkedKpis, ...(input.linkedKpi ? [input.linkedKpi] : [])])),
      examples: Array.from(new Set([...(existing.examples ?? []), ...(input.examples ?? [])])).slice(0, 6),
      tags: Array.from(new Set([...(existing.tags ?? []), ...(input.tags ?? [])])),
      usageCount: existing.usageCount + 1,
      detectedType: existing.detectedType === "empty" ? input.detectedType : existing.detectedType,
      updatedAt: now,
      persisted: false
    };
    saveAllFields([updatedField, ...fields.filter((field) => field.id !== existing.id)]);
    return updatedField;
  }

  const nextField: BusinessDictionaryField = {
    id: `business-field-${Date.now()}-${normalizedLabel.replace(/\s/g, "-")}`,
    organizationId: input.organizationId,
    label: input.label.trim(),
    normalizedLabel,
    sourceColumns: [input.sourceColumn],
    detectedType: input.detectedType,
    usageCount: 1,
    createdAt: now,
    updatedAt: now,
    linkedKpis: input.linkedKpi ? [input.linkedKpi] : [],
    examples: input.examples ?? [],
    tags: input.tags ?? [],
    persisted: false
  };

  saveAllFields([nextField, ...fields]);
  return nextField;
}

export function deleteBusinessDictionaryField(id: string) {
  saveAllFields(getAllFields().filter((field) => field.id !== id));
}

export function clearBusinessDictionary(organizationId: string) {
  saveAllFields(getAllFields().filter((field) => field.organizationId !== organizationId));
}
