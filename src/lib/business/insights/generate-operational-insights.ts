import type { Alert, PerformanceKPI } from "@/types/atlas";

export type OperationalInsight = {
  id: string;
  title: string;
  whatHappens: string;
  why: string;
  impact: string;
  recommendedAction: string;
  severity: "stable" | "watch" | "critical";
};

export function generateOperationalInsights(kpis: PerformanceKPI[], alerts: Alert[]): OperationalInsight[] {
  const margin = kpis.find((kpi) => kpi.category === "margin");
  const activity = kpis.find((kpi) => kpi.category === "activity");
  const cash = kpis.find((kpi) => kpi.category === "cash");
  const dataAlerts = alerts.filter((alert) => alert.executiveRisk === "data-quality");

  return [
    {
      id: "operations-margin-pressure",
      title: "La marge baisse plus vite que l'activité",
      whatHappens: `${activity?.name ?? "Activité"} reste orientée positivement, mais ${margin?.name ?? "marge"} reste sous objectif.`,
      why: "La sous-traitance augmente sur les interventions Est et les missions urgentes consomment plus de capacité.",
      impact: "Chaque point de marge perdu réduit la capacité à absorber les retards d'encaissement.",
      recommendedAction: "Revoir les missions sous marge cible avant d'accepter de nouvelles interventions non planifiées.",
      severity: margin?.status === "critical" ? "critical" : "watch"
    },
    {
      id: "operations-cash-risk",
      title: "Le risque cash est concentré sur peu d'encaissements",
      whatHappens: `${cash?.name ?? "Cash à 30 jours"} est sous seuil et dépend de deux clients prioritaires.`,
      why: "Les paiements attendus Maison Lumen et Helio Conseil portent une part importante du cash court terme.",
      impact: "Un glissement de paiement peut créer une tension sous 21 jours.",
      recommendedAction: "Sécuriser les promesses de paiement avant d'engager les dépenses variables de fin de mois.",
      severity: cash?.status === "critical" ? "critical" : "watch"
    },
    {
      id: "operations-data-quality",
      title: "La lecture trésorerie reste partielle",
      whatHappens: `${dataAlerts.length} source de données critique ou partielle limite la fiabilité du pilotage.`,
      why: "L'import ventes régionales est en erreur et le fichier marge reste à vérifier.",
      impact: "Le dirigeant peut confondre un problème de performance avec un problème de donnée.",
      recommendedAction: "Corriger les mappings et relancer un import test avant le prochain rapport dirigeant.",
      severity: dataAlerts.length > 0 ? "watch" : "stable"
    }
  ];
}
