import type { IntegrationContext, IntegrationProvider, IntegrationResult } from "./common";

export type EInvoiceDirection = "inbound" | "outbound";

export type EInvoiceStatus =
  | "draft"
  | "submitted"
  | "accepted"
  | "rejected"
  | "cancelled";

export type EInvoicePayload = {
  organizationId: string;
  invoiceId: string;
  invoiceNumber: string;
  direction: EInvoiceDirection;
  issueDate: string;
  totalCents: number;
  currency: "EUR";
};

export type EInvoiceSubmission = {
  providerReference: string;
  status: EInvoiceStatus;
  submittedAt: string;
};

export interface PdpProvider extends IntegrationProvider {
  submitInvoice(
    context: IntegrationContext,
    payload: EInvoicePayload
  ): Promise<IntegrationResult<EInvoiceSubmission>>;

  getInvoiceStatus(
    context: IntegrationContext,
    providerReference: string
  ): Promise<IntegrationResult<EInvoiceSubmission>>;
}
