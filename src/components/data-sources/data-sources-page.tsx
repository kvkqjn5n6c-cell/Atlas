import { Database, Plus } from "lucide-react";
import { TechnicalModeBadge } from "@/components/admin/technical-mode-badge";
import { LocalFileImportPanel } from "@/components/data-import/local-file-import-panel";
import { AddSourceWizard } from "@/components/data-sources/add-source-wizard";
import { DataSourceSummaryCards } from "@/components/data-sources/data-source-summary-cards";
import { DataSourcesTable } from "@/components/data-sources/data-sources-table";
import { ImportJournal } from "@/components/data-sources/import-journal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { canManageDataSources, getActiveUser } from "@/lib/auth/permissions";
import type { DataSourcesData } from "@/lib/services/data-sources.service";
import type { ServiceResult } from "@/types/service-results";

export function DataSourcesPage({ result }: { result: ServiceResult<DataSourcesData> }) {
  const canManage = canManageDataSources(getActiveUser());

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">Sources de données</Badge>
              <TechnicalModeBadge result={result} />
              <Badge>
                <Database className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                Connecteurs clients
              </Badge>
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
              Sources de données
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Préparer la centralisation des données clients qui alimenteront indicateurs,
              alertes, rapports et plans d&apos;action. Aucune connexion réelle n&apos;est activée.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Ajouter une source
            </Button>
            <Badge variant={canManage ? "success" : "warning"}>
              {canManage ? "Gestion autorisée" : "Lecture seule"}
            </Badge>
          </div>
        </div>
      </section>

      <DataSourceSummaryCards sources={result.data.sources} />
      <LocalFileImportPanel />
      <AddSourceWizard />
      <DataSourcesTable sources={result.data.sources} />
      <ImportJournal jobs={result.data.imports} />

      <Card>
        <CardHeader>
          <CardTitle>Prochaine étape : mapping des colonnes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-slate-600">
            La prochaine couche permettra d&apos;associer les colonnes importées aux KPI Atlas :
            chiffre d&apos;affaires, marge, activité, trésorerie, interventions et qualité.
          </p>
          <p className="mt-3 text-sm font-medium text-ink">
            Module Atlas IA non activé : l&apos;analyse intelligente sera traitée plus tard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
