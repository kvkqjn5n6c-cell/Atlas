import {
  SQL_PREVIEW_ROW_LIMIT,
  type SqlColumnInfo,
  type SqlConnectionConfig,
  type SqlConnectionTestResult,
  type SqlConnector,
  type SqlPreviewCellValue,
  type SqlPreviewRow,
  type SqlProvider,
  type SqlSchemaReadResult,
  type SqlTableInfo,
  type SqlTablePreviewResult
} from "@/lib/connectors/sql/sql-types";

type UnknownRecord = Record<string, unknown>;

type QueryResult = {
  rows?: UnknownRecord[];
  recordset?: UnknownRecord[];
};

type QueryableClient = {
  connect?: () => Promise<void>;
  close?: () => Promise<void>;
  end?: () => Promise<void>;
  query?: (query: string) => Promise<QueryResult>;
  request?: () => {
    query: (query: string) => Promise<QueryResult>;
  };
};

type ClientFactory = new (config: UnknownRecord) => QueryableClient;

const dynamicImport = new Function("specifier", "return import(specifier)") as (specifier: string) => Promise<unknown>;

function now() {
  return new Date().toISOString();
}

function normalizeCellValue(value: unknown): SqlPreviewCellValue {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null) {
    return value;
  }
  if (value instanceof Date) return value.toISOString();
  if (value === undefined) return null;
  return String(value);
}

function normalizeRows(rows: UnknownRecord[]): SqlPreviewRow[] {
  return rows.map((row) =>
    Object.fromEntries(Object.entries(row).map(([key, value]) => [key, normalizeCellValue(value)]))
  );
}

function assertSafeSqlIdentifier(value: string) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
    throw new Error("Identifiant SQL refuse : seuls lettres, chiffres et underscores sont autorises.");
  }
}

function postgresQualifiedName(tableName: string, schema = "public") {
  assertSafeSqlIdentifier(schema);
  assertSafeSqlIdentifier(tableName);
  return `"${schema}"."${tableName}"`;
}

function sqlServerQualifiedName(tableName: string, schema = "dbo") {
  assertSafeSqlIdentifier(schema);
  assertSafeSqlIdentifier(tableName);
  return `[${schema}].[${tableName}]`;
}

function mapSchemaRows(provider: SqlProvider, rows: UnknownRecord[]): SqlTableInfo[] {
  const byTable = new Map<string, SqlTableInfo>();

  for (const row of rows) {
    const schema = String(row.table_schema ?? row.TABLE_SCHEMA ?? "");
    const name = String(row.table_name ?? row.TABLE_NAME ?? "");
    const tableTypeValue = String(row.table_type ?? row.TABLE_TYPE ?? "BASE TABLE");
    const type: SqlTableInfo["type"] = tableTypeValue.toLowerCase().includes("view") ? "view" : "table";
    const key = `${schema}.${name}.${type}`;
    const table = byTable.get(key) ?? { schema, name, type, columns: [] };

    table.columns.push({
      name: String(row.column_name ?? row.COLUMN_NAME ?? ""),
      dataType: String(row.data_type ?? row.DATA_TYPE ?? ""),
      nullable: String(row.is_nullable ?? row.IS_NULLABLE ?? "NO").toUpperCase() === "YES",
      ordinalPosition: Number(row.ordinal_position ?? row.ORDINAL_POSITION ?? table.columns.length + 1)
    });

    byTable.set(key, table);
  }

  return [...byTable.values()].map((table) => ({
    ...table,
    columns: table.columns.sort((first, second) => first.ordinalPosition - second.ordinalPosition)
  }));
}

function splitTables(schema: SqlTableInfo[]) {
  return {
    tables: schema.filter((table) => table.type === "table"),
    views: schema.filter((table) => table.type === "view")
  };
}

async function closeClient(client: QueryableClient) {
  if (client.close) await client.close();
  else if (client.end) await client.end();
}

async function loadPostgresClient(config: SqlConnectionConfig): Promise<QueryableClient> {
  const pgDriver = await dynamicImport("pg");
  const Client = (pgDriver as { Client: ClientFactory }).Client;
  return new Client({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.username,
    password: config.password,
    connectionTimeoutMillis: 5_000
  });
}

