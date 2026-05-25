import { activeUser } from "@/lib/mock/users";
import type { PermissionKey, User, UserRole } from "@/types/atlas";

const permissionsByRole: Record<UserRole, PermissionKey[]> = {
  SUPER_ADMIN: [
    "viewAllOrganizations",
    "manageUsers",
    "manageDataSources",
    "configureKpis",
    "editTargets",
    "viewPilotage",
    "viewReports",
    "manageActionPlans"
  ],
  CONSULTANT: [
    "viewAllOrganizations",
    "manageDataSources",
    "configureKpis",
    "editTargets",
    "viewPilotage",
    "viewReports",
    "manageActionPlans"
  ],
  CLIENT_ADMIN: [
    "manageUsers",
    "manageDataSources",
    "editTargets",
    "viewPilotage",
    "viewReports",
    "manageActionPlans"
  ],
  CLIENT_USER: ["viewPilotage", "viewReports", "manageActionPlans"]
};

export function getPermissionsForRole(role: UserRole) {
  return permissionsByRole[role];
}

export function hasPermission(user: User, permission: PermissionKey) {
  return permissionsByRole[user.role].includes(permission);
}

export function canAccessOrganization(user: User, organizationId: string) {
  return hasPermission(user, "viewAllOrganizations") || user.organizationIds.includes(organizationId);
}

export function canViewAdminSection(user: User) {
  return (
    canConfigureKPI(user) ||
    canManageUsers(user) ||
    canManageDataSources(user) ||
    hasPermission(user, "editTargets")
  );
}

export function canConfigureKPI(user: User) {
  return hasPermission(user, "configureKpis");
}

export function canManageUsers(user: User) {
  return hasPermission(user, "manageUsers");
}

export function canManageDataSources(user: User) {
  return hasPermission(user, "manageDataSources");
}

export function getActiveUser() {
  return activeUser;
}
