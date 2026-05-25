import type { DataPreviewRow } from "@/types/atlas";

export type ImportValidationError = {
  rowId: string;
  column: string;
  message: string;
};

export type ImportValidationResult = {
  validRows: number;
  rejectedRows: number;
  errors: ImportValidationError[];
};

const requiredColumns = ["date_cmd", "montant_ht"];

export function validatePreviewRows(rows: DataPreviewRow[]): ImportValidationResult {
  const errors = rows.flatMap((row) =>
    requiredColumns
      .filter((column) => row.values[column] === undefined || row.values[column] === "")
      .map((column) => ({
        rowId: row.id,
        column,
        message: "Champ requis manquant pour le calcul KPI."
      }))
  );

  const rejectedRowIds = new Set(errors.map((error) => error.rowId));

  return {
    validRows: rows.length - rejectedRowIds.size,
    rejectedRows: rejectedRowIds.size,
    errors
  };
}

export function hasBlockingImportErrors(result: ImportValidationResult) {
  return result.rejectedRows > 0 || result.errors.length > 10;
}

// TODO Phase 3: rendre les regles dependantes du type de source et du modele KPI attendu.
