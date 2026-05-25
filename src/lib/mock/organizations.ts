import type { Organization } from "@/types/atlas";

export const organizationsMock: Organization[] = [
  {
    id: "org-atlas-demo",
    name: "Nova Services Maintenance",
    sector: "Maintenance terrain multi-sites",
    size: "PME",
    owner: "Camille Bernard",
    status: "active",
    activePeriod: "Mai 2026"
  },
  {
    id: "org-manufacture-nova",
    name: "Manufacture Nova",
    sector: "Industrie legere",
    size: "PME",
    owner: "Hugo Martin",
    status: "watch",
    activePeriod: "Mai 2026"
  },
  {
    id: "org-care-services",
    name: "Care Services",
    sector: "Services terrain",
    size: "TPE",
    owner: "Sarah Petit",
    status: "active",
    activePeriod: "Mai 2026"
  }
];

export const activeOrganization = organizationsMock[0];
