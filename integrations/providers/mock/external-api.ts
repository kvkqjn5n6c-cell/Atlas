import type {
  ExternalApiProvider,
  ExternalApiRequest,
  ExternalApiResponse,
  IntegrationResult
} from "../../contracts";

export class MockExternalApiProvider implements ExternalApiProvider {
  metadata = {
    id: "mock-external-api",
    name: "Mock External API",
    kind: "external-api" as const,
    status: "ready" as const
  };

  async healthcheck(): Promise<IntegrationResult<{ reachable: boolean }>> {
    return { ok: true, data: { reachable: true } };
  }

  async request(
    _context: Parameters<ExternalApiProvider["request"]>[0],
    request: ExternalApiRequest
  ): Promise<IntegrationResult<ExternalApiResponse>> {
    return {
      ok: true,
      data: {
        status: 200,
        body: {
          provider: this.metadata.id,
          endpoint: request.endpoint,
          method: request.method
        }
      }
    };
  }
}
