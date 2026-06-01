"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, BrainCircuit, Database, GitBranch, RotateCcw, Save, ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { activeOrganizationId } from "@/lib/context/scope-defaults";
import {
  getAtlasMemoryDocuments,
  resetAtlasMemoryDocument,
  saveAtlasMemoryDocument
} from "@/lib/local/atlas-memory-store";
import { generateMemoryContext } from "@/lib/memory/atlas-memory-engine";
import { getAtlasMemoryMockByOrganization } from "@/lib/mock/atlas-memory";
import type { AtlasMemoryContextItem } from "@/types/atlas-memory-context";
import type { AtlasMemoryDocument, AtlasMemoryDocumentKey } from "@/types/atlas-memory";

const memoryLinks = [
  {
    title: "Atlas Core",
    description: "Contexte stable de l'organisation active.",
    icon: BrainCircuit
  },
  {
    title: "Business Engine",
    description: "Règles, KPI et décisions explicables.",
    icon: GitBranch
  },
  {
    title: "Agents futurs",
    description: "Agents spécialisés alimentés par une mémoire validée.",
    icon: Bot
  },
  {
    title: "Connecteurs",
    description: "Sources et documents structurés autour du même vocabulaire.",
    icon: Database
  }
];

function getInitialDocuments() {
  return getAtlasMemoryMockByOrganization(activeOrganizationId);
}

