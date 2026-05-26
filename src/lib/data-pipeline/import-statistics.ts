import { LARGE_FILE_ROW_THRESHOLD } from "@/lib/config/import-limits";
import type { DetectedColumnType } from "@/types/data-import";

export type ColumnStatistics = {
  name: string;
  type: DetectedColumnType;
  emptyCells: number;
  missingRatio: number;
};

export type ImportStatistics = {
  rowsRead: number;
  columnCount: number;
  estimatedEmptyCells: number;
  numericColumns: number;
  dateColumns: number;
  textColumns: number;
  columnsWithMissingValues: string[];
  fileSizeBytes: number;
  parsingTimeMs: number;
  isLargeFile: boolean;
  columnStatistics: ColumnStatistics[];
};

export function buildImportStatistics({
  rowsRead,
  fileSizeBytes,
  parsingTimeMs,
  columnStatistics
}: {
  rowsRead: number;
  fileSizeBytes: number;
  parsingTimeMs: number;
  columnStatistics: ColumnStatistics[];
}): ImportStatistics {
  return {
    rowsRead,
    columnCount: columnStatistics.length,
    estimatedEmptyCells: columnStatistics.reduce((total, column) => total + column.emptyCells, 0),
    numericColumns: columnStatistics.filter((column) => column.type === "number").length,
    dateColumns: columnStatistics.filter((column) => column.type === "date").length,
    textColumns: columnStatistics.filter((column) => column.type === "text").length,
    columnsWithMissingValues: columnStatistics
      .filter((column) => column.emptyCells > 0)
      .map((column) => column.name),
    fileSizeBytes,
    parsingTimeMs,
    isLargeFile: rowsRead > LARGE_FILE_ROW_THRESHOLD,
    columnStatistics
  };
}
