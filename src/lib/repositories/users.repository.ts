import { usersMock } from "@/lib/mock/users";

export function getUsers() {
  return usersMock;
}

export function getUserById(id: string) {
  return usersMock.find((user) => user.id === id);
}

export function getUsersByOrganization(organizationId: string) {
  return usersMock.filter((user) => user.organizationIds.includes(organizationId));
}

// TODO Phase 7: lire User et OrganizationUser depuis Prisma.
