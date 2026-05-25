import type { ActionPlanItem } from "@/types/atlas";

export const actionPlansMock: ActionPlanItem[] = [
  {
    id: "action-secure-cash",
    organizationId: "org-atlas-demo",
    title: "Sécuriser les deux encaissements critiques",
    alertId: "alert-cash",
    kpiId: "kpi-cash",
    owner: "Direction",
    dueDate: "27/05/2026",
    priority: "high",
    status: "in-progress",
    expectedImpact: "+31 800 EUR de cash confirme"
  },
  {
    id: "action-margin-review",
    organizationId: "org-atlas-demo",
    title: "Revoir la sous-traitance Est sur les missions a faible marge",
    alertId: "alert-margin",
    kpiId: "kpi-margin",
    owner: "Operations",
    dueDate: "31/05/2026",
    priority: "medium",
    status: "todo",
    expectedImpact: "+4 pts de marge cible"
  },
  {
    id: "action-quality-feed",
    organizationId: "org-atlas-demo",
    title: "Reconnecter la source activité régionale",
    alertId: "alert-data-source",
    kpiId: "kpi-quality",
    owner: "Data",
    dueDate: "03/06/2026",
    priority: "medium",
    status: "todo",
    expectedImpact: "Rapport dirigeant fiable par région"
  },
  {
    id: "action-east-load",
    organizationId: "org-atlas-demo",
    title: "Reprioriser le planning region Est",
    alertId: "alert-operations-east",
    kpiId: "kpi-activity",
    owner: "Operations",
    dueDate: "28/05/2026",
    priority: "high",
    status: "todo",
    expectedImpact: "Retards interventions réduits et satisfaction stabilisée"
  }
];
