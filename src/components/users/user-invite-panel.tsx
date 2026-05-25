"use client";

import { MailPlus } from "lucide-react";
import { useState } from "react";
import { inviteUserAction } from "@/lib/actions/admin-actions";
import { organizationsMock } from "@/lib/mock/organizations";
import { formatUserRole } from "@/lib/formatters/status-labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActionResult, UserInvitationDraft, UserRole } from "@/types/atlas";

const roles: UserRole[] = ["SUPER_ADMIN", "CONSULTANT", "CLIENT_ADMIN", "CLIENT_USER"];

export function UserInvitePanel() {
  const [draft, setDraft] = useState<UserInvitationDraft>({
    name: "Julie Martin",
    email: "julie@demo-pme.fr",
    role: "CLIENT_USER",
    organizationId: organizationsMock[0]?.id ?? ""
  });
  const [result, setResult] = useState<ActionResult<UserInvitationDraft> | null>(null);
  const [pendingInvitations, setPendingInvitations] = useState<UserInvitationDraft[]>([]);

  function update<K extends keyof UserInvitationDraft>(key: K, value: UserInvitationDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setResult(null);
  }

  async function submitInvitation() {
    const actionResult = await inviteUserAction(draft);
    setResult(actionResult);
    if (actionResult.success) {
      setPendingInvitations((current) => [draft, ...current]);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Invitation mockée</CardTitle>
            <p className="mt-1 text-sm text-slate-500">Aucun email reel n&apos;est envoye.</p>
          </div>
          <Badge variant="brand">Multi-compte</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block rounded-md border border-line bg-slate-50 p-3">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Nom</span>
            <input
              value={draft.name}
              onChange={(event) => update("name", event.target.value)}
              className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
            />
            {result?.validationErrors?.name ? (
              <span className="mt-1 block text-xs text-rose-600">{result.validationErrors.name}</span>
            ) : null}
          </label>
          <label className="block rounded-md border border-line bg-slate-50 p-3">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</span>
            <input
              value={draft.email}
              onChange={(event) => update("email", event.target.value)}
              className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
            />
            {result?.validationErrors?.email ? (
              <span className="mt-1 block text-xs text-rose-600">{result.validationErrors.email}</span>
            ) : null}
          </label>
          <label className="block rounded-md border border-line bg-slate-50 p-3">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Rôle</span>
            <select
              value={draft.role}
              onChange={(event) => update("role", event.target.value as UserRole)}
              className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {formatUserRole(role)}
                </option>
              ))}
            </select>
          </label>
          <label className="block rounded-md border border-line bg-slate-50 p-3">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Organisation accessible</span>
            <select
              value={draft.organizationId}
              onChange={(event) => update("organizationId", event.target.value)}
              className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
            >
              {organizationsMock.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" onClick={() => void submitInvitation()}>
            <MailPlus className="h-4 w-4" aria-hidden="true" />
            Inviter un utilisateur
          </Button>
          <Badge variant="warning">Simulation mock</Badge>
          <Badge>Non persisté</Badge>
        </div>

        {result ? (
          <div
            className={`rounded-md border p-3 text-sm ${
              result.success
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            <p className="font-semibold">{result.message}</p>
            <p className="mt-1">Mode : {result.mode} - persisté : {result.persisted ? "oui" : "non"}</p>
          </div>
        ) : null}

        {pendingInvitations.length > 0 ? (
          <div className="rounded-md border border-line bg-white p-3">
            <p className="text-sm font-semibold text-ink">Invitations en attente</p>
            <div className="mt-3 grid gap-2">
              {pendingInvitations.map((invitation, index) => (
                <div
                  key={`${invitation.email}-${index}`}
                  className="flex flex-col justify-between gap-2 rounded-md bg-slate-50 p-3 text-sm sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-medium text-ink">{invitation.name}</p>
                    <p className="text-slate-500">{invitation.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="brand">{formatUserRole(invitation.role)}</Badge>
                    <Badge variant="warning">En attente</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
