import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  detectAnomalyCandidate,
  detectBestGroup,
  detectConcentration,
  detectDispersion,
  detectWeakGroup,
  generateGroupByInsights,
  rankGroupByInsights
} from "@/lib/datasets/dataset-groupby-insight-engine";
import type { DatasetGroupByAnalysis } from "@/lib/datasets/dataset-groupby-types";
import {
  clearGroupByInsights,
  getGroupByInsights,
  saveGroupByInsights
} from "@/lib/local/dataset-groupby-insights-store";

function analysis(overrides: Partial<DatasetGroupByAnalysis> = {}): DatasetGroupByAnalysis {
  return {
    id: "analysis-cost-region",
    datasetId: "dataset-demo",
    aggregation: "sum",
    field: "cost",
    groupedBy: {
      id: "group-region",
      datasetId: "dataset-demo",
      field: "region",
      label: "Région",
      createdAt: "2026-06-01T10:00:00.000Z"
    },
    results: [
      { groupValue: "Est", rowCount: 8, value: 6200, percentage: 62 },
      { groupValue: "Ouest", rowCount: 3, value: 2500, percentage: 25 },
      { groupValue: "Nord", rowCount: 1, value: 300, percentage: 3 }
    ],
    generatedAt: "2026-06-01T10:00:00.000Z",
    warnings: [],
    persisted: false,
    ...overrides
  };
}

function createLocalStorageMock() {
  const store = new Map<string, string>();

  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    })
  };
}

describe("dataset group by insight engine", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { localStorage: createLocalStorageMock() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("detecte le meilleur groupe", () => {
    const insight = detectBestGroup(analysis());

    expect(insight?.insightType).toBe("best_group");
    expect(insight?.groupValue).toBe("Est");
  });

  it("detecte le groupe faible", () => {
    const insight = detectWeakGroup(analysis());

    expect(insight?.insightType).toBe("weak_group");
    expect(insight?.groupValue).toBe("Nord");
    expect(insight?.gap).toBe(5900);
  });

  it("detecte une concentration superieure a 50%", () => {
    const insight = detectConcentration(analysis());

    expect(insight?.insightType).toBe("concentration");
    expect(insight?.severity).toBe("watch");
    expect(insight?.gap).toBe(69);
  });

  it("detecte une dispersion", () => {
    const insight = detectDispersion(analysis());

    expect(insight?.insightType).toBe("dispersion");
    expect(insight?.severity).toBe("critical");
  });

  it("detecte un candidat anomalie", () => {
    const insight = detectAnomalyCandidate(analysis());

    expect(insight?.insightType).toBe("anomaly_candidate");
    expect(insight?.groupValue).toBe("Est");
  });

  it("classe les insights par criticite et type", () => {
    const insights = generateGroupByInsights(analysis());
    const ranked = rankGroupByInsights(insights);

    expect(ranked[0].severity).toBe("critical");
    expect(ranked.some((insight) => insight.insightType === "concentration")).toBe(true);
  });

  it("ne produit rien pour dataset vide", () => {
    expect(generateGroupByInsights(analysis({ results: [] }))).toHaveLength(0);
  });

  it("sauvegarde les insights localement", () => {
    const insights = generateGroupByInsights(analysis());

    saveGroupByInsights(insights);

    expect(getGroupByInsights()).toHaveLength(insights.length);

    clearGroupByInsights();
    expect(getGroupByInsights()).toHaveLength(0);
  });
});
