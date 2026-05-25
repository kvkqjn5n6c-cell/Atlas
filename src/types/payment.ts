export type PaymentStatus = "pending" | "partial" | "paid" | "late" | "cancelled";

export type PaymentRiskLevel = "low" | "medium" | "high" | "critical";

export type PaymentMethod = "bank-transfer" | "card" | "check" | "cash" | "unknown";

export type PaymentNextActionType = "collect" | "confirm" | "reconcile" | "monitor" | "close";

export type PaymentNextAction = {
  type: PaymentNextActionType;
  label: string;
  dueDate: string;
};

export type PaymentRecord = {
  id: string;
  clientName: string;
  invoiceNumber: string;
  dueDate: string;
  expectedAmount: number;
  receivedAmount: number;
  outstandingAmount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  daysLate: number;
  riskLevel: PaymentRiskLevel;
  nextAction?: PaymentNextAction;
};

export type PaymentFiltersState = {
  status: PaymentStatus | "all";
  lateOnly: boolean;
  riskLevel: PaymentRiskLevel | "all";
  search: string;
};

export type PaymentStats = {
  expectedAmount: number;
  receivedAmount: number;
  outstandingAmount: number;
  overdueAmount: number;
  latePayments: number;
  highRiskPayments: number;
};
