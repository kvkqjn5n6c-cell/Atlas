export type InvoiceBusinessStatus =
  | "draft"
  | "validated"
  | "ready-transmission"
  | "transmitted"
  | "accepted"
  | "rejected"
  | "partially-paid"
  | "paid"
  | "cancelled";

export type InvoiceTransmissionStatus =
  | "not-transmitted"
  | "pending"
  | "transmitted"
  | "accepted"
  | "rejected"
  | "error";

export type InvoiceNextActionType = "collect" | "transmit" | "fix" | "validate" | "monitor";

export type InvoiceNextAction = {
  type: InvoiceNextActionType;
  label: string;
  dueDate: string;
};

export type InvoiceRecord = {
  id: string;
  clientName: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  amountIncludingTax: number;
  collectedAmount: number;
  outstandingAmount: number;
  businessStatus: InvoiceBusinessStatus;
  transmissionStatus: InvoiceTransmissionStatus;
  daysLate: number;
  nextAction?: InvoiceNextAction;
};

export type InvoiceFiltersState = {
  businessStatus: InvoiceBusinessStatus | "all";
  transmissionStatus: InvoiceTransmissionStatus | "all";
  lateOnly: boolean;
  search: string;
};

export type InvoiceStats = {
  totalInvoices: number;
  amountIncludingTax: number;
  collectedAmount: number;
  outstandingAmount: number;
  overdueAmount: number;
  lateInvoices: number;
  blockedInvoices: number;
};
