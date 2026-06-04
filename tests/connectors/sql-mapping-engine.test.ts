import { describe, expect, it } from "vitest";
import {
  createMapping,
  getMappedColumns,
  suggestSqlMappings,
  updateMapping,
  validateMapping
} from "@/lib/connectors/sql/sql-mapping-engine";
import type { SqlTableInfo } from "@/lib/connectors/sql/sql-types";

const table: SqlTableInfo = {
  schema: "dbo",
  name: "interventions",
  type: "table",
  columns: [
    { name: "date_realisation", dataType: "date", nullable: false, ordinalPosition: 1 },
    { name: "client_name", dataType: "varchar", nullable: false, ordinalPosition: 2 },
    { name: "region", dataType: "varchar", nullable: true, ordinalPosition: 3 },
    { name: "cout_sous_traitance", dataType: "decimal", nullable: true, ordinalPosition: 4 },
    { name: "statut", dataType: "varchar", nullable: true, ordinalPosition: 5 }
  ]
};

describe("sql mapping engine", () => {
  it("cree un mapping depuis une table SQL", () => {
    const mapping = createMapping({ connectionId: "sql-demo", table });

    expect(mapping.tableMapping.tableName).toBe("interventions");
    expect(mapping.columnMappings).toHaveLength(table.columns.length);
    expect(getMappedColumns(mapping).length).toBeGreaterThan(0);
  });

  it("suggere des champs Atlas depuis les noms de colonnes", () => {
    const suggestions = suggestSqlMappings(table.columns);

    expect(suggestions.find((item) => item.sourceColumn === "date_realisation")?.suggestedField).toBe("date");
    expect(suggestions.find((item) => item.sourceColumn === "client_name")?.suggestedField).toBe("client");
    expect(suggestions.find((item) => item.sourceColumn === "cout_sous_traitance")?.suggestedField).toBe("cost");
  });

  it("valide un mapping complet avec un score eleve", () => {
    const mapping = createMapping({ connectionId: "sql-demo", table });
    const validation = validateMapping(mapping);

    expect(validation.valid).toBe(true);
    expect(validation.qualityScore).toBeGreaterThanOrEqual(80);
    expect(validation.missingRequiredFields).toHaveLength(0);
  });

  it("detecte les champs obligatoires manquants", () => {
    const mapping = createMapping({
      connectionId: "sql-demo",
      table: {
        ...table,
        columns: table.columns.filter((column) => column.name !== "date_realisation")
      }
    });
    const validation = validateMapping(mapping);

    expect(validation.valid).toBe(false);
    expect(validation.missingRequiredFields).toContain("Date");
  });

  it("detecte les doublons de champ Atlas", () => {
    const mapping = createMapping({ connectionId: "sql-demo", table });
    const duplicateMapping = updateMapping({
      mapping,
      sourceColumn: "region",
      targetField: "client",
      enabled: true
    });
    const validation = validateMapping(duplicateMapping);

    expect(validation.valid).toBe(false);
    expect(validation.duplicateTargetFields).toContain("client");
  });

  it("met a jour une colonne sans perdre le reste du mapping", () => {
    const mapping = createMapping({ connectionId: "sql-demo", table });
    const updated = updateMapping({
      mapping,
      sourceColumn: "statut",
      targetField: "category",
      enabled: true
    });

    expect(updated.columnMappings.find((column) => column.sourceColumn === "statut")?.targetField).toBe("category");
    expect(updated.columnMappings.find((column) => column.sourceColumn === "client_name")?.targetField).toBe("client");
  });
});
