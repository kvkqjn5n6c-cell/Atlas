import type {
  AccountingExport,
  AccountingExportRequest,
  AccountingProvider,
  IntegrationContext,
  IntegrationResult
} from "../../contracts";

export class MockAccountingProvider implements AccountingProvider {
  metadata = {
    id: "mock-accounting",
    name: "Mock Accounting",
    kind: "accounting" as const,
    status: "ready" as const
  };

  async healthcheck(): Promise<IntegrationResult<{ reachable: boolean }>> {
    return { ok: true, data: { reachable: true } };
  }

  async exportData(
    context: IntegrationContext,
    request: AccountingExportRequest
  ): Promise<IntegrationResult<AccountingExport>> {
    return {
      ok: true,
      data: {
        filename: `${context.organizationId}-${request.kind}.csv`,
        mimeType: "text/csv",
        content: "date,label,amount_cents\n2026-05-14,Demo export,300000\n"
      }
    };
  }
}
