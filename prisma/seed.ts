import {
  ActionPriority,
  ActionStatus,
  AlertSeverity,
  AlertStatus,
  CalculationType,
  DataQuality,
  DataSourceStatus,
  DataSourceType,
  ImportStatus,
  KPIStatus,
  KPITrend,
  KPIFrequency,
  MappingStatus,
  OrganizationStatus,
  PrismaClient,
  ReportStatus,
  ReportType,
  UserRole,
  UserStatus
} from "@prisma/client";

const prisma = new PrismaClient();

async function resetAtlasDemoData() {
  await prisma.report.deleteMany();
  await prisma.actionPlan.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.kPIResult.deleteMany();
  await prisma.kPIConfiguration.deleteMany();
  await prisma.columnMapping.deleteMany();
  await prisma.importJob.deleteMany();
  await prisma.dataSource.deleteMany();
  await prisma.organizationUser.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await resetAtlasDemoData();

  const organizations = await Promise.all([
    prisma.organization.create({
      data: {
        id: "org-atlas-demo",
        name: "Atlas Demo PME",
        sector: "Services B2B",
        size: "PME",
        status: OrganizationStatus.ACTIVE
      }
    }),
    prisma.organization.create({
      data: {
        id: "org-manufacture-nova",
        name: "Manufacture Nova",
        sector: "Industrie legere",
        size: "PME",
        status: OrganizationStatus.WATCH
      }
    }),
    prisma.organization.create({
      data: {
        id: "org-care-services",
        name: "Care Services",
        sector: "Services terrain",
        size: "TPE",
        status: OrganizationStatus.ACTIVE
      }
    })
  ]);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: "user-camille",
        name: "Camille Bernard",
        email: "camille@atlas.local",
        role: UserRole.SUPER_ADMIN,
        status: UserStatus.ACTIVE
      }
    }),
    prisma.user.create({
      data: {
        id: "user-remi",
        name: "Remi Laurent",
        email: "remi@atlas.local",
        role: UserRole.CONSULTANT,
        status: UserStatus.ACTIVE
      }
    }),
    prisma.user.create({
      data: {
        id: "user-nadia",
        name: "Nadia Moreau",
        email: "nadia@demo-pme.fr",
        role: UserRole.CLIENT_ADMIN,
        status: UserStatus.ACTIVE
      }
    }),
    prisma.user.create({
      data: {
        id: "user-claire",
        name: "Claire Vidal",
        email: "claire@demo-pme.fr",
        role: UserRole.CLIENT_USER,
        status: UserStatus.INVITED
      }
    })
  ]);

  await prisma.organizationUser.createMany({
    data: [
      {
        id: "org-user-camille-demo",
        userId: users[0].id,
        organizationId: organizations[0].id,
        role: UserRole.SUPER_ADMIN,
        status: UserStatus.ACTIVE
      },
      {
        id: "org-user-camille-nova",
        userId: users[0].id,
        organizationId: organizations[1].id,
        role: UserRole.SUPER_ADMIN,
        status: UserStatus.ACTIVE
      },
      {
        id: "org-user-remi-demo",
        userId: users[1].id,
        organizationId: organizations[0].id,
        role: UserRole.CONSULTANT,
        status: UserStatus.ACTIVE
      },
      {
        id: "org-user-nadia-demo",
        userId: users[2].id,
        organizationId: organizations[0].id,
        role: UserRole.CLIENT_ADMIN,
        status: UserStatus.ACTIVE
      },
      {
        id: "org-user-claire-demo",
        userId: users[3].id,
        organizationId: organizations[0].id,
        role: UserRole.CLIENT_USER,
        status: UserStatus.INVITED
      }
    ]
  });

  const dataSources = await Promise.all([
    prisma.dataSource.create({
      data: {
        id: "source-sales-csv",
        organizationId: organizations[0].id,
        name: "CSV ventes mensuelles",
        type: DataSourceType.CSV,
        status: DataSourceStatus.CONNECTED,
        usage: ["CA", "marge", "activite"],
        syncFrequency: KPIFrequency.DAILY,
        lastSyncAt: new Date("2026-05-25T08:15:00.000Z")
      }
    }),
    prisma.dataSource.create({
      data: {
        id: "source-cash-excel",
        organizationId: organizations[0].id,
        name: "Excel tresorerie",
        type: DataSourceType.EXCEL,
        status: DataSourceStatus.TO_CHECK,
        usage: ["tresorerie"],
        syncFrequency: KPIFrequency.WEEKLY,
        lastSyncAt: new Date("2026-05-24T18:40:00.000Z")
      }
    }),
    prisma.dataSource.create({
      data: {
        id: "source-erp-mysql",
        organizationId: organizations[0].id,
        name: "MySQL ERP simule",
        type: DataSourceType.MYSQL,
        status: DataSourceStatus.ERROR,
        usage: ["CA", "marge"],
        syncFrequency: KPIFrequency.DAILY,
        lastSyncAt: new Date("2026-05-22T06:30:00.000Z")
      }
    }),
    prisma.dataSource.create({
      data: {
        id: "source-interventions-postgres",
        organizationId: organizations[1].id,
        name: "PostgreSQL interventions simulees",
        type: DataSourceType.POSTGRESQL,
        status: DataSourceStatus.CONNECTED,
        usage: ["interventions", "qualite", "activite"],
        syncFrequency: KPIFrequency.DAILY,
        lastSyncAt: new Date("2026-05-25T07:50:00.000Z")
      }
    })
  ]);

  await prisma.importJob.createMany({
    data: [
      {
        id: "import-sales-success",
        organizationId: organizations[0].id,
        dataSourceId: dataSources[0].id,
        status: ImportStatus.COMPLETED,
        rowsRead: 1248,
        rowsRejected: 32,
        errorCount: 6,
        durationMs: 52000,
        triggeredBy: "auto"
      },
      {
        id: "import-cash-partial",
        organizationId: organizations[0].id,
        dataSourceId: dataSources[1].id,
        status: ImportStatus.PARTIAL,
        rowsRead: 312,
        rowsRejected: 26,
        errorCount: 9,
        durationMs: 168000,
        triggeredBy: "manual"
      },
      {
        id: "import-erp-error",
        organizationId: organizations[0].id,
        dataSourceId: dataSources[2].id,
        status: ImportStatus.FAILED,
        rowsRead: 0,
        rowsRejected: 0,
        errorCount: 1,
        durationMs: 12000,
        triggeredBy: "auto"
      },
      {
        id: "import-interventions-success",
        organizationId: organizations[1].id,
        dataSourceId: dataSources[3].id,
        status: ImportStatus.COMPLETED,
        rowsRead: 8420,
        rowsRejected: 22,
        errorCount: 3,
        durationMs: 106000,
        triggeredBy: "auto"
      }
    ]
  });

  await prisma.columnMapping.createMany({
    data: [
      {
        id: "mapping-date-cmd",
        organizationId: organizations[0].id,
        dataSourceId: dataSources[0].id,
        sourceColumn: "date_cmd",
        atlasField: "Date",
        detectedType: "date",
        status: MappingStatus.MAPPED,
        qualityScore: 98
      },
      {
        id: "mapping-montant-ht",
        organizationId: organizations[0].id,
        dataSourceId: dataSources[0].id,
        sourceColumn: "montant_ht",
        atlasField: "ChiffreAffaires",
        detectedType: "number",
        status: MappingStatus.MAPPED,
        qualityScore: 96
      },
      {
        id: "mapping-region-vente",
        organizationId: organizations[0].id,
        dataSourceId: dataSources[2].id,
        sourceColumn: "region_vente",
        atlasField: "Region",
        detectedType: "text",
        status: MappingStatus.TO_REVIEW,
        qualityScore: 62
      },
      {
        id: "mapping-commentaire-interne",
        organizationId: organizations[0].id,
        dataSourceId: dataSources[0].id,
        sourceColumn: "commentaire_interne",
        atlasField: "NonMappe",
        detectedType: "text",
        status: MappingStatus.UNMAPPED,
        qualityScore: 0
      }
    ]
  });

  const kpis = await Promise.all([
    prisma.kPIConfiguration.create({
      data: {
        id: "kpi-config-revenue",
        organizationId: organizations[0].id,
        name: "CA mensuel",
        category: "revenue",
        dataSourceId: dataSources[0].id,
        calculationType: CalculationType.SUM,
        primaryField: "ChiffreAffaires",
        targetValue: 65000,
        warningThreshold: 58000,
        criticalThreshold: 50000,
        frequency: KPIFrequency.DAILY,
        owner: "Direction",
        expectedImpact: "Identifier rapidement l'ecart de croissance."
      }
    }),
    prisma.kPIConfiguration.create({
      data: {
        id: "kpi-config-margin",
        organizationId: organizations[0].id,
        name: "Marge brute",
        category: "margin",
        dataSourceId: dataSources[0].id,
        calculationType: CalculationType.AVERAGE,
        primaryField: "Marge",
        targetValue: 35,
        warningThreshold: 32,
        criticalThreshold: 28,
        frequency: KPIFrequency.WEEKLY,
        owner: "Operations",
        expectedImpact: "Prioriser les missions sous marge cible."
      }
    }),
    prisma.kPIConfiguration.create({
      data: {
        id: "kpi-config-cash",
        organizationId: organizations[0].id,
        name: "Cash J+30",
        category: "cash",
        dataSourceId: dataSources[1].id,
        calculationType: CalculationType.PERIOD_CHANGE,
        primaryField: "Tresorerie",
        secondaryField: "Date",
        targetValue: 30000,
        warningThreshold: 26000,
        criticalThreshold: 22000,
        frequency: KPIFrequency.DAILY,
        owner: "Direction",
        expectedImpact: "Anticiper une tension de tresorerie."
      }
    }),
    prisma.kPIConfiguration.create({
      data: {
        id: "kpi-config-delay-rate",
        organizationId: organizations[1].id,
        name: "Taux de retard intervention",
        category: "operations",
        dataSourceId: dataSources[3].id,
        calculationType: CalculationType.RATE,
        primaryField: "StatutMission",
        secondaryField: "Date",
        targetValue: 8,
        warningThreshold: 12,
        criticalThreshold: 18,
        frequency: KPIFrequency.DAILY,
        owner: "Responsable operations",
        expectedImpact: "Reduire les derives operationnelles."
      }
    }),
    prisma.kPIConfiguration.create({
      data: {
        id: "kpi-config-satisfaction",
        organizationId: organizations[1].id,
        name: "Satisfaction client",
        category: "quality",
        dataSourceId: dataSources[3].id,
        calculationType: CalculationType.AVERAGE,
        primaryField: "Qualite",
        targetValue: 92,
        warningThreshold: 88,
        criticalThreshold: 82,
        frequency: KPIFrequency.WEEKLY,
        owner: "Qualite",
        expectedImpact: "Maintenir le niveau de service client."
      }
    })
  ]);

  const results = await Promise.all([
    prisma.kPIResult.create({
      data: {
        id: "kpi-result-revenue-may",
        organizationId: organizations[0].id,
        kpiConfigurationId: kpis[0].id,
        period: "Mai 2026",
        value: 53100,
        targetValue: 65000,
        gap: -18,
        status: KPIStatus.WATCH,
        trend: KPITrend.UP,
        dataQuality: DataQuality.PARTIAL,
        calculatedAt: new Date("2026-05-25T08:20:00.000Z")
      }
    }),
    prisma.kPIResult.create({
      data: {
        id: "kpi-result-margin-may",
        organizationId: organizations[0].id,
        kpiConfigurationId: kpis[1].id,
        period: "Mai 2026",
        value: 32,
        targetValue: 35,
        gap: -3,
        status: KPIStatus.WATCH,
        trend: KPITrend.STABLE,
        dataQuality: DataQuality.PARTIAL,
        calculatedAt: new Date("2026-05-25T08:22:00.000Z")
      }
    }),
    prisma.kPIResult.create({
      data: {
        id: "kpi-result-cash-may",
        organizationId: organizations[0].id,
        kpiConfigurationId: kpis[2].id,
        period: "Mai 2026",
        value: 24600,
        targetValue: 30000,
        gap: -18,
        status: KPIStatus.CRITICAL,
        trend: KPITrend.DOWN,
        dataQuality: DataQuality.RELIABLE,
        calculatedAt: new Date("2026-05-25T08:25:00.000Z")
      }
    }),
    prisma.kPIResult.create({
      data: {
        id: "kpi-result-delay-may",
        organizationId: organizations[1].id,
        kpiConfigurationId: kpis[3].id,
        period: "Mai 2026",
        value: 14,
        targetValue: 8,
        gap: 6,
        status: KPIStatus.WATCH,
        trend: KPITrend.STABLE,
        dataQuality: DataQuality.RELIABLE,
        calculatedAt: new Date("2026-05-25T07:55:00.000Z")
      }
    }),
    prisma.kPIResult.create({
      data: {
        id: "kpi-result-satisfaction-may",
        organizationId: organizations[1].id,
        kpiConfigurationId: kpis[4].id,
        period: "Mai 2026",
        value: 91,
        targetValue: 92,
        gap: -1,
        status: KPIStatus.HEALTHY,
        trend: KPITrend.UP,
        dataQuality: DataQuality.PARTIAL,
        calculatedAt: new Date("2026-05-25T07:57:00.000Z")
      }
    })
  ]);

  const alerts = await Promise.all([
    prisma.alert.create({
      data: {
        id: "alert-cash-prisma",
        organizationId: organizations[0].id,
        kpiResultId: results[2].id,
        severity: AlertSeverity.CRITICAL,
        title: "Cash J+30 sous seuil critique",
        cause: "Deux encaissements prioritaires glissent sur la periode.",
        recommendedAction: "Securiser les relances clients avant nouvelles depenses.",
        status: AlertStatus.OPEN
      }
    }),
    prisma.alert.create({
      data: {
        id: "alert-erp-source-prisma",
        organizationId: organizations[0].id,
        dataSourceId: dataSources[2].id,
        severity: AlertSeverity.WARNING,
        title: "Source ERP simulee en erreur",
        cause: "La synchronisation MySQL echoue depuis le 22/05/2026.",
        recommendedAction: "Verifier la connexion avant publication du rapport mensuel.",
        status: AlertStatus.OPEN
      }
    })
  ]);

  await prisma.actionPlan.createMany({
    data: [
      {
        id: "action-secure-cash-prisma",
        organizationId: organizations[0].id,
        alertId: alerts[0].id,
        kpiConfigurationId: kpis[2].id,
        title: "Securiser les encaissements critiques",
        owner: "Direction",
        dueDate: new Date("2026-05-27T00:00:00.000Z"),
        priority: ActionPriority.HIGH,
        status: ActionStatus.IN_PROGRESS,
        expectedImpact: "+11 000 EUR de cash confirme"
      },
      {
        id: "action-fix-erp-prisma",
        organizationId: organizations[0].id,
        alertId: alerts[1].id,
        kpiConfigurationId: kpis[0].id,
        title: "Corriger la source ERP simulee",
        owner: "Data",
        dueDate: new Date("2026-05-28T00:00:00.000Z"),
        priority: ActionPriority.MEDIUM,
        status: ActionStatus.TODO,
        expectedImpact: "Rapport CA par zone fiabilise"
      }
    ]
  });

  await prisma.report.createMany({
    data: [
      {
        id: "report-monthly-prisma",
        organizationId: organizations[0].id,
        period: "Mai 2026",
        type: ReportType.MONTHLY,
        status: ReportStatus.READY,
        globalScore: 62,
        criticalKpiCount: 1,
        alertCount: 2,
        executiveSummary: "Croissance commerciale positive, vigilance sur cash et fiabilite source ERP.",
        generatedAt: new Date("2026-05-25T09:00:00.000Z")
      },
      {
        id: "report-alert-prisma",
        organizationId: organizations[0].id,
        period: "J+30",
        type: ReportType.ALERT,
        status: ReportStatus.DRAFT,
        globalScore: 58,
        criticalKpiCount: 1,
        alertCount: 1,
        executiveSummary: "Deux encaissements concentrent le risque court terme.",
        generatedAt: new Date("2026-05-25T08:30:00.000Z")
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
