import { describe, expect, it } from "vitest";
import { validateSqlConnectionConfig } from "@/lib/connectors/sql/sql-connector";
import { createMockSqlConnector } from "@/lib/connectors/sql/sql-mock-connector";
import { readTablePreview } from "@/lib/connectors/sql/sql-preview-reader";
import { readSqlSchema } from "@/lib/connectors/sql/sql-schema-reader";
import { testSqlConnection } from "@/lib/connectors/sql/sql-test-connection";
import { SQL_PREVIEW_ROW_LIMIT, type SqlConnectionConfig } from "@/lib/connectors/sql/sql-types";

const validConfig: SqlConnectionConfig = {
  id: "sql-postgresql-local",
  name: "PostgreSQL demo",
  provider: "postgresql",
  host: "localhost",
  port: 5432,
  database: "atlas_demo",
  username: "readonly",
  password: "demo-only",
  readonly: true,
  persisted: false
};

describe("sql connector v1", () => {
  it("valide une configuration SQL complete", () => {
    const validation = validateSqlConnectionConfig(validConfig);

    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it("refuse une configuration incomplete", () => {
    const validation = validateSqlConnectionConfig({
      ...validConfig,
      host: "",
      port: 0,
      password: ""
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThanOrEqual(3);
  });

  it("teste une connexion mock en lecture seule", async () => {
    const result = await testSqlConnection(validConfig, createMockSqlConnector(12));

    expect(result).toMatchObject({
      success: true,
      provider: "postgresql",
      latencyMs: 12
    });
  });

  it("lit un schema mock avec tables et vues", async () => {
    const schema = await readSqlSchema(validConfig, createMockSqlConnector());

    expect(schema.tables.length).toBeGreaterThan(0);
    expect(schema.views.length).toBeGreaterThan(0);
    expect(schema.tables[0].columns.length).toBeGreaterThan(0);
  });

  it("lit un apercu table mock limite a 100 lignes", async () => {
    const preview = await readTablePreview(validConfig, "interventions", "dbo", createMockSqlConnector());

    expect(preview.tableName).toBe("interventions");
    expect(preview.rowLimit).toBe(SQL_PREVIEW_ROW_LIMIT);
    expect(preview.rows.length).toBeLessThanOrEqual(SQL_PREVIEW_ROW_LIMIT);
    expect(preview.columns.some((column) => column.name === "cout_sous_traitance")).toBe(true);
  });
});
