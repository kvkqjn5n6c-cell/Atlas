import { Database, KeyRound, Network, ShieldCheck, SlidersHorizontal, Waypoints } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const settingsBlocks = [
  {
    title: "Périmètre de pilotage",
    icon: SlidersHorizontal,
    items: ["Organisation active", "Période de référence", "Axes de performance suivis"]
  },
  {
    title: "Mode de données",
    icon: Database,
    items: ["Mode mock par défaut", "Mode Prisma préparé", "Fallback local sécurisé"]
  },
  {
    title: "Gouvernance",
    icon: ShieldCheck,
    items: ["Rôles utilisateurs", "Accès par organisation", "Traçabilité future"]
  },
  {
    title: "Connecteurs futurs",
    icon: Network,
    items: ["CSV et Excel", "SQL et outils métiers", "APIs métier encadrées"]
  },
  {
    title: "Atlas Memory",
    icon: Waypoints,
    items: ["Glossaire métier", "Règles métier", "Historique des décisions"]
  },
  {
    title: "Sécurité",
    icon: KeyRound,
    items: ["Isolation multi-organisation", "Permissions", "Audit futur"]
  }
];

export function AtlasSettingsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="max-w-3xl">
          <Badge variant="brand">Paramètres Atlas</Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">Paramètres</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Préparer le cadre de pilotage, la gouvernance des accès et les futures intégrations sans élargir inutilement le périmètre produit.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {settingsBlocks.map((block, blockIndex) => {
          const Icon = block.icon;

          return (
            <Card key={`settings-block-${blockIndex}-${block.title}`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-brand-50 p-2 text-brand-700">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <CardTitle>{block.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {block.items.map((item, index) => (
                  <div key={`${block.title}-${index}-${item}`} className="rounded-md border border-line bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
