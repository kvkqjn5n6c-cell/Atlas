"use server";

import { getDataMode } from "@/lib/config/data-mode";
import { importLocalBundleToPrisma } from "@/lib/migration/local-to-prisma-importer";
import type { LocalMigrationBundle } from "@/types/local-to-prisma-migration";

export async function getLocalToPrismaMigrationStatusAction() {
  const dataMode = getDataMode();

  return {
    dataMode,
    prismaEnabled: dataMode === "prisma",
    databaseUrlConfigured: Boolean(process.env.DATABASE_URL)
  };
}

export async function importLocalBundleToPrismaAction(bundle: LocalMigrationBundle) {
  const report = await importLocalBundleToPrisma(bundle);

  return {
    success: report.success,
    report
  };
}
