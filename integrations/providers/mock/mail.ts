import type {
  IntegrationContext,
  IntegrationResult,
  MailDelivery,
  MailMessage,
  MailProvider
} from "../../contracts";

export class MockMailProvider implements MailProvider {
  metadata = {
    id: "mock-mail",
    name: "Mock Mail",
    kind: "mail" as const,
    status: "ready" as const
  };

  async healthcheck(): Promise<IntegrationResult<{ reachable: boolean }>> {
    return { ok: true, data: { reachable: true } };
  }

  async sendMail(
    context: IntegrationContext,
    message: MailMessage
  ): Promise<IntegrationResult<MailDelivery>> {
    return {
      ok: true,
      data: {
        providerMessageId: `${this.metadata.id}:${context.organizationId}:${message.to.join(",")}`,
        sentAt: new Date().toISOString()
      }
    };
  }
}
