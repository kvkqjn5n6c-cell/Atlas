import { columnMappingsMock } from "@/lib/mock/data-imports";
import type { AtlasField, ColumnMapping } from "@/types/atlas";

const heuristicDictionary: Record<string, AtlasField> = {
  date: "Date",
  date_cmd: "Date",
  intervention_date: "Date",
  client: "Client",
  montant_ht: "ChiffreAffaires",
  ca: "ChiffreAffaires",
  marge_pct: "Marge",
  marge_brute: "Marge",
  region: "Region",
  statut: "StatutMission",
  statut_mission: "StatutMission",
  tresorerie: "Tresorerie",
  quality_score: "Qualite"
};

export function getMappingsForSource(dataSourceId: string): ColumnMapping[] {
  return columnMappingsMock.filter((mapping) => mapping.dataSourceId === dataSourceId);
}

export function suggestColumnMappings(dataSourceId: string, columns: string[]): ColumnMapping[] {
  return columns.map((column, index) => {
    const normalizedColumn = column.toLowerCase();
    const atlasField = heuristicDictionary[normalizedColumn] ?? "NonMappe";
    const isMapped = atlasField !== "NonMappe";

    return {
      id: `suggested-${dataSourceId}-${index + 1}`,
      dataSourceId,
      sourceColumn: column,
      atlasField,
      status: isMapped ? "mapped" : "unmapped",
      confidence: isMapped ? 72 : 0
    };
  });
}

export function calculateMappingQuality(mappings: ColumnMapping[]) {
  if (mappings.length === 0) {
    return 0;
  }

  const mappedColumns = mappings.filter((mapping) => mapping.status === "mapped");
  const confidenceTotal = mappedColumns.reduce((total, mapping) => total + mapping.confidence, 0);
  const coverageScore = (mappedColumns.length / mappings.length) * 100;
  const confidenceScore = mappedColumns.length > 0 ? confidenceTotal / mappedColumns.length : 0;

  return Math.round(coverageScore * 0.6 + confidenceScore * 0.4);
}

// TODO Phase 3: ajouter un dictionnaire configurable par organisation et un historique de validation.
