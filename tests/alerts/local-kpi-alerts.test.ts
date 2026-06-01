import { describe, expect, it } from "vitest";
import { generateLocalKpiAlerts } from "@/lib/kpi-engine/local-kpi-alerts";
import { buildKpiResult } from "../fixtures/local-engine-fixtures";

describe("generateLocalKpiAlerts", () => {
  it("genere une alerte de surveillance pour un KPI watch", () => {
    const alerts = generateLocalKpiAlerts([buildKpiResult({ status: "watch" })]);

    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toMatchObject({ severity: "warning", alertSource: "status" });
  });

  it("genere une alerte critique pour un KPI critical", () => {
    const alerts = generateLocalKpiAlerts([buildKpiResult({ status: "critical" })]);

    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toMatchObject({ severity: "critical", alertSource: "status" });
  });

  it("ne genere pas d'alerte pour un KPI conforme", () => {
    const alerts = generateLocalKpiAlerts([buildKpiResult({ status: "healthy" })]);

    expect(alerts).toHaveLength(0);
  });
});
