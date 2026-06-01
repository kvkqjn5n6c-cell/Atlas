-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'CONSULTANT', 'CLIENT_ADMIN', 'CLIENT_USER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INVITED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'WATCH', 'INACTIVE');

-- CreateEnum
CREATE TYPE "DataSourceType" AS ENUM ('EXCEL', 'CSV', 'MYSQL', 'POSTGRESQL', 'SQL_SERVER');

-- CreateEnum
CREATE TYPE "DataSourceStatus" AS ENUM ('CONNECTED', 'TO_CHECK', 'ERROR', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "MappingStatus" AS ENUM ('MAPPED', 'UNMAPPED', 'TO_REVIEW', 'IGNORED');

-- CreateEnum
CREATE TYPE "CalculationType" AS ENUM ('SUM', 'AVERAGE', 'RATE', 'COUNT', 'DISTINCT_COUNT', 'RATIO', 'PERIOD_CHANGE');

-- CreateEnum
CREATE TYPE "KPIFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "KPIStatus" AS ENUM ('HEALTHY', 'WATCH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "KPITrend" AS ENUM ('UP', 'DOWN', 'STABLE');

-- CreateEnum
CREATE TYPE "KpiDirection" AS ENUM ('HIGHER_IS_BETTER', 'LOWER_IS_BETTER');

-- CreateEnum
CREATE TYPE "DataQuality" AS ENUM ('RELIABLE', 'PARTIAL', 'OUTDATED', 'ERROR');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');

-- CreateEnum
CREATE TYPE "AlertRuleType" AS ENUM ('THRESHOLD', 'TARGET_GAP', 'VARIATION', 'PERSISTENCE');

-- CreateEnum
CREATE TYPE "AlertRuleSeverity" AS ENUM ('WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertComparisonOperator" AS ENUM ('GREATER_THAN', 'LESS_THAN', 'TARGET_GAP_GREATER_THAN', 'TARGET_GAP_LESS_THAN', 'VARIATION_UP_GREATER_THAN', 'VARIATION_DOWN_GREATER_THAN', 'CONSECUTIVE_PERIODS');

-- CreateEnum
CREATE TYPE "ActionPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('MONTHLY', 'ALERT', 'SUMMARY');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'READY', 'SENT');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataSource" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DataSourceType" NOT NULL,
    "status" "DataSourceStatus" NOT NULL DEFAULT 'TO_CHECK',
    "usage" TEXT[],
    "syncFrequency" "KPIFrequency" NOT NULL,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportJob" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "status" "ImportStatus" NOT NULL DEFAULT 'PENDING',
    "rowsRead" INTEGER NOT NULL DEFAULT 0,
    "rowsRejected" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "triggeredBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColumnMapping" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "sourceColumn" TEXT NOT NULL,
    "atlasField" TEXT NOT NULL,
    "detectedType" TEXT NOT NULL,
    "status" "MappingStatus" NOT NULL DEFAULT 'TO_REVIEW',
    "qualityScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ColumnMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KPIConfiguration" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "calculationType" "CalculationType" NOT NULL,
    "primaryField" TEXT NOT NULL,
    "secondaryField" TEXT,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "warningThreshold" DOUBLE PRECISION NOT NULL,
    "criticalThreshold" DOUBLE PRECISION NOT NULL,
    "frequency" "KPIFrequency" NOT NULL,
    "owner" TEXT NOT NULL,
    "expectedImpact" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KPIConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KPIResult" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "kpiConfigurationId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "gap" DOUBLE PRECISION NOT NULL,
    "status" "KPIStatus" NOT NULL,
    "trend" "KPITrend" NOT NULL,
    "dataQuality" "DataQuality" NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KPIResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "kpiResultId" TEXT,
    "dataSourceId" TEXT,
    "severity" "AlertSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "cause" TEXT NOT NULL,
    "recommendedAction" TEXT NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionPlan" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "alertId" TEXT,
    "kpiConfigurationId" TEXT,
    "title" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "priority" "ActionPriority" NOT NULL,
    "status" "ActionStatus" NOT NULL DEFAULT 'TODO',
    "expectedImpact" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "globalScore" INTEGER NOT NULL,
    "criticalKpiCount" INTEGER NOT NULL,
    "alertCount" INTEGER NOT NULL,
    "executiveSummary" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessDictionaryField" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "normalizedLabel" TEXT NOT NULL,
    "detectedType" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "persistedSource" TEXT NOT NULL DEFAULT 'prisma',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessDictionaryField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessDictionarySourceColumn" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "sourceColumn" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessDictionarySourceColumn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessDictionaryLinkedKpi" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "kpiConfigurationId" TEXT,
    "localKpiName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessDictionaryLinkedKpi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalKpiConfiguration" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "businessDictionaryFieldId" TEXT,
    "importId" TEXT,
    "sourceFileName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "calculationType" TEXT NOT NULL,
    "direction" "KpiDirection" NOT NULL DEFAULT 'HIGHER_IS_BETTER',
    "primaryField" TEXT NOT NULL,
    "secondaryField" TEXT,
    "sourceColumn" TEXT,
    "secondarySourceColumn" TEXT,
    "fieldType" TEXT,
    "customFieldLabel" TEXT,
    "displayFieldLabel" TEXT,
    "filterField" TEXT,
    "filterValue" TEXT,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "warningThreshold" DOUBLE PRECISION NOT NULL,
    "criticalThreshold" DOUBLE PRECISION NOT NULL,
    "frequency" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "expectedImpact" TEXT NOT NULL,
    "testResult" JSONB,
    "thresholdChanges" JSONB,
    "persistedSource" TEXT NOT NULL DEFAULT 'prisma',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalKpiConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalKpiResult" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "kpiId" TEXT NOT NULL,
    "importId" TEXT,
    "name" TEXT NOT NULL,
    "displayFieldLabel" TEXT,
    "calculationType" TEXT NOT NULL,
    "direction" "KpiDirection" NOT NULL DEFAULT 'HIGHER_IS_BETTER',
    "value" DOUBLE PRECISION NOT NULL,
    "targetValue" DOUBLE PRECISION,
    "warningThreshold" DOUBLE PRECISION,
    "criticalThreshold" DOUBLE PRECISION,
    "status" TEXT NOT NULL,
    "trend" TEXT,
    "variation" DOUBLE PRECISION,
    "sourceFileName" TEXT NOT NULL,
    "persistedSource" TEXT NOT NULL DEFAULT 'prisma',
    "metadata" JSONB,
    "calculatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalKpiResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalAlertRule" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "localKpiConfigurationId" TEXT,
    "kpiConfigurationId" TEXT,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "ruleType" "AlertRuleType" NOT NULL,
    "severity" "AlertRuleSeverity" NOT NULL,
    "comparisonOperator" "AlertComparisonOperator" NOT NULL,
    "thresholdValue" DOUBLE PRECISION,
    "consecutivePeriods" INTEGER,
    "variationPercent" DOUBLE PRECISION,
    "message" TEXT,
    "recommendedAction" TEXT,
    "persistedSource" TEXT NOT NULL DEFAULT 'prisma',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalAlertRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalKpiHistoryPoint" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "kpiId" TEXT NOT NULL,
    "importId" TEXT,
    "calculatedAt" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "direction" "KpiDirection" NOT NULL DEFAULT 'HIGHER_IS_BETTER',
    "targetValue" DOUBLE PRECISION,
    "warningThreshold" DOUBLE PRECISION,
    "criticalThreshold" DOUBLE PRECISION,
    "sourceFileName" TEXT,
    "trend" TEXT,
    "variation" DOUBLE PRECISION,
    "persistedSource" TEXT NOT NULL DEFAULT 'prisma',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalKpiHistoryPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Organization_status_idx" ON "Organization"("status");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "OrganizationUser_organizationId_role_idx" ON "OrganizationUser"("organizationId", "role");

-- CreateIndex
CREATE INDEX "OrganizationUser_userId_idx" ON "OrganizationUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationUser_userId_organizationId_key" ON "OrganizationUser"("userId", "organizationId");

-- CreateIndex
CREATE INDEX "DataSource_organizationId_status_idx" ON "DataSource"("organizationId", "status");

-- CreateIndex
CREATE INDEX "DataSource_organizationId_type_idx" ON "DataSource"("organizationId", "type");

-- CreateIndex
CREATE INDEX "ImportJob_organizationId_createdAt_idx" ON "ImportJob"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "ImportJob_dataSourceId_createdAt_idx" ON "ImportJob"("dataSourceId", "createdAt");

-- CreateIndex
CREATE INDEX "ColumnMapping_organizationId_status_idx" ON "ColumnMapping"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ColumnMapping_dataSourceId_sourceColumn_key" ON "ColumnMapping"("dataSourceId", "sourceColumn");

-- CreateIndex
CREATE INDEX "KPIConfiguration_organizationId_isActive_idx" ON "KPIConfiguration"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "KPIConfiguration_dataSourceId_idx" ON "KPIConfiguration"("dataSourceId");

-- CreateIndex
CREATE INDEX "KPIResult_organizationId_period_idx" ON "KPIResult"("organizationId", "period");

-- CreateIndex
CREATE INDEX "KPIResult_organizationId_status_idx" ON "KPIResult"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "KPIResult_kpiConfigurationId_period_key" ON "KPIResult"("kpiConfigurationId", "period");

-- CreateIndex
CREATE INDEX "Alert_organizationId_status_idx" ON "Alert"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Alert_organizationId_severity_idx" ON "Alert"("organizationId", "severity");

-- CreateIndex
CREATE INDEX "Alert_kpiResultId_idx" ON "Alert"("kpiResultId");

-- CreateIndex
CREATE INDEX "Alert_dataSourceId_idx" ON "Alert"("dataSourceId");

-- CreateIndex
CREATE INDEX "ActionPlan_organizationId_status_idx" ON "ActionPlan"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ActionPlan_organizationId_dueDate_idx" ON "ActionPlan"("organizationId", "dueDate");

-- CreateIndex
CREATE INDEX "ActionPlan_alertId_idx" ON "ActionPlan"("alertId");

-- CreateIndex
CREATE INDEX "Report_organizationId_period_idx" ON "Report"("organizationId", "period");

-- CreateIndex
CREATE INDEX "Report_organizationId_status_idx" ON "Report"("organizationId", "status");

-- CreateIndex
CREATE INDEX "BusinessDictionaryField_organizationId_idx" ON "BusinessDictionaryField"("organizationId");

-- CreateIndex
CREATE INDEX "BusinessDictionaryField_normalizedLabel_idx" ON "BusinessDictionaryField"("normalizedLabel");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessDictionaryField_organizationId_normalizedLabel_key" ON "BusinessDictionaryField"("organizationId", "normalizedLabel");

-- CreateIndex
CREATE INDEX "BusinessDictionarySourceColumn_sourceColumn_idx" ON "BusinessDictionarySourceColumn"("sourceColumn");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessDictionarySourceColumn_fieldId_sourceColumn_key" ON "BusinessDictionarySourceColumn"("fieldId", "sourceColumn");

-- CreateIndex
CREATE INDEX "BusinessDictionaryLinkedKpi_fieldId_idx" ON "BusinessDictionaryLinkedKpi"("fieldId");

-- CreateIndex
CREATE INDEX "BusinessDictionaryLinkedKpi_kpiConfigurationId_idx" ON "BusinessDictionaryLinkedKpi"("kpiConfigurationId");

-- CreateIndex
CREATE INDEX "LocalKpiConfiguration_organizationId_idx" ON "LocalKpiConfiguration"("organizationId");

-- CreateIndex
CREATE INDEX "LocalKpiConfiguration_organizationId_createdAt_idx" ON "LocalKpiConfiguration"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "LocalKpiConfiguration_businessDictionaryFieldId_idx" ON "LocalKpiConfiguration"("businessDictionaryFieldId");

-- CreateIndex
CREATE INDEX "LocalKpiResult_organizationId_idx" ON "LocalKpiResult"("organizationId");

-- CreateIndex
CREATE INDEX "LocalKpiResult_kpiId_idx" ON "LocalKpiResult"("kpiId");

-- CreateIndex
CREATE INDEX "LocalKpiResult_calculatedAt_idx" ON "LocalKpiResult"("calculatedAt");

-- CreateIndex
CREATE INDEX "LocalAlertRule_organizationId_idx" ON "LocalAlertRule"("organizationId");

-- CreateIndex
CREATE INDEX "LocalAlertRule_localKpiConfigurationId_idx" ON "LocalAlertRule"("localKpiConfigurationId");

-- CreateIndex
CREATE INDEX "LocalAlertRule_kpiConfigurationId_idx" ON "LocalAlertRule"("kpiConfigurationId");

-- CreateIndex
CREATE INDEX "LocalAlertRule_isActive_idx" ON "LocalAlertRule"("isActive");

-- CreateIndex
CREATE INDEX "LocalKpiHistoryPoint_organizationId_idx" ON "LocalKpiHistoryPoint"("organizationId");

-- CreateIndex
CREATE INDEX "LocalKpiHistoryPoint_kpiId_idx" ON "LocalKpiHistoryPoint"("kpiId");

-- CreateIndex
CREATE INDEX "LocalKpiHistoryPoint_calculatedAt_idx" ON "LocalKpiHistoryPoint"("calculatedAt");

-- AddForeignKey
ALTER TABLE "OrganizationUser" ADD CONSTRAINT "OrganizationUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationUser" ADD CONSTRAINT "OrganizationUser_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataSource" ADD CONSTRAINT "DataSource_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportJob" ADD CONSTRAINT "ImportJob_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportJob" ADD CONSTRAINT "ImportJob_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "DataSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColumnMapping" ADD CONSTRAINT "ColumnMapping_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColumnMapping" ADD CONSTRAINT "ColumnMapping_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "DataSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPIConfiguration" ADD CONSTRAINT "KPIConfiguration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPIConfiguration" ADD CONSTRAINT "KPIConfiguration_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "DataSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPIResult" ADD CONSTRAINT "KPIResult_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPIResult" ADD CONSTRAINT "KPIResult_kpiConfigurationId_fkey" FOREIGN KEY ("kpiConfigurationId") REFERENCES "KPIConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_kpiResultId_fkey" FOREIGN KEY ("kpiResultId") REFERENCES "KPIResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionPlan" ADD CONSTRAINT "ActionPlan_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionPlan" ADD CONSTRAINT "ActionPlan_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionPlan" ADD CONSTRAINT "ActionPlan_kpiConfigurationId_fkey" FOREIGN KEY ("kpiConfigurationId") REFERENCES "KPIConfiguration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessDictionaryField" ADD CONSTRAINT "BusinessDictionaryField_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessDictionarySourceColumn" ADD CONSTRAINT "BusinessDictionarySourceColumn_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "BusinessDictionaryField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessDictionaryLinkedKpi" ADD CONSTRAINT "BusinessDictionaryLinkedKpi_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "BusinessDictionaryField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessDictionaryLinkedKpi" ADD CONSTRAINT "BusinessDictionaryLinkedKpi_kpiConfigurationId_fkey" FOREIGN KEY ("kpiConfigurationId") REFERENCES "KPIConfiguration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalKpiConfiguration" ADD CONSTRAINT "LocalKpiConfiguration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalKpiConfiguration" ADD CONSTRAINT "LocalKpiConfiguration_businessDictionaryFieldId_fkey" FOREIGN KEY ("businessDictionaryFieldId") REFERENCES "BusinessDictionaryField"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalKpiResult" ADD CONSTRAINT "LocalKpiResult_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalKpiResult" ADD CONSTRAINT "LocalKpiResult_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "LocalKpiConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalAlertRule" ADD CONSTRAINT "LocalAlertRule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalAlertRule" ADD CONSTRAINT "LocalAlertRule_localKpiConfigurationId_fkey" FOREIGN KEY ("localKpiConfigurationId") REFERENCES "LocalKpiConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalAlertRule" ADD CONSTRAINT "LocalAlertRule_kpiConfigurationId_fkey" FOREIGN KEY ("kpiConfigurationId") REFERENCES "KPIConfiguration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalKpiHistoryPoint" ADD CONSTRAINT "LocalKpiHistoryPoint_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalKpiHistoryPoint" ADD CONSTRAINT "LocalKpiHistoryPoint_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "LocalKpiConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
