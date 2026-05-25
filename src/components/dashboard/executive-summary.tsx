import { BrainCircuit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStateClasses } from "@/lib/business/dashboard";
import { cn } from "@/lib/utils";
import type { ExecutiveSummaryItem } from "@/types/dashboard";

export function ExecutiveSummary({ items }: { items: ExecutiveSummaryItem[] }) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-brand-50 p-2 text-brand-700">
            <BrainCircuit className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle>Synthèse dirigeant</CardTitle>
            <p className="mt-1 text-sm text-slate-500">Lecture automatique orientée décision.</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 lg:grid-cols-4">
          {items.map((item) => (
            <article key={item.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full border", getStateClasses(item.state))} />
                <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.content}</p>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
