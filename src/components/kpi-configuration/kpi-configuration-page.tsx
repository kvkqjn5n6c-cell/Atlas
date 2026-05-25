import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { canConfigureKPI, getActiveUser } from "@/lib/auth/permissions";
import { KpiCatalogTable } from "./kpi-catalog-table";
import { KpiConfigPanel } from "./kpi-config-panel";
import { KpiTestResult } from "./kpi-test-result";

export function KpiConfigurationPage() {
  const activeUser = getActiveUser();
  const canEdit = canConfigureKPI(activeUser);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <Badge variant="brand">Configuration KPI</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
              Règles de calcul et objectifs
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Configurer les KPI qui pilotent vraiment l&apos;activité, relier chaque indicateur à
              une source fiable, puis tester le calcul avant publication.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Créer un KPI
            </Button>
            <Badge variant={canEdit ? "success" : "warning"}>
              {canEdit ? "Configuration autorisée" : "Lecture seule"}
            </Badge>
          </div>
        </div>
      </section>

      <KpiCatalogTable />
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <KpiConfigPanel />
        <KpiTestResult />
      </section>
    </div>
  );
}
