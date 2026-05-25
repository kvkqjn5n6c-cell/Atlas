export type UserRole = "OWNER" | "ADMIN" | "MEMBER";

export type QuoteStatus = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED";

export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export type PaymentMethod = "BANK_TRANSFER" | "CARD" | "CHECK" | "CASH" | "OTHER";

export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "FAILED" | "REFUNDED";

export type TransmissionStatus =
  | "NOT_REQUIRED"
  | "PENDING"
  | "TRANSMITTED"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export type CashflowType = "INFLOW" | "OUTFLOW";

export type MoneyAmount = {
  cents: number;
  currency: "EUR";
};

export type DashboardKpi = {
  label: string;
  value: string;
  helper: string;
  trend: "up" | "down" | "stable";
};

export type CashflowPoint = {
  month: string;
  encaissements: number;
  decaissements: number;
  solde: number;
};

export type DashboardReminder = {
  id: string;
  title: string;
  dueDate: string;
  priority: TaskPriority;
  clientName?: string;
};
