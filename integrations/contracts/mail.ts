import type { IntegrationContext, IntegrationProvider, IntegrationResult } from "./common";

export type MailAttachment = {
  filename: string;
  mimeType: string;
  contentBase64: string;
};

export type MailMessage = {
  to: string[];
  cc?: string[];
  subject: string;
  text: string;
  html?: string;
  attachments?: MailAttachment[];
};

export type MailDelivery = {
  providerMessageId: string;
  sentAt: string;
};

export interface MailProvider extends IntegrationProvider {
  sendMail(
    context: IntegrationContext,
    message: MailMessage
  ): Promise<IntegrationResult<MailDelivery>>;
}
