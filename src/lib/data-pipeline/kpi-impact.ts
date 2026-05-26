import { getEffectiveAtlasField } from "@/lib/data-pipeline/mapping-suggestions";
import type { AtlasField } from "@/types/atlas";
import type { LocalValidatedColumnMapping } from "@/types/data-import";

export type KpiImpactCandidate = {
  id: string;
  name: string;
  requiredFieldsPresent: AtlasField[];
  missingFields: AtlasField[];
  confidence: "élevée" | "moyenne" | "faible";
  businessNote: string;
};

type KpiRule = {
  id: string;
  name: string;
  requiredFields: AtlasField[];
  businessNote: string;
};

const kpiRules: KpiRule[] = [
  {
    id: "monthly-revenue",
    name: "CA mensuel",
    requiredFields: ["Date", "ChiffreAffaires"],
    businessNote: "Permet de suivre l'évolution du chiffre d'affaires par période."
  },
  {
    id: "gross-margin",
    name: "Marge brute",
    requiredFields: ["Date", "Marge"],
    businessNote: "Permet d'identifier les périodes ou missions qui dégradent la marge."
  },
  {
    id: "late-interventions",
    name: "Taux de retard intervention",
    requiredFields: ["Date", "StatutMission"],
    businessNote: "Permet d'isoler les retards opérationnels et leur tendance."
  },
  {
    id: "customer-satisfaction",
    name: "Satisfaction client",
    requiredFields: ["Qualite"],
    businessNote: "Permet de détecter une baisse de qualité perçue."
  },
  {
    id: "cash-flow",
    name: "Flux financier / cash potentiel",
    requiredFields: ["Date", "Tresorerie"],
    businessNote: "Permet de préparer une lecture simple des encaissements ou décaissements."
  },
  {
    id: "regional-performance",
    name: "Performance opérationnelle par région",
    requiredFields: ["Region", "Intervention"],
    businessNote: "Permet de comparer charge et performance selon les zones terrain."
  }
];

function confidenceFromCoverage(presentCount: number, requiredCount: number): KpiImpactCandidate["confidence"] {
  if (presentCount === requiredCount) return "élevée";
  if (presentCount > 0) return "moyenne";
  return "faible";
}

export function getPotentialKpiImpacts(mappings: LocalValidatedColumnMapping[]): KpiImpactCandidate[] {
  const mappedFields = new Set<AtlasField>(
    mappings
      .map(getEffectiveAtlasField)
      .filter((field) => field !== "NonMappe")
  );

  return kpiRules
    .map((rule) => {
      const requiredFieldsPresent = rule.requiredFields.filter((field) => mappedFields.has(field));
      const missingFields = rule.requiredFields.filter((field) => !mappedFields.has(field));

      return {
        id: rule.id,
        name: rule.name,
        requiredFieldsPresent,
        missingFields,
        confidence: confidenceFromCoverage(requiredFieldsPresent.length, rule.requiredFields.length),
        businessNote: rule.businessNote
      };
    })
    .filter((candidate) => candidate.requiredFieldsPresent.length > 0)
    .sort((first, second) => second.requiredFieldsPresent.length - first.requiredFieldsPresent.length);
}
