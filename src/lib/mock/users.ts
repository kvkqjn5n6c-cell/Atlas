import type { User } from "@/types/atlas";

export const usersMock: User[] = [
  {
    id: "user-camille",
    name: "Camille Bernard",
    email: "camille@atlas.local",
    role: "SUPER_ADMIN",
    organizationIds: ["org-atlas-demo", "org-manufacture-nova", "org-care-services"],
    activeOrganizationId: "org-atlas-demo",
    status: "active",
    lastActivity: "25/05/2026 11:40"
  },
  {
    id: "user-remi",
    name: "Remi Laurent",
    email: "remi@atlas.local",
    role: "CONSULTANT",
    organizationIds: ["org-atlas-demo", "org-manufacture-nova"],
    activeOrganizationId: "org-atlas-demo",
    status: "active",
    lastActivity: "25/05/2026 10:12"
  },
  {
    id: "user-nadia",
    name: "Nadia Moreau",
    email: "nadia@demo-pme.fr",
    role: "CLIENT_ADMIN",
    organizationIds: ["org-atlas-demo"],
    activeOrganizationId: "org-atlas-demo",
    status: "active",
    lastActivity: "24/05/2026 18:05"
  },
  {
    id: "user-claire",
    name: "Claire Vidal",
    email: "claire@demo-pme.fr",
    role: "CLIENT_USER",
    organizationIds: ["org-atlas-demo"],
    activeOrganizationId: "org-atlas-demo",
    status: "invited",
    lastActivity: "Invitation envoyee"
  }
];

export const activeUser = usersMock[0];
