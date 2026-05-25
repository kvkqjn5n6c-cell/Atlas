export type ClientStatus = "prospect" | "active" | "inactive" | "at-risk";

export type ClientRiskLevel = "low" | "medium" | "high" | "critical";

export type ClientNextActionType = "call" | "email" | "invoice" | "quote" | "meeting";

export type ClientNextAction = {
  type: ClientNextActionType;
  label: string;
  dueDate: string;
};

export type ClientActivity = {
  label: string;
  date: string;
};

export type ClientRecord = {
  id: string;
  name: string;
  contactName: string;
  city: string;
  status: ClientStatus;
  invoicedRevenue: number;
  collectedRevenue: number;
  outstandingRevenue: number;
  quoteCount: number;
  invoiceCount: number;
  lastActivity: ClientActivity;
  nextAction?: ClientNextAction;
  riskLevel: ClientRiskLevel;
};

export type ClientFiltersState = {
  status: ClientStatus | "all";
  riskLevel: ClientRiskLevel | "all";
  search: string;
};

export type ClientStats = {
  activeClients: number;
  atRiskClients: number;
  invoicedRevenue: number;
  collectedRevenue: number;
  outstandingRevenue: number;
};
