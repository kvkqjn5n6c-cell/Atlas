import { suggestAtlasField } from "@/lib/data-pipeline/mapping-suggestions";
import type { DetectedColumn, DetectedColumnType, FilePreviewRow, ParsedFileResult } from "@/types/data-import";

const maxPreviewRows = 50;

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

function detectDelimiter(headerLine: string): "," | ";" {
  const commaCount = (headerLine.match(/,/g) ?? []).length;
  const semicolonCount = (headerLine.match(/;/g) ?? []).length;

  return semicolonCount > commaCount ? ";" : ",";
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

export function detectColumns(rows: FilePreviewRow[]): DetectedColumn[] {
  const columnNames = Object.keys(rows[0]?.values ?? {});

  return columnNames.map((name) => {
    const values = rows.map((row) => row.values[name] ?? "");
    const examples = Array.from(new Set(values.filter(Boolean))).slice(0, 3);

    return {
      name,
      detectedType: detectColumnType(values),
      examples,
      suggestedAtlasField: suggestAtlasField(name)
    };
  });
}

export async function parseCsvFile(file: File): Promise<ParsedFileResult> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "xlsx") {
    return {
      fileName: file.name,
      fileType: "xlsx",
      columns: [],
      rows: [],
      totalRows: 0,
      errors: ["Excel sera ajouté dans une prochaine étape. Utilisez CSV pour ce test."]
    };
  }

  if (extension !== "csv") {
    return {
      fileName: file.name,
      fileType: "unsupported",
      columns: [],
      rows: [],
      totalRows: 0,
      errors: ["Format non supporté pour cette phase. Utilisez un fichier CSV."]
    };
  }

  const startedAt = performance.now();
  const text = await file.text();
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return {
      fileName: file.name,
      fileType: "csv",
      columns: [],
      rows: [],
      totalRows: 0,
      errors: ["Le fichier CSV doit contenir une ligne d'en-têtes et au moins une ligne de données."]
    };
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = splitCsvLine(lines[0], delimiter).map((header, index) => header || `Colonne ${index + 1}`);
  const errors: string[] = [];
  const rows = lines.slice(1).map((line, rowIndex) => {
    const values = splitCsvLine(line, delimiter);

    if (values.length !== headers.length) {
      errors.push(`Ligne ${rowIndex + 2} : nombre de colonnes incohérent.`);
    }

    return {
      id: `row-${rowIndex + 1}`,
      values: headers.reduce<Record<string, string>>((accumulator, header, columnIndex) => {
        accumulator[header] = values[columnIndex] ?? "";
        return accumulator;
      }, {})
    };
  });

  const previewRows = rows.slice(0, maxPreviewRows);
  const result = {
    fileName: file.name,
    fileType: "csv" as const,
    delimiter,
    columns: detectColumns(previewRows),
    rows: previewRows,
    totalRows: rows.length,
    errors
  };

  performance.measure?.("atlas-local-csv-import", { start: startedAt, end: performance.now() });

  return result;
}
