import { dataPreviewRowsMock } from "@/lib/mock/data-imports";
import type { DataPreviewRow, DataSource } from "@/types/atlas";

export type ImportParserResult = {
  sourceId: string;
  columns: string[];
  rows: DataPreviewRow[];
};

export function parseImportPreview(source: DataSource): ImportParserResult {
  const rows = dataPreviewRowsMock.filter((row) => row.dataSourceId === source.id);
  const columns = Object.keys(rows[0]?.values ?? {});

  return {
    sourceId: source.id,
    columns,
    rows
  };
}

export function createEmptyImportPreview(sourceId: string): ImportParserResult {
  return {
    sourceId,
    columns: [],
    rows: []
  };
}

// TODO Phase 3: brancher ici les parseurs Excel, CSV et connecteurs base de donnees.
