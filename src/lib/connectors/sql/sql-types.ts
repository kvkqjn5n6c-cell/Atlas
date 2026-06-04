export const SQL_PREVIEW_ROW_LIMIT = 100;

export type SqlProvider = "postgresql" | "sqlserver";

export type SqlConnectionConfig = {
  id?: string;
  name: string;
  provider: SqlProvider;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  readonly?: true;
  createdAt?: string;
  updatedAt?: string;
  persisted: false;
};

export type SqlConnectionTestResult = {
  success: boolean;
  message: string;
  provider: SqlProvider;
  latencyMs: number;
  error?: string;
};

export type SqlColumnInfo = {
  name: string;
  dataType: string;
  nullable: boolean;
  ordinalPosition: number;
};

export type SqlTableInfo = {
  schema?: string;
  name: string;
  type: "table" | "view";
  columns: SqlColumnInfo[];
};

export type SqlSchemaReadResult = {
  provider: SqlProvider;
  tables: SqlTableInfo[];
  views: SqlTableInfo[];
  readAt: string;
};

export type SqlPreviewCellValue = string | number | boolean | null;

export type SqlPreviewRow = Record<string, SqlPreviewCellValue>;

export type SqlTablePreviewResult = {
  provider: SqlProvider;
  tableName: string;
  schema?: string;
  columns: SqlColumnInfo[];
  rows: SqlPreviewRow[];
  rowLimit: number;
  readAt: string;
};

export type SqlConnector = {
  testConnection(config: SqlConnectionConfig): Promise<SqlConnectionTestResult>;
  readSchema(config: SqlConnectionConfig): Promise<SqlSchemaReadResult>;
  readTablePreview(config: SqlConnectionConfig, tableName: string, schema?: string): Promise<SqlTablePreviewResult>;
};

export type SqlValidationResult = {
  valid: boolean;
  errors: string[];
};

export type SqlConnectorMode = "mock" | "driver";
