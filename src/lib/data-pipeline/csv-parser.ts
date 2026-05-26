import { MAX_PREVIEW_ROWS } from "@/lib/config/import-limits";
import { buildImportStatistics } from "@/lib/data-pipeline/import-statistics";
import { suggestAtlasField } from "@/lib/data-pipeline/mapping-suggestions";
import type { ColumnStatistics } from "@/lib/data-pipeline/import-statistics";
import type { DetectedColumn, DetectedColumnType, FilePreviewRow, ParsedFileResult } from "@/types/data-import";

function splitCsvLine(line: string, delimiter: "," | ";") {
  const values: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === delimiter && !insideQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function countDelimiterOutsideQuotes(line: string, delimiter: "," | ";") {
  let count = 0;
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') insideQuotes = !insideQuotes;
    if (char === delimiter && !insideQuotes) count += 1;
  }

  return count;
}

function detectDelimiter(sampleLines: string[]): "," | ";" {
  const commaScore = sampleLines.reduce((total, line) => total + countDelimiterOutsideQuotes(line, ","), 0);
  const semicolonScore = sampleLines.reduce((total, line) => total + countDelimiterOutsideQuotes(line, ";"), 0);

  return semicolonScore > commaScore ? ";" : ",";
}

function isNumeric(value: string) {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  return normalized !== "" && Number.isFinite(Number(normalized));
}

function isDateLike(value: string) {
  const trimmedValue = value.trim();
  if (!trimmedValue || isNumeric(trimmedValue)) return false;
  const isoLike = /^\d{4}-\d{2}-\d{2}/.test(trimmedValue);
  const frenchLike = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(trimmedValue);

  return isoLike || frenchLike;
}

export function detectColumnType(values: string[]): DetectedColumnType {
  const filledValues = values.map((value) => value.trim()).filter(Boolean);
  if (filledValues.length === 0) return "empty";

  const lowerValues = filledValues.map((value) => value.toLowerCase());
  const dateCount = filledValues.filter(isDateLike).length;
  const numberCount = filledValues.filter(isNumeric).length;
  const booleanCount = lowerValues.filter((value) => ["oui", "non", "true", "false", "0", "1"].includes(value)).length;
  const statusKeywords = ["payé", "paye", "retard", "terminé", "termine", "ouvert", "fermé", "ferme", "annulé", "annule"];
  const statusCount = lowerValues.filter((value) => statusKeywords.some((keyword) => value.includes(keyword))).length;

  if (dateCount / filledValues.length >= 0.7) return "date";
  if (numberCount / filledValues.length >= 0.7) return "number";
  if (booleanCount / filledValues.length >= 0.7) return "boolean";
  if (statusCount / filledValues.length >= 0.45) return "status";

  return "text";
}

function buildDetectedColumns(
  headers: string[],
  columnSamples: Record<string, string[]>,
  emptyCellsByColumn: Record<string, number>,
  totalRows: number
) {
  const columnStatistics: ColumnStatistics[] = headers.map((name) => {
    const type = detectColumnType(columnSamples[name] ?? []);

    return {
      name,
      type,
      emptyCells: emptyCellsByColumn[name] ?? 0,
      missingRatio: totalRows > 0 ? Math.round(((emptyCellsByColumn[name] ?? 0) / totalRows) * 100) / 100 : 0
    };
  });

  const columns: DetectedColumn[] = headers.map((name) => ({
    name,
    detectedType: columnStatistics.find((column) => column.name === name)?.type ?? "text",
    examples: Array.from(new Set((columnSamples[name] ?? []).filter(Boolean))).slice(0, 3),
    suggestedAtlasField: suggestAtlasField(name)
  }));

  return { columns, columnStatistics };
}

export function detectColumns(rows: FilePreviewRow[]): DetectedColumn[] {
  const headers = Object.keys(rows[0]?.values ?? {});
  const columnSamples = headers.reduce<Record<string, string[]>>((accumulator, header) => {
    accumulator[header] = rows.map((row) => row.values[header] ?? "");
    return accumulator;
  }, {});
  const emptyCellsByColumn = headers.reduce<Record<string, number>>((accumulator, header) => {
    accumulator[header] = rows.filter((row) => !row.values[header]?.trim()).length;
    return accumulator;
  }, {});

  return buildDetectedColumns(headers, columnSamples, emptyCellsByColumn, rows.length).columns;
}

function unsupportedResult(file: File, message: string, fileType: ParsedFileResult["fileType"]): ParsedFileResult {
  return {
    fileName: file.name,
    fileType,
    columns: [],
    rows: [],
    totalRows: 0,
    errors: [message],
    warnings: []
  };
}

export async function parseCsvFile(file: File): Promise<ParsedFileResult> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "xlsx") {
    return unsupportedResult(
      file,
      "Excel sera ajouté dans une prochaine étape. Utilisez CSV pour ce test.",
      "xlsx"
    );
  }

  if (extension !== "csv") {
    return unsupportedResult(file, "Format non supporté pour cette phase. Utilisez un fichier CSV.", "unsupported");
  }

  const startedAt = performance.now();
  const text = await file.text();
  const rawLines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const lines = rawLines.map((line) => line.trim()).filter(Boolean);

  if (lines.length < 2) {
    return unsupportedResult(
      file,
      "Le fichier CSV doit contenir une ligne d'en-têtes et au moins une ligne de données.",
      "csv"
    );
  }

  const delimiter = detectDelimiter(lines.slice(0, Math.min(lines.length, 20)));
  const headers = splitCsvLine(lines[0], delimiter).map((header, index) => header || `Colonne ${index + 1}`);
  const errors: string[] = [];
  const warnings: string[] = [
    `Aperçu limité à ${MAX_PREVIEW_ROWS} lignes pour préserver les performances.`,
    "Le fichier complet n'est pas stocké localement."
  ];
  const previewRows: FilePreviewRow[] = [];
  const columnSamples = headers.reduce<Record<string, string[]>>((accumulator, header) => {
    accumulator[header] = [];
    return accumulator;
  }, {});
  const emptyCellsByColumn = headers.reduce<Record<string, number>>((accumulator, header) => {
    accumulator[header] = 0;
    return accumulator;
  }, {});
  let totalRows = 0;

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const values = splitCsvLine(lines[lineIndex], delimiter);
    totalRows += 1;

    if (values.length !== headers.length) {
      errors.push(`Ligne ${lineIndex + 1} : nombre de colonnes incohérent.`);
    }

    const rowValues = headers.reduce<Record<string, string>>((accumulator, header, columnIndex) => {
      const value = values[columnIndex]?.trim() ?? "";
      accumulator[header] = value;

      if (!value) emptyCellsByColumn[header] += 1;
      if (columnSamples[header].length < MAX_PREVIEW_ROWS && value) {
        columnSamples[header].push(value);
      }

      return accumulator;
    }, {});

    if (previewRows.length < MAX_PREVIEW_ROWS) {
      previewRows.push({
        id: `row-${totalRows}`,
        values: rowValues
      });
    }
  }

  const parsingTimeMs = Math.round((performance.now() - startedAt) * 100) / 100;
  const { columns, columnStatistics } = buildDetectedColumns(headers, columnSamples, emptyCellsByColumn, totalRows);
  const statistics = buildImportStatistics({
    rowsRead: totalRows,
    fileSizeBytes: file.size,
    parsingTimeMs,
    columnStatistics
  });

  return {
    fileName: file.name,
    fileType: "csv",
    delimiter,
    columns,
    rows: previewRows,
    totalRows,
    errors,
    warnings,
    statistics
  };
}
