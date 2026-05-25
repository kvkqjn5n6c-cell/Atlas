import { organizationsMock } from "@/lib/mock/organizations";
import { isPrismaMode } from "@/lib/config/data-mode";
import type { Organization } from "@/types/atlas";

let lastFallbackUsed = false;

export function wasOrganizationsFallbackUsed() {
  return lastFallbackUsed;
}

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

function toOrganization(record: {
  id: string;
  name: string;
  sector: string;
  size: string;
  status: string;
}): Organization {
  return {
    id: record.id,
    name: record.name,
    sector: record.sector,
    size: record.size === "TPE" ? "TPE" : "PME",
    owner: "Direction",
    status:
      record.status === "WATCH" ? "watch" : record.status === "INACTIVE" ? "inactive" : "active",
    activePeriod: "Mai 2026"
  };
}

export function getOrganizationsMock() {
  return organizationsMock;
}

export function getOrganizationByIdMock(id: string) {
  return organizationsMock.find((organization) => organization.id === id);
}

export function getOrganizationsByIds(ids: string[]) {
  return organizationsMock.filter((organization) => ids.includes(organization.id));
}

export async function getOrganizations() {
  lastFallbackUsed = false;

  if (!isPrismaMode()) {
    return organizationsMock;
  }

  try {
    const prisma = await getPrisma();
    const records = await prisma.organization.findMany({ orderBy: { name: "asc" } });
    return records.map(toOrganization);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getOrganizations failed, falling back to mocks.", error);
    return organizationsMock;
  }
}

export async function getOrganizationById(id: string) {
  lastFallbackUsed = false;

  if (!isPrismaMode()) {
    return getOrganizationByIdMock(id);
  }

  try {
    const prisma = await getPrisma();
    const record = await prisma.organization.findUnique({ where: { id } });
    return record ? toOrganization(record) : undefined;
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getOrganizationById failed, falling back to mock.", error);
    return getOrganizationByIdMock(id);
  }
}
