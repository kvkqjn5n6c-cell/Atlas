import type { DataSource } from "@/types/atlas";

export const dataSourcesMock: DataSource[] = [
  {
    id: "source-erp-csv",
    organizationId: "org-atlas-demo",
    name: "Export ERP interventions et facturation",
    type: "csv",
    status: "connected",
    lastSync: "25/05/2026 08:15",
    frequency: "daily",
    importedRows: 1248,
    usage: ["CA", "tresorerie"]
  },
  {
    id: "source-margin-excel",
    organizationId: "org-atlas-demo",
    name: "Tableau marge et sous-traitance",
    type: "excel",
    status: "to-check",
    lastSync: "24/05/2026 18:40",
    frequency: "weekly",
    importedRows: 312,
    usage: ["marge", "activite"]
  },
  {
    id: "source-prod-postgres",
    organizationId: "org-atlas-demo",
    name: "Base planning interventions terrain",
    type: "postgresql",
    status: "connected",
    lastSync: "25/05/2026 07:50",
    frequency: "daily",
    importedRows: 8420,
    usage: ["interventions", "qualite", "activite"]
  },
  {
    id: "source-bi-mysql",
    organizationId: "org-atlas-demo",
    name: "Historique activite regionale",
    type: "mysql",
    status: "error",
    lastSync: "22/05/2026 06:30",
    frequency: "daily",
    importedRows: 0,
    usage: ["CA", "marge"]
  },
  {
    id: "source-quality-sqlserver",
    organizationId: "org-atlas-demo",
    name: "Enquetes satisfaction intervention",
    type: "sql-server",
    status: "inactive",
    lastSync: "Non synchronisee",
    frequency: "manual",
    importedRows: 0,
    usage: ["qualite"]
  },
  {
    id: "source-nova-ops",
    organizationId: "org-manufacture-nova",
    name: "Flux production atelier",
    type: "postgresql",
    status: "connected",
    lastSync: "25/05/2026 06:45",
    frequency: "daily",
    importedRows: 5280,
    usage: ["activite", "qualite"]
  },
  {
    id: "source-care-quality",
    organizationId: "org-care-services",
    name: "Retours interventions terrain",
    type: "excel",
    status: "to-check",
    lastSync: "23/05/2026 12:05",
    frequency: "weekly",
    importedRows: 740,
    usage: ["interventions", "qualite"]
  }
];
