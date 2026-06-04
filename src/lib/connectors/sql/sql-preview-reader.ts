import { createDriverSqlConnector } from "@/lib/connectors/sql/sql-driver-connector";
import { validateSqlConnectionConfig } from "@/lib/connectors/sql/sql-connector";
import type { SqlConnectionConfig, SqlConnector, SqlTablePreviewResult } from "@/lib/connectors/sql/sql-types";

export async function readTablePreview(
  config: SqlConnectionConfig,
  tableName: string,
  schema?: string,
  connector: SqlConnector = createDriverSqlConnector(config.provider)
): Promise<SqlTablePreviewResult> {
  const validation = validateSqlConnectionConfig(config);
  if (!validation.valid) {
    throw new Error(`Configuration SQL invalide : ${validation.errors.join(" ")}`);
  }

  if (!tableName.trim()) throw new Error("Le nom de table est obligatoire pour lire un apercu.");

  return connector.readTablePreview(config, tableName, schema);
}
