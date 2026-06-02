"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpenText,
  BrainCircuit,
  Building2,
  ClipboardList,
  Database,
  Gauge,
  ListTodo,
  LineChart,
  Network,
  Presentation,
  ScrollText,
  ShieldAlert,
  Settings,
  SlidersHorizontal,
  UploadCloud,
  Users,
  WalletCards
} from "lucide-react";
import {
  canConfigureKPI,
  canManageDataSources,
  canManageUsers,
  canViewAdminSection,
  getActiveUser,
  hasPermission
} from "@/lib/auth/permissions";
import { activePeriod, getActiveOrganization } from "@/lib/context/active-scope";
import { formatUserRole } from "@/lib/formatters/status-labels";
import { cn } from "@/lib/utils";

const presentationNavigation = [
  { name: "Démo", href: "/demo", icon: Presentation }
];

const pilotageNavigation = [
  { name: "Pilotage", href: "/pilotage", icon: BarChart3 },
  { name: "COPIL", href: "/copil", icon: Presentation },
  { name: "Indicateurs", href: "/indicators", icon: LineChart },
  { name: "Alertes", href: "/alerts", icon: ShieldAlert },
  { name: "Plans d'action", href: "/action-plans", icon: ListTodo },
  { name: "Rapports", href: "/reports", icon: ClipboardList },
  { name: "Journal décisionnel", href: "/decision-journal", icon: ScrollText }
];

const dataNavigation = [
  { name: "Sources de données", href: "/data-sources", icon: Database },
  { name: "Imports & mappings", href: "/imports-mappings", icon: UploadCloud },
  { name: "Dictionnaire métier", href: "/business-dictionary", icon: BookOpenText },
  { name: "Mémoire Atlas", href: "/atlas-memory", icon: BrainCircuit }
];

const adminNavigation = [
  { name: "Organisations", href: "/organizations", icon: Network },
  { name: "Utilisateurs", href: "/users", icon: Users },
  { name: "Configuration KPI", href: "/kpi-configuration", icon: Gauge },
  { name: "Paramètres", href: "/settings", icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();
  const activeUser = getActiveUser();
  const activeOrganization = getActiveOrganization();

  const visibleDataNavigation = dataNavigation.filter((item) => {
    if (item.href === "/data-sources" || item.href === "/imports-mappings") {
      return canManageDataSources(activeUser);
    }
    if (item.href === "/business-dictionary" || item.href === "/atlas-memory") {
      return canManageDataSources(activeUser) || canConfigureKPI(activeUser);
    }
    return true;
  });

  const visibleAdminNavigation = adminNavigation.filter((item) => {
    if (item.href === "/organizations") return hasPermission(activeUser, "viewAllOrganizations");
    if (item.href === "/users") return canManageUsers(activeUser);
    if (item.href === "/kpi-configuration") return canConfigureKPI(activeUser);
    return true;
  });

  const sections = [
    { title: "Présentation", items: presentationNavigation },
    { title: "Pilotage", items: pilotageNavigation },
    { title: "Données & connaissance", items: canViewAdminSection(activeUser) ? visibleDataNavigation : [] },
    { title: "Administration", items: canViewAdminSection(activeUser) ? visibleAdminNavigation : [] }
  ];

  return (
    <aside className="flex h-full w-full flex-col border-r border-line bg-white">
      <div className="border-b border-line px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Atlas</p>
            <p className="text-xs text-slate-500">Copilote décisionnel PME</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {sections.map((section, sectionIndex) => (
          <div key={`nav-section-${sectionIndex}-${section.title}`}>
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {section.title}
            </p>
            <div className="mt-2 space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-ink"
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-line px-5 py-4">
        <p className="text-xs font-medium text-slate-500">Organisation</p>
        <p className="mt-1 text-sm font-semibold text-ink">{activeOrganization?.name}</p>
        <div className="mt-3 flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <WalletCards className="h-3.5 w-3.5" aria-hidden="true" />
          Période active : {activePeriod}
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          Rôle : {formatUserRole(activeUser.role)}
        </div>
      </div>
    </aside>
  );
}
