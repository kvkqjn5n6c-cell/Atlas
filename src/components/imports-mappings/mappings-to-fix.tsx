import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dataSourcesMock } from "@/lib/mock/data-sources";
import { mappingReviewsMock } from "@/lib/mock/mapping-reviews";
import { performanceKpisMock } from "@/lib/mock/kpis";
import { organizationsMock } from "@/lib/mock/organizations";

export function MappingsToFix() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mappings a corriger</CardTitle>
        <p className="text-sm text-slate-500">
          Corriger les mappings avant que les rapports soient fausses.
        </p>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-3">
        {mappingReviewsMock.map((review) => {
          const source = dataSourcesMock.find((item) => item.id === review.dataSourceId);
          const organization = organizationsMock.find((item) => item.id === review.organizationId);
          const kpi = performanceKpisMock.find((item) => item.id === review.impactedKpiId);

          return (
            <article key={review.id} className="rounded-md border border-line bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <Badge variant={review.impactLevel === "high" ? "danger" : "warning"}>
                  impact {review.impactLevel}
                </Badge>
                <Badge>{review.detectedType}</Badge>
              </div>
              <h3 className="mt-3 font-semibold text-ink">{source?.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{organization?.name}</p>
              <p className="mt-3 text-sm font-medium text-ink">
                Colonne non reconnue : {review.sourceColumn}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Champ suggere : {review.suggestedAtlasField}
              </p>
              <p className="mt-2 text-sm text-slate-600">KPI impacte : {kpi?.name ?? "Aucun"}</p>
              <p className="mt-3 text-sm font-medium text-ink">{review.recommendedAction}</p>
            </article>
          );
        })}
      </CardContent>
    </Card>
  );
}
