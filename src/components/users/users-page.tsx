import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUserRole, formatUserStatus } from "@/lib/formatters/status-labels";
import { organizationsMock } from "@/lib/mock/organizations";
import { usersMock } from "@/lib/mock/users";
import type { UserRole } from "@/types/atlas";
import { UserInvitePanel } from "./user-invite-panel";

const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: "Super admin",
  CONSULTANT: "Consultants",
  CLIENT_ADMIN: "Admins clients",
  CLIENT_USER: "Utilisateurs clients"
};

export function UsersPage() {
  const roleStats = Object.keys(roleLabels).map((role) => ({
    role: role as UserRole,
    count: usersMock.filter((user) => user.role === role).length
  }));

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <Badge variant="brand">Utilisateurs & rôles</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
              Accès multi-compte
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Préparation des accès SaaS : rôle, organisations accessibles et statut utilisateur.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary">Inviter un utilisateur</Button>
            <Button>Modifier le rôle</Button>
            <Button>Désactiver un accès</Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        {roleStats.map((stat) => (
          <Card key={stat.role}>
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">{roleLabels[stat.role]}</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{stat.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <UserInvitePanel />

      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs mockés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="min-w-[900px] w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Nom</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Rôle</th>
                  <th className="px-4 py-3 font-medium">Organisations accessibles</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">Dernière activité</th>
                  <th className="px-4 py-3 font-medium">Actions mockées</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-white">
                {usersMock.map((user) => {
                  const organizationNames = user.organizationIds
                    .map((id) => organizationsMock.find((organization) => organization.id === id)?.name)
                    .filter(Boolean)
                    .join(", ");

                  return (
                    <tr key={user.id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-4 font-semibold text-ink">{user.name}</td>
                      <td className="px-4 py-4 text-slate-600">{user.email}</td>
                      <td className="px-4 py-4"><Badge variant="brand">{formatUserRole(user.role)}</Badge></td>
                      <td className="px-4 py-4 text-slate-600">{organizationNames}</td>
                      <td className="px-4 py-4"><Badge variant={user.status === "active" ? "success" : "warning"}>{formatUserStatus(user.status)}</Badge></td>
                      <td className="px-4 py-4 text-slate-600">{user.lastActivity}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button>Modifier rôle</Button>
                          <Button>{user.status === "invited" ? "Renvoyer invitation" : "Désactiver accès"}</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
