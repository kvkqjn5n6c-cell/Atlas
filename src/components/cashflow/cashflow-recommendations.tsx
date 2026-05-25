import { Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CashflowRecommendation } from "@/types/cashflow";
import { CashflowRiskBadge } from "./cashflow-risk-badge";

export function CashflowRecommendations({
  recommendations
}: {
  recommendations: CashflowRecommendation[];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Recommandations prioritaires</CardTitle>
          <Badge variant="brand">{recommendations.length} actions</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((recommendation) => (
          <article key={recommendation.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-white p-2 text-brand-700">
                <Lightbulb className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-ink">{recommendation.title}</h3>
                  <CashflowRiskBadge riskLevel={recommendation.riskLevel} />
                </div>
                <p className="mt-2 text-sm leading-5 text-slate-600">
                  {recommendation.description}
                </p>
                <p className="mt-3 text-sm font-medium text-ink">{recommendation.impact}</p>
              </div>
            </div>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}
