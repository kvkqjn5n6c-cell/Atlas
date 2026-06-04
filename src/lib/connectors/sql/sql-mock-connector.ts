import {
  SQL_PREVIEW_ROW_LIMIT,
  type SqlColumnInfo,
  type SqlConnectionConfig,
  type SqlConnectionTestResult,
  type SqlConnector,
  type SqlSchemaReadResult,
  type SqlTableInfo,
  type SqlTablePreviewResult
} from "@/lib/connectors/sql/sql-types";

const interventionColumns: SqlColumnInfo[] = [
  { name: "date_intervention", dataType: "date", nullable: false, ordinalPosition: 1 },
  { name: "client", dataType: "varchar", nullable: false, ordinalPosition: 2 },
  { name: "region", dataType: "varchar", nullable: false, ordinalPosition: 3 },
  { name: "montant_ht", dataType: "decimal", nullable: false, ordinalPosition: 4 },
  { name: "marge", dataType: "decimal", nullable: true, ordinalPosition: 5 },
  { name: "cout_sous_traitance", dataType: "decimal", nullable: true, ordinalPosition: 6 },
  { name: "satisfaction", dataType: "int", nullable: true, ordinalPosition: 7 }
];

const customerColumns: SqlColumnInfo[] = [
  { name: "id", dataType: "int", nullable: false, ordinalPosition: 1 },
  { name: "nom", dataType: "varchar", nullable: false, ordinalPosition: 2 },
  { name: "segment", dataType: "varchar", nullable: true, ordinalPosition: 3 },
  { name: "actif", dataType: "bit", nullable: false, ordinalPosition: 4 }
];

const tables: SqlTableInfo[] = [
  { schema: "dbo", name: "interventions", type: "table", columns: interventionColumns },
  { schema: "dbo", name: "clients", type: "table", columns: customerColumns },
  { schema: "reporting", name: "vue_marge_region", type: "view", columns: interventionColumns.slice(0, 5) }
];

export function createMockSqlConnector(latencyMs = 24): SqlConnector {
  return {
    async testConnection(config: SqlConnectionConfig): Promise<SqlConnectionTestResult> {
      return {
        success: true,
        message: "Connexion SQL simulee en lecture seule.",
        provider: config.provider,
        latencyMs
      };
    },

    async readSchema(config: SqlConnectionConfig): Promise<SqlSchemaReadResult> {
      return {
        provider: config.provider,
        tables: tables.filter((table) => table.type === "table"),
        views: tables.filter((table) => table.type === "view"),
        readAt: new Date().toISOString()
      };
    },

    async readTablePreview(config: SqlConnectionConfig, tableName: string, schema?: string): Promise<SqlTablePreviewResult> {
      const table = tables.find((item) => item.name === tableName && (schema === undefined || item.schema === schema)) ?? tables[0];
      const rows = table.name === "clients"
        ? [
            { id: 1, nom: "Client A", segment: "Maintenance", actif: true },
            { id: 2, nom: "Client B", segment: "Industrie", actif: true }
          ]
        : [
            {
              date_intervention: "2026-05-01",
              client: "Client A",
              region: "Est",
              montant_ht: 4200,
              marge: 28,
              cout_sous_traitance: 1250,
              satisfaction: 7
            },
            {
              date_intervention: "2026-05-08",
              client: "Client B",
              region: "Ouest",
              montant_ht: 5100,
              marge: 31,
              cout_sous_traitance: 800,
              satisfaction: 8
            }
          ];

      return {
        provider: config.provider,
        tableName: table.name,
        schema: table.schema,
        columns: table.columns,
        rows: rows.slice(0, SQL_PREVIEW_ROW_LIMIT),
        rowLimit: SQL_PREVIEW_ROW_LIMIT,
        readAt: new Date().toISOString()
      };
    }
  };
}
