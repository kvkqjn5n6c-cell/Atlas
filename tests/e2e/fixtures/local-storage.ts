import type { Page } from "@playwright/test";

const now = "2026-06-04T08:00:00.000Z";

export async function clearAtlasLocalStorage(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
}

export async function seedCriticalCostKpi(page: Page) {
  await page.addInitScript(({ seededAt }) => {
    if (window.sessionStorage.getItem("atlas:e2e-critical-cost-seeded") === "true") return;

    const kpiId = "e2e-kpi-cost-subcontracting";
    const organizationId = "org-atlas-demo";

    window.localStorage.clear();
    window.localStorage.setItem(
      "atlas:local-kpi-configurations",
      JSON.stringify([
        {
          id: kpiId,
          name: "Somme coût sous-traitance",
          organizationId,
          importId: "e2e-import-costs",
          sourceFileName: "nova-services-maintenance.csv",
          importCreatedAt: seededAt,
          createdAt: seededAt,
          category: "operations",
          calculationType: "sum",
          direction: "lower_is_better",
          primaryField: "Montant",
          sourceColumn: "cout_sous_traitance",
          fieldType: "custom",
          customFieldLabel: "Coût sous-traitance",
          displayFieldLabel: "Coût sous-traitance",
          targetValue: 8000,
          warningThreshold: 10000,
          criticalThreshold: 12000,
          frequency: "monthly",
          owner: "Direction",
          expectedImpact: "Réduire les coûts de sous-traitance critiques.",
          persisted: false
        }
      ])
    );

    window.localStorage.setItem(
      "atlas:local-kpi-results",
      JSON.stringify([
        {
          id: "e2e-kpi-result-cost-subcontracting",
          kpiId,
          importId: "e2e-import-costs",
          name: "Somme coût sous-traitance",
          displayFieldLabel: "Coût sous-traitance",
          calculationType: "sum",
          direction: "lower_is_better",
          value: 12800,
          targetValue: 8000,
          warningThreshold: 10000,
          criticalThreshold: 12000,
          status: "critical",
          trend: "up",
          variation: 18,
          calculatedAt: seededAt,
          sourceFileName: "nova-services-maintenance.csv",
          persisted: false
        }
      ])
    );

    window.localStorage.setItem(
      "atlas:local-kpi-history",
      JSON.stringify([
        {
          id: "e2e-history-cost-current",
          kpiId,
          importId: "e2e-import-costs",
          calculatedAt: seededAt,
          value: 12800,
          status: "critical",
          direction: "lower_is_better",
          targetValue: 8000,
          warningThreshold: 10000,
          criticalThreshold: 12000,
          sourceFileName: "nova-services-maintenance.csv",
          trend: "up",
          variation: 18,
          persisted: false
        },
        {
          id: "e2e-history-cost-previous",
          kpiId,
          importId: "e2e-import-costs",
          calculatedAt: "2026-05-04T08:00:00.000Z",
          value: 10800,
          status: "watch",
          direction: "lower_is_better",
          targetValue: 8000,
          warningThreshold: 10000,
          criticalThreshold: 12000,
          sourceFileName: "nova-services-maintenance.csv",
          trend: "up",
          variation: 0,
          persisted: false
        }
      ])
    );

    window.localStorage.setItem(
      "atlas:local-alert-rules",
      JSON.stringify([
        {
          id: "e2e-alert-rule-cost-threshold",
          organizationId,
          kpiId,
          name: "Coût sous-traitance supérieur à 10 000",
          isActive: true,
          ruleType: "threshold",
          severity: "critical",
          condition: "supérieur à 10000",
          thresholdValue: 10000,
          comparisonOperator: "greater_than",
          message: "Le coût de sous-traitance dépasse le seuil critique de démonstration.",
          recommendedAction: "Analyser les postes de sous-traitance prioritaires.",
          createdAt: seededAt,
          updatedAt: seededAt,
          persisted: false
        }
      ])
    );

    window.sessionStorage.setItem("atlas:e2e-critical-cost-seeded", "true");
  }, { seededAt: now });
}
