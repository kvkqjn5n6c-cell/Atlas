import type { DataMode } from "@/lib/config/data-mode";

export type Organization = {
  id: string;
  name: string;
  sector: string;
  size: "TPE" | "PME";
  owner: string;
  status: "active" | "watch" | "inactive";
  activePeriod: string;
};

export type UserRole = "SUPER_ADMIN" | "CONSULTANT" | "CLIENT_ADMIN" | "CLIENT_USER";

export type UserStatus = "active" | "invited" | "inactive";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationIds: string[];
  activeOrganizationId: string;
  status: UserStatus;
  lastActivity: string;
};

export type PermissionKey =
  | "viewAllOrganizations"
  | "manageUsers"
  | "manageDataSources"
  | "configureKpis"
  | "editTargets"
  | "viewPilotage"
  | "viewReports"
  | "manageActionPlans";

export type KPIStatus = "healthy" | "watch" | "critical";

export type KPITrend = "up" | "down" | "stable";

export type KPIDataQuality = "reliable" | "partial" | "outdated" | "error";

export type PerformanceKPI = {
  id: string;
  organizationId: string;
  name: string;
  category: "revenue" | "margin" | "activity" | "cash" | "quality" | "operations";
  value: number;
  unit: "EUR" | "%" | "COUNT" | "DAYS" | "SCORE";
  target: number;
  deviation: number;
  trend: KPITrend;
  status: KPIStatus;
  dataQuality: KPIDataQuality;
  lastUpdated: string;
  sourceId: string;
  insight: string;
};

export type KpiConfiguration = {
  id: string;
  kpiId: string;
  organizationId: string;
  name: string;
  category: PerformanceKPI["category"];
  sourceId: string;
  formula: string;
  businessDefinition: string;
  usedFields: AtlasField[];
  calculationMethod: string;
  target: number;
  alertThreshold: number;
  criticalThreshold: number;
  frequency: "daily" | "weekly" | "monthly";
  isActive: boolean;
  businessOwner: string;
  expectedImpact: string;
};

export type DataSourceType = "excel" | "csv" | "mysql" | "postgresql" | "sql-server";

export type DataSourceStatus = "connected" | "to-check" | "error" | "inactive";

export type DataSourceUsage =
  | "CA"
  | "marge"
  | "activite"
  | "tresorerie"
  | "interventions"
  | "qualite";

export type DataSource = {
  id: string;
  organizationId: string;
  name: string;
  type: DataSourceType;
  status: DataSourceStatus;
  lastSync: string;
  frequency: "manual" | "daily" | "weekly" | "monthly";
  importedRows: number;
  usage: DataSourceUsage[];
};

export type DataImportStatus = "pending" | "running" | "completed" | "failed" | "partial";

export type DataImportJob = {
  id: string;
  dataSourceId: string;
  organizationId: string;
  status: DataImportStatus;
  startedAt: string;
  finishedAt?: string;
  rowsRead: number;
  validRows: number;
  rejectedRows: number;
  detectedErrors: number;
  kpiCoverage: number;
  durationSeconds: number;
  trigger: "manual" | "auto";
};

export type AtlasField =
  | "Date"
  | "ChiffreAffaires"
  | "Marge"
  | "Region"
  | "StatutMission"
  | "Client"
  | "Tresorerie"
  | "Intervention"
  | "Qualite"
  | "NonMappe";

export type ColumnMapping = {
  id: string;
  dataSourceId: string;
  sourceColumn: string;
  atlasField: AtlasField;
  status: "mapped" | "unmapped";
  confidence: number;
};

export type MappingReview = {
  id: string;
  dataSourceId: string;
  organizationId: string;
  sourceColumn: string;
  detectedType: "date" | "number" | "text" | "status";
  suggestedAtlasField: AtlasField;
  impactedKpiId?: string;
  impactLevel: "high" | "medium" | "low";
  recommendedAction: string;
  potentialKpiImpact: string;
};

export type DataPreviewRow = {
  id: string;
  dataSourceId: string;
  values: Record<string, string | number>;
};

export type NormalizedRecord = {
  id: string;
  organizationId: string;
  dataSourceId: string;
  fields: Partial<Record<AtlasField, string | number>>;
  qualityScore: number;
};

export type ExecutiveVerdict = {
  status: "stable" | "watch" | "critical";
  title: string;
  summary: string;
  decisionFocus: string;
};

export type PerformanceTrendAxis = "activite" | "marge" | "cash" | "qualite";

export type PerformanceTrend = {
  axis: PerformanceTrendAxis;
  label: string;
  trend: "hausse" | "baisse" | "stable";
  value: string;
  insight: string;
  points: number[];
};

export type SevenDayPriority = {
  id: string;
  priority: "haute" | "moyenne" | "basse";
  title: string;
  impact: string;
  owner: string;
  dueDate: string;
};

export type Report = {
  id: string;
  organizationId: string;
  title: string;
  type: "monthly" | "alert" | "summary";
  period: string;
  status: "draft" | "ready" | "sent";
  generatedAt: string;
  globalScore: number;
  criticalKpiCount: number;
  alertCount: number;
  mainInsight: string;
  executiveSummary: string;
  keyRisks: string[];
  criticalKpis: string[];
  unreliableData: string[];
  priorityActions: string[];
  trends: string[];
  directionSummary: string;
  dataReliabilityScore: number;
};

export type ActionPlanItem = {
  id: string;
  organizationId: string;
  title: string;
  alertId?: string;
  kpiId?: string;
  owner: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  status: "todo" | "in-progress" | "done";
  expectedImpact: string;
};

export type Alert = {
  id: string;
  organizationId: string;
  title: string;
  severity: "info" | "warning" | "critical";
  source: string;
  kpiId?: string;
  sourceId?: string;
  actionPlanId?: string;
  status?: "open" | "in-progress" | "resolved";
  message: string;
  recommendedDecision: string;
  probableCause: string;
  businessImpact: string;
  urgency: "immediate" | "this-week" | "monitoring";
  executiveRisk: "cash" | "margin" | "data-quality" | "operations" | "client-dependency";
  linkedKpiIds?: string[];
};

export type ActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  validationErrors?: Record<string, string>;
  mode: DataMode;
  persisted: boolean;
};

export type DataSourceDraft = {
  name: string;
  organizationId: string;
  type: DataSourceType;
  usage: DataSourceUsage[];
  syncFrequency: DataSource["frequency"];
};

export type KPIConfigurationDraft = {
  name: string;
  organizationId: string;
  category: PerformanceKPI["category"];
  sourceId: string;
  primaryField: AtlasField;
  secondaryField?: AtlasField;
  calculationType: "sum" | "average" | "rate" | "count" | "distinct-count" | "ratio" | "period-change";
  targetValue: number;
  warningThreshold: number;
  criticalThreshold: number;
  frequency: KpiConfiguration["frequency"];
  owner: string;
  expectedImpact: string;
  isActive: boolean;
};

export type ColumnMappingDraft = {
  dataSourceId: string;
  sourceColumn: string;
  detectedType: MappingReview["detectedType"];
  atlasField: AtlasField;
  status: ColumnMapping["status"] | "ignored" | "to-review";
};

export type UserInvitationDraft = {
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
};
