import type {
  EInvoicePayload,
  EInvoiceSubmission,
  IntegrationContext,
  IntegrationResult,
  PdpProvider
} from "../../contracts";

export class MockPdpProvider implements PdpProvider {
  metadata = {
    id: "mock-pdp",
    name: "Mock PDP",
    kind: "pdp" as const,
    status: "ready" as const
  };

  async healthcheck(): Promise<IntegrationResult<{ reachable: boolean }>> {
    return { ok: true, data: { reachable: true } };
  }

  async submitInvoice(
    context: IntegrationContext,
    payload: EInvoicePayload
  ): Promise<IntegrationResult<EInvoiceSubmission>> {
    return {
      ok: true,
      data: {
        providerReference: `${this.metadata.id}:${context.organizationId}:${payload.invoiceId}`,
        status: "submitted",
        submittedAt: new Date().toISOString()
      }
    };
  }

  async getInvoiceStatus(
    _context: IntegrationContext,
    providerReference: string
  ): Promise<IntegrationResult<EInvoiceSubmission>> {
    return {
      ok: true,
      data: {
        providerReference,
        status: "accepted",
        submittedAt: new Date().toISOString()
      }
    };
  }
}
