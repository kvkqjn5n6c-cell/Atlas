import { isPrismaMode } from "@/lib/config/data-mode";
import {
  deletePreparedSqlSource,
  getAllPreparedSqlSources,
  getPreparedSqlSourceById,
  upsertPreparedSqlSource,
  wasPreparedSqlSourcesFallbackUsed
} from "@/lib/repositories/prepared-sql-sources.repository";
import type { PreparedSqlSourceBundle } from "@/lib/connectors/sql/sql-prepared-source-types";

function currentSource() {
  if (wasPreparedSqlSourcesFallbackUsed()) return "fallback" as const;
  return isPrismaMode() ? "prisma" as const : "local" as const;
}

export async function getPreparedSqlSourcesData(organizationId?: string) {
  const data = await getAllPreparedSqlSources(organizationId);
  return { data, source: currentSource() };
}

export async function getPreparedSqlSourceByIdData(id: string) {
  const data = await getPreparedSqlSourceById(id);
  return { data, source: currentSource() };
}

export async function savePreparedSqlSourceData(bundle: PreparedSqlSourceBundle) {
  const data = await upsertPreparedSqlSource(bundle);
  return { data, source: currentSource() };
}

export const createPreparedSqlSourceData = savePreparedSqlSourceData;
export const updatePreparedSqlSourceData = savePreparedSqlSourceData;

export async function deletePreparedSqlSourceData(id: string) {
  await deletePreparedSqlSource(id);
  return { success: true, source: currentSource() };
}
