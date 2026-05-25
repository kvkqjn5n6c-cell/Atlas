import type { IntegrationContext, IntegrationProvider, IntegrationResult } from "./common";

export type AccountingExportKind = "clients" | "invoices" | "payments";

export type AccountingExportRequest = {
  kind: AccountingExportKind;
  from: Date;
  to: Date;
};

export type AccountingExport = {
  filename: string;
  mimeType: "text/csv" | "application/json";
  content: string;
};

export interface AccountingProvider extends IntegrationProvider {
  exportData(
    context: IntegrationContext,
    request: AccountingExportRequest
  ): Promise<IntegrationResult<AccountingExport>>;
}
