import type { IntegrationContext, IntegrationProvider, IntegrationResult } from "./common";

export type ExternalApiRequest = {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
};

export type ExternalApiResponse = {
  status: number;
  body: unknown;
};

export interface ExternalApiProvider extends IntegrationProvider {
  request(
    context: IntegrationContext,
    request: ExternalApiRequest
  ): Promise<IntegrationResult<ExternalApiResponse>>;
}
