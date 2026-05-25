import type { ColumnMapping, DataImportJob, DataPreviewRow } from "@/types/atlas";

export const dataImportJobsMock: DataImportJob[] = [
  {
    id: "job-source-erp-csv-latest",
    dataSourceId: "source-erp-csv",
    organizationId: "org-atlas-demo",
    status: "completed",
    startedAt: "25/05/2026 08:14",
    finishedAt: "25/05/2026 08:15",
    rowsRead: 1248,
    validRows: 1216,
    rejectedRows: 32,
    detectedErrors: 6,
    kpiCoverage: 86,
    durationSeconds: 52,
    trigger: "auto"
  },
  {
    id: "job-source-margin-excel-latest",
    dataSourceId: "source-margin-excel",
    organizationId: "org-atlas-demo",
    status: "partial",
    startedAt: "24/05/2026 18:37",
    finishedAt: "24/05/2026 18:40",
    rowsRead: 312,
    validRows: 286,
    rejectedRows: 26,
    detectedErrors: 9,
    kpiCoverage: 64,
    durationSeconds: 168,
    trigger: "manual"
  },
  {
    id: "job-source-prod-postgres-latest",
    dataSourceId: "source-prod-postgres",
    organizationId: "org-atlas-demo",
    status: "completed",
    startedAt: "25/05/2026 07:48",
    finishedAt: "25/05/2026 07:50",
    rowsRead: 8420,
    validRows: 8398,
    rejectedRows: 22,
    detectedErrors: 3,
    kpiCoverage: 78,
    durationSeconds: 106,
    trigger: "auto"
  },
  {
    id: "job-source-bi-mysql-latest",
    dataSourceId: "source-bi-mysql",
    organizationId: "org-atlas-demo",
    status: "failed",
    startedAt: "25/05/2026 06:30",
    finishedAt: "25/05/2026 06:31",
    rowsRead: 0,
    validRows: 0,
    rejectedRows: 0,
    detectedErrors: 1,
    kpiCoverage: 0,
    durationSeconds: 12,
    trigger: "auto"
  },
  {
    id: "job-source-nova-ops-latest",
    dataSourceId: "source-nova-ops",
    organizationId: "org-manufacture-nova",
    status: "completed",
    startedAt: "25/05/2026 06:42",
    finishedAt: "25/05/2026 06:45",
    rowsRead: 5280,
    validRows: 5224,
    rejectedRows: 56,
    detectedErrors: 4,
    kpiCoverage: 82,
    durationSeconds: 174,
    trigger: "auto"
  },
  {
    id: "job-source-care-quality-latest",
    dataSourceId: "source-care-quality",
    organizationId: "org-care-services",
    status: "partial",
    startedAt: "23/05/2026 12:01",
    finishedAt: "23/05/2026 12:05",
    rowsRead: 740,
    validRows: 682,
    rejectedRows: 58,
    detectedErrors: 7,
    kpiCoverage: 61,
    durationSeconds: 219,
    trigger: "manual"
  }
];

export const columnMappingsMock: ColumnMapping[] = [
  { id: "map-001", dataSourceId: "source-erp-csv", sourceColumn: "date_cmd", atlasField: "Date", status: "mapped", confidence: 98 },
  { id: "map-002", dataSourceId: "source-erp-csv", sourceColumn: "montant_ht", atlasField: "ChiffreAffaires", status: "mapped", confidence: 96 },
  { id: "map-003", dataSourceId: "source-erp-csv", sourceColumn: "marge_pct", atlasField: "Marge", status: "mapped", confidence: 91 },
  { id: "map-004", dataSourceId: "source-erp-csv", sourceColumn: "region", atlasField: "Region", status: "mapped", confidence: 94 },
  { id: "map-005", dataSourceId: "source-erp-csv", sourceColumn: "statut", atlasField: "StatutMission", status: "mapped", confidence: 88 },
  { id: "map-006", dataSourceId: "source-erp-csv", sourceColumn: "commentaire_interne", atlasField: "NonMappe", status: "unmapped", confidence: 0 },
  { id: "map-007", dataSourceId: "source-margin-excel", sourceColumn: "mois", atlasField: "Date", status: "mapped", confidence: 84 },
  { id: "map-008", dataSourceId: "source-margin-excel", sourceColumn: "marge_brute", atlasField: "Marge", status: "mapped", confidence: 89 },
  { id: "map-009", dataSourceId: "source-prod-postgres", sourceColumn: "intervention_date", atlasField: "Date", status: "mapped", confidence: 97 },
  { id: "map-010", dataSourceId: "source-prod-postgres", sourceColumn: "quality_score", atlasField: "Qualite", status: "mapped", confidence: 95 }
];

const erpRows = [
  ["2026-05-02", "Atelier Nova", 4200, 32, "AURA", "Livrée", "Facturation phase 1"],
  ["2026-05-03", "Maison Lumen", 6800, 28, "IDF", "En retard", "Paiement partiel"],
  ["2026-05-05", "Groupe Horizon", 2400, 24, "Ouest", "Bloquée", "Adresse incomplète"],
  ["2026-05-08", "Bistro Celeste", 5200, 35, "Sud-Ouest", "Transmise", "RAS"],
  ["2026-05-10", "Cabinet Oria", 1100, 41, "Nord", "Payée", "Carte"],
  ["2026-05-12", "Helio Conseil", 8400, 29, "Ouest", "Partielle", "Relance prévue"],
  ["2026-05-14", "Mercure Habitat", 3100, 22, "Sud", "En retard", "Appel requis"],
  ["2026-05-16", "Nacre Digital", 4600, 31, "Sud", "Prévue", "Attente validation"],
  ["2026-05-18", "Opale Services", 2900, 34, "Est", "Brouillon", "Contrôle"],
  ["2026-05-20", "Vesper Industrie", 7300, 37, "AURA", "Payée", "Virement reçu"],
  ["2026-05-21", "Atelier Nova", 1900, 30, "AURA", "Validée", "À transmettre"],
  ["2026-05-22", "Maison Lumen", 5600, 26, "IDF", "Annulée", "Dossier clôturé"]
];

export const dataPreviewRowsMock: DataPreviewRow[] = erpRows.map((row, index) => ({
  id: `preview-source-erp-csv-${index + 1}`,
  dataSourceId: "source-erp-csv",
  values: {
    date_cmd: row[0],
    client: row[1],
    montant_ht: row[2],
    marge_pct: row[3],
    region: row[4],
    statut: row[5],
    commentaire_interne: row[6]
  }
}));