function KnowledgeList({ title, items }: { title: string; items: AtlasMemoryContextItem[] }) {
  return (
    <div className="rounded-md border border-line bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <Badge>{items.length}</Badge>
      </div>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Aucune connaissance détectée.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {items.slice(0, 4).map((item) => (
            <div key={`${item.source}-${item.text}`} className="rounded-md bg-white p-3 text-sm leading-5 text-slate-700">
              <p>{item.text}</p>
              <p className="mt-1 text-xs text-slate-500">Source mémoire : {item.source}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AtlasMemoryPage() {
  const [mounted, setMounted] = useState(false);
  const [documents, setDocuments] = useState<AtlasMemoryDocument[]>(getInitialDocuments);
  const [selectedKey, setSelectedKey] = useState<AtlasMemoryDocumentKey>("entreprise.md");
  const selectedDocument = useMemo(
    () => documents.find((document) => document.key === selectedKey) ?? documents[0],
    [documents, selectedKey]
  );
  const [draftByKey, setDraftByKey] = useState<Record<string, string>>(() =>
    Object.fromEntries(getInitialDocuments().map((document) => [document.key, document.content]))
  );
  const draftContent = selectedDocument ? draftByKey[selectedDocument.key] ?? selectedDocument.content : "";
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const memoryContext = useMemo(() => generateMemoryContext(documents), [documents]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextDocuments = getAtlasMemoryDocuments(activeOrganizationId);
      setDocuments(nextDocuments);
      setDraftByKey(Object.fromEntries(nextDocuments.map((document) => [document.key, document.content])));
      setSelectedKey((current) => nextDocuments.find((document) => document.key === current)?.key ?? nextDocuments[0]?.key ?? "entreprise.md");
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function refreshDocuments(preferredKey = selectedKey) {
    const nextDocuments = getAtlasMemoryDocuments(activeOrganizationId);
    setDocuments(nextDocuments);
    setDraftByKey(Object.fromEntries(nextDocuments.map((document) => [document.key, document.content])));
    setSelectedKey(nextDocuments.find((document) => document.key === preferredKey)?.key ?? nextDocuments[0]?.key ?? "entreprise.md");
  }

  function saveDocument() {
    if (!selectedDocument) return;

    saveAtlasMemoryDocument({
      ...selectedDocument,
      content: draftContent
    });
    refreshDocuments(selectedDocument.key);
    setSaveMessage("Document sauvegardé localement.");
  }

  function resetDocument() {
    if (!selectedDocument) return;
    const resetDocumentValue = resetAtlasMemoryDocument(activeOrganizationId, selectedDocument.key);
    refreshDocuments(selectedDocument.key);
    setDraftByKey((current) => ({
      ...current,
      [selectedDocument.key]: resetDocumentValue?.content ?? ""
    }));
    setSaveMessage("Document réinitialisé depuis le modèle.");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">Atlas Memory</Badge>
              <Badge>Mémoire locale non persistée</Badge>
              <Badge>{documents.length} documents</Badge>
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
              Mémoire métier structurée
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Centraliser les connaissances métier d&apos;une organisation sous forme de documents Markdown simulés :
              contexte, stratégie, règles, glossaire, KPI, décisions et équipe.
            </p>
          </div>
          <div className="rounded-md border border-line bg-slate-50 p-3 text-sm text-slate-600">
            <ScrollText className="mb-2 h-5 w-5 text-brand-700" aria-hidden="true" />
            Organisation active : {activeOrganizationId}
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        {memoryLinks.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-brand-50 p-2 text-brand-700">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <p className="font-semibold text-ink">{item.title}</p>
                </div>
                <p className="mt-3 text-sm leading-5 text-slate-600">{item.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Connaissances détectées</CardTitle>
            <Badge variant="brand">Moteur déterministe</Badge>
            <Badge>Sources explicables</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Atlas extrait des lignes simples depuis les documents mémoire pour enrichir les insights, les risques et la synthèse dirigeant.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <KnowledgeList title="Objectifs" items={memoryContext.objectives} />
          <KnowledgeList title="Règles métier" items={memoryContext.businessRules} />
          <KnowledgeList title="Décisions" items={memoryContext.decisions} />
          <KnowledgeList
            title="Glossaire"
            items={memoryContext.glossaryEntries.map((entry) => ({
              text: `${entry.term} : ${entry.definition}`,
              source: entry.source
            }))}
          />
          {memoryContext.warnings.length > 0 ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 lg:col-span-2">
              <p className="text-sm font-semibold text-amber-900">Limites détectées</p>
              <ul className="mt-2 space-y-1 text-sm text-amber-900">
                {memoryContext.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Documents mémoire</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Structure cible simulée. Aucun contenu n&apos;est écrit en base.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {documents.map((document) => (
              <button
                key={document.key}
                type="button"
                onClick={() => setSelectedKey(document.key)}
                className={`w-full rounded-md border p-3 text-left transition ${
                  selectedDocument?.key === document.key
                    ? "border-brand-200 bg-brand-50"
                    : "border-line bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-ink">{document.title}</p>
                  <Badge variant={document.source === "local" ? "warning" : "default"}>
                    {document.source === "local" ? "Local" : "Mock"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">{document.key}</p>
                <p className="mt-2 text-sm leading-5 text-slate-600">{document.description}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>{selectedDocument?.title ?? "Document mémoire"}</CardTitle>
                  <Badge>{selectedDocument?.key}</Badge>
                  <Badge variant={selectedDocument?.source === "local" ? "warning" : "default"}>
                    {selectedDocument?.source === "local" ? "Version locale" : "Modèle initial"}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Édition locale Markdown. Le contenu sera utilisable plus tard par le moteur métier, les agents et Atlas IA.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={saveDocument} disabled={!mounted || !selectedDocument}>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Sauvegarder
                </Button>
                <Button onClick={resetDocument} disabled={!mounted || !selectedDocument}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Réinitialiser
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={draftContent}
              onChange={(event) => {
                if (!selectedDocument) return;
                setDraftByKey((current) => ({
                  ...current,
                  [selectedDocument.key]: event.target.value
                }));
                setSaveMessage(null);
              }}
              className="min-h-[420px] w-full rounded-md border border-line bg-slate-50 p-4 font-mono text-sm leading-6 text-ink outline-none transition focus:border-brand-300 focus:bg-white"
              spellCheck={false}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Mémoire locale non persistée</Badge>
              <Badge>Markdown simulé</Badge>
              <Badge>{mounted ? "Client prêt" : "Chargement local"}</Badge>
              {saveMessage ? <Badge variant="success">{saveMessage}</Badge> : null}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
