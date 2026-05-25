export type IntegrationKind =
  | "pdp"
  | "bank"
  | "accounting"
  | "mail"
  | "external-api";

export type IntegrationProviderStatus = "not-configured" | "ready" | "error";

export type IntegrationProviderMetadata = {
  id: string;
  name: string;
  kind: IntegrationKind;
  status: IntegrationProviderStatus;
};

export type IntegrationContext = {
  organizationId: string;
  requestedByUserId?: string;
  correlationId?: string;
};

export type IntegrationResult<TData> =
  | {
      ok: true;
      data: TData;
    }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
        retryable?: boolean;
      };
    };

export interface IntegrationProvider {
  metadata: IntegrationProviderMetadata;
  healthcheck(context: IntegrationContext): Promise<IntegrationResult<{ reachable: boolean }>>;
}
