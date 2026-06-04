import { createDriverSqlConnector } from "@/lib/connectors/sql/sql-driver-connector";
import { validateSqlConnectionConfig } from "@/lib/connectors/sql/sql-connector";
import type { SqlConnectionConfig, SqlConnectionTestResult, SqlConnector } from "@/lib/connectors/sql/sql-types";

export async function testSqlConnection(
  config: SqlConnectionConfig,
  connector: SqlConnector = createDriverSqlConnector(config.provider)
): Promise<SqlConnectionTestResult> {
  const validation = validateSqlConnectionConfig(config);

  if (!validation.valid) {
    return {
      success: false,
      message: "Configuration SQL incomplete.",
      provider: config.provider,
      latencyMs: 0,
      error: validation.errors.join(" ")
    };
  }

  return connector.testConnection(config);
}
