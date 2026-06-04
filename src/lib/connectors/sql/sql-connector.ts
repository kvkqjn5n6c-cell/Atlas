import type { SqlConnectionConfig, SqlValidationResult } from "@/lib/connectors/sql/sql-types";

const supportedProviders = new Set(["postgresql", "sqlserver"]);

export function validateSqlConnectionConfig(config: SqlConnectionConfig): SqlValidationResult {
  const errors: string[] = [];

  if (!config.name.trim()) errors.push("Le nom de connexion est obligatoire.");
  if (!supportedProviders.has(config.provider)) errors.push("Provider SQL non supporte en V1.");
  if (!config.host.trim()) errors.push("L'hote SQL est obligatoire.");
  if (!Number.isInteger(config.port) || config.port <= 0 || config.port > 65_535) {
    errors.push("Le port SQL doit etre compris entre 1 et 65535.");
  }
  if (!config.database.trim()) errors.push("Le nom de base est obligatoire.");
  if (!config.username.trim()) errors.push("L'utilisateur SQL est obligatoire.");
  if (!config.password) errors.push("Le mot de passe SQL est obligatoire en mode demonstration.");

  return {
    valid: errors.length === 0,
    errors
  };
}

export function buildSqlConnectionId(config: Pick<SqlConnectionConfig, "provider" | "host" | "port" | "database">) {
  return `sql-${config.provider}-${config.host}-${config.port}-${config.database}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function normalizeSqlConnectionConfig(config: SqlConnectionConfig): SqlConnectionConfig {
  const now = new Date().toISOString();

  return {
    ...config,
    id: config.id ?? buildSqlConnectionId(config),
    name: config.name.trim(),
    host: config.host.trim(),
    database: config.database.trim(),
    username: config.username.trim(),
    readonly: true,
    createdAt: config.createdAt ?? now,
    updatedAt: now,
    persisted: false
  };
}
