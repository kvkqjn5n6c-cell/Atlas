import { CheckCircle2, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardAction } from "@/types/dashboard";

const priorityVariant = {
  high: "danger",
  medium: "warning",
  low: "default"
} as const;

const priorityLabel = {
  high: "haute",
  medium: "moyenne",
  low: "basse"
};

export function PriorityActions({ actions }: { actions: DashboardAction[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Actions prioritaires</CardTitle>
          <Badge variant="brand">{actions.length} a traiter</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => (
          <article key={action.id} className="rounded-md border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 gap-3">
                <div className="rounded-md bg-brand-50 p-2 text-brand-700">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-ink">{action.title}</h3>
                  <p className="mt-1 text-sm leading-5 text-slate-500">{action.context}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                    {action.dueDate}
                  </div>
                </div>
              </div>
              <Badge variant={priorityVariant[action.priority]}>{priorityLabel[action.priority]}</Badge>
            </div>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}
