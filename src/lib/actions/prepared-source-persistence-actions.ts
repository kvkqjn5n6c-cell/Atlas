"use server";

import {
  deletePreparedSqlSourceData,
  savePreparedSqlSourceData
} from "@/lib/services/prepared-sql-sources.service";
import type { PreparedSqlSourceBundle } from "@/lib/connectors/sql/sql-prepared-source-types";

export async function savePreparedSqlSourceAction(bundle: PreparedSqlSourceBundle) {
  const result = await savePreparedSqlSourceData(bundle);
  return {
    success: true,
    source: result.source,
    data: result.data
  };
}

export async function deletePreparedSqlSourceAction(id: string) {
  const result = await deletePreparedSqlSourceData(id);
  return {
    success: true,
    source: result.source
  };
}
