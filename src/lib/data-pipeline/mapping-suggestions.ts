import type { AtlasField } from "@/types/atlas";
import type { DetectedColumn, LocalColumnMapping, LocalMappingValidation } from "@/types/data-import";

export const atlasFieldOptions: { value: AtlasField; label: string }[] = [
  { value: "Date", label: "Date" },
  { value: "Client", label: "Client" },
  { value: "Region", label: "Région" },
  { value: "ChiffreAffaires", label: "Chiffre d'affaires" },
  { value: "Marge", label: "Marge" },
  { value: "StatutMission", label: "Retard / statut" },
  { value: "Intervention", label: "Type intervention" },
  { value: "Qualite", label: "Satisfaction" },
  { value: "Tresorerie", label: "Montant" },
  { value: "NonMappe", label: "Non utilisé" }
];

const measurableFields = new Set<AtlasField>(["ChiffreAffaires", "Marge", "Tresorerie", "Qualite"]);

function normalizeColumnName(columnName: string) {
  return columnName
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function suggestAtlasField(columnName: string): AtlasField {
  const normalized = normalizeColumnName(columnName);

  if (normalized.includes("date")) return "Date";
  if (normalized.includes("client") || normalized.includes("societe") || normalized.includes("entreprise")) return "Client";
  if (normalized.includes("region") || normalized.includes("zone") || normalized.includes("secteur")) return "Region";
  if (
    normalized === "ca" ||
    normalized.includes("chiffre") ||
    normalized.includes("vente") ||
    normalized.includes("revenu")
  ) {
    return "ChiffreAffaires";
  }
  if (normalized.includes("montant") || normalized.includes("cash") || normalized.includes("encaisse")) return "Tresorerie";
  if (normalized.includes("marge")) return "Marge";
  if (normalized.includes("statut") || normalized.includes("etat")) return "StatutMission";
  if (normalized.includes("satisfaction") || normalized.includes("qualite") || normalized.includes("nps")) return "Qualite";
  if (normalized.includes("retard")) return "StatutMission";
  if (normalized.includes("type") || normalized.includes("intervention") || normalized.includes("mission")) return "Intervention";

  return "NonMappe";
}

export function getMappingFieldType(mapping: LocalColumnMapping) {
  if (mapping.fieldType) return mapping.fieldType;
  return mapping.atlasField === "NonMappe" ? "unused" : "standard";
}

export function getEffectiveAtlasField(mapping: LocalColumnMapping) {
  if (getMappingFieldType(mapping) !== "standard") return "NonMappe";
  return mapping.mappedAtlasField ?? mapping.atlasField;
}

export function getMappingDisplayLabel(mapping: LocalColumnMapping) {
  const fieldType = getMappingFieldType(mapping);
  if (fieldType === "custom") return mapping.customFieldLabel?.trim() || mapping.sourceColumn;
  if (fieldType === "unused") return "Non utilisé";

  return atlasFieldOptions.find((option) => option.value === getEffectiveAtlasField(mapping))?.label ?? mapping.sourceColumn;
}

export function buildInitialMappings(columns: DetectedColumn[]): LocalColumnMapping[] {
  return columns.map((column) => ({
    sourceColumn: column.name,
    atlasField: column.suggestedAtlasField,
    mappedAtlasField: column.suggestedAtlasField,
    fieldType: column.suggestedAtlasField === "NonMappe" ? "unused" : "standard"
  }));
}

export function validateLocalMapping(mappings: LocalColumnMapping[]): LocalMappingValidation {
  const usedMappings = mappings.filter((mapping) => getMappingFieldType(mapping) !== "unused");
  const standardFields = mappings.map(getEffectiveAtlasField);
  const hasDate = standardFields.includes("Date");
  const hasMeasurableField =
    standardFields.some((field) => measurableFields.has(field)) ||
    mappings.some((mapping) => getMappingFieldType(mapping) === "custom");
  const unmappedColumns = mappings
    .filter((mapping) => getMappingFieldType(mapping) === "unused")
    .map((mapping) => mapping.sourceColumn);
  const warnings: string[] = [];

  if (usedMappings.length === 0) {
    warnings.push("Aucune colonne n'est mappée vers un champ Atlas ou personnalisé.");
  }

  if (!hasDate) {
    warnings.push("Aucune colonne date n'est mappée : les analyses par période seront limitées.");
  }

  if (!hasMeasurableField) {
    warnings.push("Aucun champ métier mesurable n'est mappé : les KPI seront peu exploitables.");
  }

  const customWithoutLabel = mappings.filter(
    (mapping) => getMappingFieldType(mapping) === "custom" && !mapping.customFieldLabel?.trim()
  );

  if (customWithoutLabel.length > 0) {
    warnings.push(`${customWithoutLabel.length} champ(s) personnalisé(s) doivent recevoir un nom métier.`);
  }

  if (unmappedColumns.length > 0) {
    warnings.push(`${unmappedColumns.length} colonne(s) resteront non utilisées pour ce test local.`);
  }

  const qualityScore = Math.max(0, Math.round((usedMappings.length / Math.max(1, mappings.length)) * 100));

  return {
    isValid: usedMappings.length > 0 && customWithoutLabel.length === 0,
    warnings,
    unmappedColumns,
    mappedColumns: usedMappings.length,
    qualityScore
  };
}
