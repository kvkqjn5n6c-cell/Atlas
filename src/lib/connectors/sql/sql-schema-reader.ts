import { createDriverSqlConnector } from "@/lib/connectors/sql/sql-driver-connector";
import { validateSqlConnectionConfig } from "@/lib/connectors/sql/sql-connector";
import type { SqlConnectionConfig, SqlConnector, SqlSchemaReadResult } from "@/lib/connectors/sql/sql-types";

export async function readSqlSchema(
  config: SqlConnectionConfig,
  connector: SqlConnector = createDriverSqlConnector(config.provider)
): Promise<SqlSchemaReadResult> {
  const validation = validateSqlConnectionConfig(config);
  if (!validation.valid) {
    throw new Error(`Configuration SQL invalide : ${validation.errors.join(" ")}`);
  }

  return connector.readSchema(config);
}
