import { describe, expect, it } from "vitest";
import { demoAtlasScenario, generateDemoAtlasMarkdown } from "@/lib/mock/demo-atlas-scenario";

describe("demo atlas scenario", () => {
  it("charge le scenario Nova Services Maintenance", () => {
    expect(demoAtlasScenario.company.name).toBe("Nova Services Maintenance");
    expect(demoAtlasScenario.company.activity).toContain("Maintenance terrain");
    expect(demoAtlasScenario.promise).toContain("voir");
  });

  it("contient les dix etapes du parcours guide", () => {
    expect(demoAtlasScenario.steps).toHaveLength(10);
    expect(demoAtlasScenario.steps.map((step) => step.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("couvre les moments cles de la demonstration", () => {
    const stepTitles = demoAtlasScenario.steps.map((step) => step.title).join(" ");

    expect(stepTitles).toContain("Situation initiale");
    expect(stepTitles).toContain("Détection Atlas");
    expect(stepTitles).toContain("Priorités Atlas");
    expect(stepTitles).toContain("Recommandations Atlas");
    expect(stepTitles).toContain("Plan d'action proposé");
    expect(stepTitles).toContain("Impact observé");
    expect(stepTitles).toContain("Dashboard dirigeant");
    expect(stepTitles).toContain("Préparation COPIL");
  });

  it("contient les signaux metier attendus", () => {
    expect(demoAtlasScenario.initialMetrics.some((metric) => metric.label === "Marge brute")).toBe(true);
    expect(demoAtlasScenario.initialMetrics.some((metric) => metric.label === "Coût sous-traitance")).toBe(true);
    expect(demoAtlasScenario.initialMetrics.some((metric) => metric.label === "Satisfaction client")).toBe(true);
    expect(demoAtlasScenario.alerts.join(" ")).toContain("sous-traitance");
  });

  it("genere un resume Markdown complet", () => {
    const markdown = generateDemoAtlasMarkdown();

    expect(markdown).toContain("# Démonstration Atlas - Nova Services Maintenance");
    expect(markdown).toContain("## Détection Atlas");
    expect(markdown).toContain("## Priorité principale");
    expect(markdown).toContain("## Recommandation");
    expect(markdown).toContain("## Plan d'action");
    expect(markdown).toContain("## Impact observé");
    expect(markdown).toContain("## Valeur Atlas");
  });

  it("inclut les elements COPIL dans le scenario", () => {
    expect(demoAtlasScenario.copilBrief.arbitrationPoints.length).toBeGreaterThanOrEqual(3);
    expect(demoAtlasScenario.copilBrief.decisionsToTake.length).toBeGreaterThanOrEqual(3);
    expect(demoAtlasScenario.copilBrief.closingSummary).toContain("ordre du jour");
  });
});
