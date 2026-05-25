import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const corrections = [
  {
    date: "25/05/2026 09:42",
    source: "Export facturation mensuel",
    correction: "region_vente mappee vers Region",
    user: "Camille Bernard",
    impact: "Analyse CA par zone fiabilisee"
  },
  {
    date: "24/05/2026 18:58",
    source: "Tableau marge commerciale",
    correction: "marge_brute mappee vers Marge",
    user: "Remi Laurent",
    impact: "KPI marge brute recalculable"
  },
  {
    date: "23/05/2026 12:18",
    source: "Retours interventions terrain",
    correction: "score_service marqué à vérifier",
    user: "Nadia Moreau",
    impact: "Rapport qualité maintenu en brouillon"
  }
];

export function MappingCorrectionsLog() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Journal des corrections</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="min-w-[850px] w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Correction</th>
                <th className="px-4 py-3 font-medium">Utilisateur</th>
                <th className="px-4 py-3 font-medium">Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-white">
              {corrections.map((correction) => (
                <tr key={`${correction.date}-${correction.source}`} className="transition hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600">{correction.date}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{correction.source}</td>
                  <td className="px-4 py-3 text-slate-600">{correction.correction}</td>
                  <td className="px-4 py-3 text-slate-600">{correction.user}</td>
                  <td className="px-4 py-3 font-medium text-ink">{correction.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
