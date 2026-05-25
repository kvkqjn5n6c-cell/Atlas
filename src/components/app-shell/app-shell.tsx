import { Sidebar } from "@/components/app-shell/sidebar";
import { Badge } from "@/components/ui/badge";
import { getActiveUser } from "@/lib/auth/permissions";
import { activePeriod, getActiveOrganization } from "@/lib/context/active-scope";
import { formatUserRole } from "@/lib/formatters/status-labels";
import { organizationsMock } from "@/lib/mock/organizations";

export function AppShell({ children }: { children: React.ReactNode }) {
  const activeOrganization = getActiveOrganization();
  const activeUser = getActiveUser();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="fixed inset-y-0 left-0 hidden w-64 lg:block">
        <Sidebar />
      </div>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-line bg-white/90 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Pilotage de performance
              </p>
              <h1 className="text-lg font-semibold text-ink">Atlas</h1>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <div className="hidden items-center gap-2 lg:flex">
                <Badge variant="brand">{activeOrganization?.name ?? "Organisation active"}</Badge>
                <Badge>{activePeriod}</Badge>
              </div>
              <div className="hidden items-center gap-2 xl:flex">
                <div className="rounded-md border border-line bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                  Organisation : {organizationsMock.map((organization) => organization.name).join(" / ")}
                </div>
                <div className="rounded-md border border-line bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                  Période : Mai 2026 / Juin 2026
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-ink">{activeUser.name}</p>
                <p className="text-xs text-slate-500">{formatUserRole(activeUser.role)}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                CB
              </div>
            </div>
          </div>
        </header>

        <div className="border-b border-line bg-white lg:hidden">
          <Sidebar />
        </div>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
