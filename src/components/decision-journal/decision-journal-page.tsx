"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteJournalEntry, getJournalEntries } from "@/lib/local/decision-journal-store";
import type { DecisionJournalEntry, DecisionJournalEntryType } from "@/types/decision-journal";

type PeriodFilter = "all" | "today" | "seven_days" | "thirty_days";

const typeLabels: Record<DecisionJournalEntryType, string> = {
  recommendation_created: "Recommandation créée",
  action_plan_created: "Plan d'action créé",
  action_plan_updated: "Plan d'action mis à jour",
  impact_measured: "Impact mesuré",
  feedback_recorded: "Feedback enregistré",
  confidence_calculated: "Confiance calculée",
  memory_knowledge_approved: "Connaissance validée",
  memory_knowledge_rejected: "Connaissance rejetée"
};

const typeOptions: Array<DecisionJournalEntryType | "all"> = [
  "all",
  "recommendation_created",
  "action_plan_created",
  "action_plan_updated",
  "impact_measured",
  "feedback_recorded",
  "confidence_calculated",
  "memory_knowledge_approved",
  "memory_knowledge_rejected"
];

const priorityOptions = ["all", "low", "medium", "high", "critical"] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function isInPeriod(entry: DecisionJournalEntry, period: PeriodFilter) {
  if (period === "all") return true;

  const createdAt = new Date(entry.createdAt).getTime();
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  if (period === "today") return createdAt >= new Date().setHours(0, 0, 0, 0);
  if (period === "seven_days") return now - createdAt <= 7 * oneDay;
  return now - createdAt <= 30 * oneDay;
}

function typeLabel(type: DecisionJournalEntryType | "all") {
  return type === "all" ? "Tous les types" : typeLabels[type];
}

function priorityLabel(priority: string) {
  if (priority === "all") return "Toutes priorités";
  if (priority === "low") return "Basse";
  if (priority === "medium") return "Moyenne";
  if (priority === "high") return "Haute";
  return "Critique";
}

function periodLabel(period: PeriodFilter) {
  if (period === "today") return "Aujourd'hui";
  if (period === "seven_days") return "7 derniers jours";
  if (period === "thirty_days") return "30 derniers jours";
  return "Toute la période";
}

export function DecisionJournalPage() {
  const [mounted, setMounted] = useState(false);
  const [entries, setEntries] = useState<DecisionJournalEntry[]>([]);
  const [typeFilter, setTypeFilter] = useState<DecisionJournalEntryType | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<(typeof priorityOptions)[number]>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");

  function refresh() {
    setEntries(getJournalEntries());
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMounted(true);
      refresh();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const filteredEntries = useMemo(
    () =>
      entries.filter((entry) => {
        const typeMatches = typeFilter === "all" || entry.type === typeFilter;
        const priorityMatches = priorityFilter === "all" || entry.priority === priorityFilter;
        return typeMatches && priorityMatches && isInPeriod(entry, periodFilter);
      }),
    [entries, periodFilter, priorityFilter, typeFilter]
  );

  function deleteEntry(id: string) {
    deleteJournalEntry(id);
    refresh();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">Journal décisionnel</Badge>
              <Badge>Local</Badge>
              <Badge>Non persisté</Badge>
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
              Mémoire des décisions Atlas
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Retracer ce qui a été recommandé, transformé en plan d&apos;action, mesuré, validé ou commenté par l&apos;équipe.
            </p>
          </div>
          <div className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-ink">{entries.length} événement(s)</p>
            <p className="mt-1">Stockage local navigateur, sans Prisma ni serveur.</p>
          </div>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-3">
          <label className="text-xs font-medium text-slate-600">
            Type d&apos;événement
            <select
              className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as DecisionJournalEntryType | "all")}
            >
              {typeOptions.map((type) => (
                <option key={type} value={type}>{typeLabel(type)}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-slate-600">
            Priorité
            <select
              className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink"
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value as (typeof priorityOptions)[number])}
            >
              {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>{priorityLabel(priority)}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-slate-600">
            Période
            <select
              className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink"
              value={periodFilter}
              onChange={(event) => setPeriodFilter(event.target.value as PeriodFilter)}
            >
              {(["all", "today", "seven_days", "thirty_days"] as PeriodFilter[]).map((period) => (
                <option key={period} value={period}>{periodLabel(period)}</option>
              ))}
            </select>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Chronologie</CardTitle>
            <Badge>{filteredEntries.length} événement(s) affiché(s)</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {!mounted ? (
            <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
              Chargement du journal local.
            </p>
          ) : filteredEntries.length === 0 ? (
            <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
              Aucun événement ne correspond aux filtres sélectionnés.
            </p>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map((entry, index) => (
                <article key={`${entry.id}-${index}`} className="rounded-md border border-line bg-slate-50 p-4">
                  <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="brand">{typeLabels[entry.type]}</Badge>
                        {entry.priority ? <Badge>Priorité {entry.priority}</Badge> : null}
                        {entry.status ? <Badge>{entry.status}</Badge> : null}
                        {entry.confidenceScore !== undefined ? <Badge variant="success">{entry.confidenceScore} %</Badge> : null}
                      </div>
                      <h3 className="mt-3 font-semibold text-ink">{entry.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{entry.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span>{formatDate(entry.createdAt)}</span>
                        <span>Source : {entry.sourceType}</span>
                        <span>ID source : {entry.sourceId}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {entry.relatedKpiIds.length > 0 ? <Badge>{entry.relatedKpiIds.length} KPI lié(s)</Badge> : null}
                        {entry.relatedRecommendationIds.length > 0 ? <Badge>{entry.relatedRecommendationIds.length} recommandation(s)</Badge> : null}
                        {entry.relatedActionPlanIds.length > 0 ? <Badge>{entry.relatedActionPlanIds.length} plan(s)</Badge> : null}
                        {entry.relatedMemoryReferences.length > 0 ? <Badge>{entry.relatedMemoryReferences.length} référence(s) mémoire</Badge> : null}
                      </div>
                    </div>
                    <Button variant="ghost" onClick={() => deleteEntry(entry.id)}>
                      Supprimer
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