async function loadSqlServerClient(config: SqlConnectionConfig): Promise<QueryableClient> {
  const sqlServerDriver = await dynamicImport("mssql");
  const connect = (sqlServerDriver as { connect: (config: UnknownRecord) => Promise<QueryableClient> }).connect;
  return connect({
    server: config.host,
    port: config.port,
    database: config.database,
    user: config.username,
    password: config.password,
    requestTimeout: 5_000,
    connectionTimeout: 5_000,
    options: {
      encrypt: false,
      readOnlyIntent: true,
      trustServerCertificate: true
    }
  });
}

async function createClient(config: SqlConnectionConfig): Promise<QueryableClient> {
  if (config.provider === "postgresql") return loadPostgresClient(config);
  return loadSqlServerClient(config);
}

async function executeQuery(client: QueryableClient, query: string): Promise<UnknownRecord[]> {
  if (client.query) {
    const result = await client.query(query);
    return result.rows ?? [];
  }

  const request = client.request?.();
  if (!request) throw new Error("Driver SQL incompatible avec le connecteur Atlas V1.");
  const result = await request.query(query);
  return result.recordset ?? [];
}

function schemaQuery(provider: SqlProvider) {
  if (provider === "postgresql") {
    return `
      SELECT table_schema, table_name, table_type, column_name, data_type, is_nullable, ordinal_position
      FROM information_schema.columns
      JOIN information_schema.tables USING (table_schema, table_name)
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name, ordinal_position
    `;
  }

  return `
    SELECT c.TABLE_SCHEMA, c.TABLE_NAME, t.TABLE_TYPE, c.COLUMN_NAME, c.DATA_TYPE, c.IS_NULLABLE, c.ORDINAL_POSITION
    FROM INFORMATION_SCHEMA.COLUMNS c
    JOIN INFORMATION_SCHEMA.TABLES t
      ON c.TABLE_SCHEMA = t.TABLE_SCHEMA AND c.TABLE_NAME = t.TABLE_NAME
    ORDER BY c.TABLE_SCHEMA, c.TABLE_NAME, c.ORDINAL_POSITION
  `;
}

function previewQuery(provider: SqlProvider, tableName: string, schema?: string) {
  if (provider === "postgresql") return `SELECT * FROM ${postgresQualifiedName(tableName, schema)} LIMIT ${SQL_PREVIEW_ROW_LIMIT}`;
  return `SELECT TOP (${SQL_PREVIEW_ROW_LIMIT}) * FROM ${sqlServerQualifiedName(tableName, schema)}`;
}

export function createDriverSqlConnector(provider: SqlProvider): SqlConnector {
  return {
    async testConnection(config: SqlConnectionConfig): Promise<SqlConnectionTestResult> {
      const startedAt = performance.now();
      let client: QueryableClient | undefined;

      try {
        client = await createClient(config);
        if (client.connect) await client.connect();
        await closeClient(client);

        return {
          success: true,
          message: "Connexion SQL lecture seule validee.",
          provider,
          latencyMs: Math.round(performance.now() - startedAt)
        };
      } catch (error) {
        if (client) await closeClient(client).catch(() => undefined);
        const message = error instanceof Error ? error.message : "Erreur SQL inconnue.";

        return {
          success: false,
          message: "Connexion SQL impossible.",
          provider,
          latencyMs: Math.round(performance.now() - startedAt),
          error: message
        };
      }
    },

    async readSchema(config: SqlConnectionConfig): Promise<SqlSchemaReadResult> {
      const client = await createClient(config);
      if (client.connect) await client.connect();

      try {
        const rows = await executeQuery(client, schemaQuery(provider));
        const schema = mapSchemaRows(provider, rows);
        return {
          provider,
          ...splitTables(schema),
          readAt: now()
        };
      } finally {
        await closeClient(client);
      }
    },

    async readTablePreview(config: SqlConnectionConfig, tableName: string, schema?: string): Promise<SqlTablePreviewResult> {
      const client = await createClient(config);
      if (client.connect) await client.connect();

      try {
        const schemaResult = await this.readSchema(config);
        const table = [...schemaResult.tables, ...schemaResult.views].find(
          (item) => item.name === tableName && (schema === undefined || item.schema === schema)
        );
        const rows = await executeQuery(client, previewQuery(provider, tableName, schema));

        return {
          provider,
          tableName,
          schema,
          columns: table?.columns ?? [],
          rows: normalizeRows(rows).slice(0, SQL_PREVIEW_ROW_LIMIT),
          rowLimit: SQL_PREVIEW_ROW_LIMIT,
          readAt: now()
        };
      } finally {
        await closeClient(client);
      }
    }
  };
}
