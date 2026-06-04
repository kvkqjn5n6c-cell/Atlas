"use client";

import { useEffect, useMemo, useState } from "react";
import { Database, Eye, PlugZap, Save, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { validateSqlConnectionConfig } from "@/lib/connectors/sql/sql-connector";
import { createMockSqlConnector } from "@/lib/connectors/sql/sql-mock-connector";
import { readSqlSchema } from "@/lib/connectors/sql/sql-schema-reader";
import { testSqlConnection } from "@/lib/connectors/sql/sql-test-connection";
import { readTablePreview } from "@/lib/connectors/sql/sql-preview-reader";
import { deleteSqlConnection, getSqlConnections, saveSqlConnection } from "@/lib/local/sql-connections-store";
import type {
  SqlConnectionConfig,
  SqlConnectionTestResult,
  SqlProvider,
  SqlSchemaReadResult,
  SqlTableInfo,
  SqlTablePreviewResult
} from "@/lib/connectors/sql/sql-types";

type DraftConnection = Omit<SqlConnectionConfig, "persisted">;

const defaultDraft: DraftConnection = {
  name: "Nova SQL lecture seule",
  provider: "postgresql",
  host: "localhost",
  port: 5432,
  database: "nova_reporting",
  username: "readonly_user",
  password: "demo-only",
  readonly: true
};

const providerLabels: Record<SqlProvider, string> = {
  postgresql: "PostgreSQL",
  sqlserver: "SQL Server"
};

function asConnectionConfig(draft: DraftConnection): SqlConnectionConfig {
  return {
    ...draft,
    port: Number(draft.port),
    persisted: false
  };
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

const inputClassName = "h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-brand-300";

function SqlSchemaList({
  schema,
  onPreview
}: {
  schema?: SqlSchemaReadResult;
  onPreview: (table: SqlTableInfo) => void;
}) {
  const items = schema ? [...schema.tables, ...schema.views] : [];

  if (!schema) {
    return (
      <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
        Testez une connexion puis lisez le schema pour afficher les tables et vues disponibles.
      </p>
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {items.map((table) => (
        <article key={`${table.schema}-${table.name}-${table.type}`} className="rounded-md border border-line bg-slate-50 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={table.type === "view" ? "brand" : "default"}>{table.type === "view" ? "Vue" : "Table"}</Badge>
            {table.schema ? <Badge>{table.schema}</Badge> : null}
            <Badge>{table.columns.length} colonne(s)</Badge>
          </div>
          <h3 className="mt-3 text-sm font-semibold text-ink">{table.name}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {table.columns.slice(0, 6).map((column) => (
              <Badge key={`${table.name}-${column.name}`}>{column.name}</Badge>
            ))}
          </div>
          <Button className="mt-4" onClick={() => onPreview(table)}>
            <Eye className="h-4 w-4" aria-hidden="true" />
            Voir apercu
          </Button>
        </article>
      ))}
    </div>
  );
}

function PreviewTable({ preview }: { preview?: SqlTablePreviewResult }) {
  if (!preview) {
    return (
      <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
        Aucun apercu selectionne. Atlas lira au maximum 100 lignes.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="min-w-[900px] w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {preview.columns.map((column) => (
              <th key={column.name} className="px-4 py-3 font-medium">
                {column.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line bg-white">
          {preview.rows.map((row, rowIndex) => (
            <tr key={`${preview.tableName}-${rowIndex}`} className="align-top transition hover:bg-slate-50">
              {preview.columns.map((column) => (
                <td key={`${preview.tableName}-${rowIndex}-${column.name}`} className="px-4 py-3 text-slate-600">
                  {String(row[column.name] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SqlConnectionsPage() {
  const [mounted, setMounted] = useState(false);
  const [draft, setDraft] = useState<DraftConnection>(defaultDraft);
  const [connections, setConnections] = useState<SqlConnectionConfig[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>("");
  const [testResult, setTestResult] = useState<SqlConnectionTestResult | null>(null);
  const [schema, setSchema] = useState<SqlSchemaReadResult | undefined>();
  const [preview, setPreview] = useState<SqlTablePreviewResult | undefined>();
  const [message, setMessage] = useState("");
  const connector = useMemo(() => createMockSqlConnector(), []);
  const selectedConnection = connections.find((connection) => connection.id === selectedConnectionId) ?? connections[0];
  const validation = validateSqlConnectionConfig(asConnectionConfig(draft));

  function refreshConnections(preferredId?: string) {
    const nextConnections = getSqlConnections();
    setConnections(nextConnections);
    setSelectedConnectionId(preferredId ?? nextConnections[0]?.id ?? "");
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      refreshConnections();
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function updateDraft<K extends keyof DraftConnection>(key: K, value: DraftConnection[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  function saveConnection() {
    const config = asConnectionConfig(draft);
    const result = validateSqlConnectionConfig(config);
    if (!result.valid) {
      setMessage(result.errors.join(" "));
      return;
    }

    const savedConnection = saveSqlConnection(config);
    refreshConnections(savedConnection.id);
    setMessage("Connexion SQL locale sauvegardee. DEMO ONLY : mot de passe stocke localement.");
  }

  async function runTestConnection() {
    const config = selectedConnection ?? asConnectionConfig(draft);
    const result = await testSqlConnection(config, connector);
    setTestResult(result);
    setMessage(result.message);
  }

  async function runSchemaRead() {
    const config = selectedConnection ?? asConnectionConfig(draft);
    const nextSchema = await readSqlSchema(config, connector);
    setSchema(nextSchema);
    setPreview(undefined);
    setMessage(`Schema lu : ${nextSchema.tables.length} table(s), ${nextSchema.views.length} vue(s).`);
  }

  async function runPreview(table: SqlTableInfo) {
    const config = selectedConnection ?? asConnectionConfig(draft);
    const nextPreview = await readTablePreview(config, table.name, table.schema, connector);
    setPreview(nextPreview);
    setMessage(`Apercu limite a ${nextPreview.rowLimit} lignes pour ${table.name}.`);
  }

  function removeConnection(id: string) {
    deleteSqlConnection(id);
    refreshConnections();
    setSchema(undefined);
    setPreview(undefined);
    setMessage("Connexion SQL locale supprimee.");
  }

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connexions SQL</CardTitle>
          <p className="mt-1 text-sm text-slate-500">Chargement des connexions locales.</p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">Connecteur SQL V1</Badge>
              <Badge>Lecture seule</Badge>
              <Badge>LocalStorage</Badge>
              <Badge>DEMO ONLY</Badge>
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">Explorer une base SQL externe</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Premiere brique de connecteurs Atlas : tester une connexion, lire le schema et afficher un apercu limite. Aucune ecriture SQL, aucun ETL, aucun KPI cree automatiquement.
            </p>
          </div>
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Les mots de passe sont stockes localement pour demonstration uniquement. Ne pas utiliser avec des secrets reels.
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Nouvelle connexion</CardTitle>
              <Badge>{validation.valid ? "Configuration complete" : `${validation.errors.length} erreur(s)`}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Nom">
              <input className={inputClassName} value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} />
            </Field>
            <Field label="Provider">
              <select
                className={inputClassName}
                value={draft.provider}
                onChange={(event) => updateDraft("provider", event.target.value as SqlProvider)}
              >
                <option value="postgresql">PostgreSQL</option>
                <option value="sqlserver">SQL Server</option>
              </select>
            </Field>
            <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
              <Field label="Hote">
                <input className={inputClassName} value={draft.host} onChange={(event) => updateDraft("host", event.target.value)} />
              </Field>
              <Field label="Port">
                <input
                  className={inputClassName}
                  type="number"
                  value={draft.port}
                  onChange={(event) => updateDraft("port", Number(event.target.value))}
                />
              </Field>
            </div>
            <Field label="Base">
              <input className={inputClassName} value={draft.database} onChange={(event) => updateDraft("database", event.target.value)} />
            </Field>
            <Field label="Utilisateur">
              <input className={inputClassName} value={draft.username} onChange={(event) => updateDraft("username", event.target.value)} />
            </Field>
            <Field label="Mot de passe">
              <input
                className={inputClassName}
                type="password"
                value={draft.password}
                onChange={(event) => updateDraft("password", event.target.value)}
              />
            </Field>
            <Button variant="primary" onClick={saveConnection}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Sauvegarder localement
            </Button>
            {message ? <p className="rounded-md border border-line bg-slate-50 p-3 text-sm text-slate-600">{message}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Connexions locales</CardTitle>
              <Badge>{connections.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {connections.length === 0 ? (
              <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
                Aucune connexion SQL locale. Enregistrez une configuration pour explorer le schema simule.
              </p>
            ) : (
              <div className="space-y-3">
                {connections.map((connection) => (
                  <article
                    key={connection.id}
                    className={`rounded-md border p-4 ${connection.id === selectedConnection?.id ? "border-brand-200 bg-brand-50" : "border-line bg-slate-50"}`}
                  >
                    <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="brand">{providerLabels[connection.provider]}</Badge>
                          <Badge>Lecture seule</Badge>
                          <Badge>Local</Badge>
                        </div>
                        <h3 className="mt-3 text-sm font-semibold text-ink">{connection.name}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {connection.host}:{connection.port} / {connection.database}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={() => setSelectedConnectionId(connection.id ?? "")}>Selectionner</Button>
                        <Button variant="ghost" onClick={() => removeConnection(connection.id ?? "")}>
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Exploration lecture seule</CardTitle>
            <Badge>{selectedConnection ? selectedConnection.name : "Configuration brouillon"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={runTestConnection}>
              <PlugZap className="h-4 w-4" aria-hidden="true" />
              Tester connexion
            </Button>
            <Button variant="primary" onClick={runSchemaRead}>
              <Database className="h-4 w-4" aria-hidden="true" />
              Lire schema
            </Button>
            {testResult ? (
              <Badge variant={testResult.success ? "success" : "danger"}>
                {testResult.success ? "Connexion OK" : "Connexion echouee"} - {testResult.latencyMs} ms
              </Badge>
            ) : null}
          </div>
          <SqlSchemaList schema={schema} onPreview={runPreview} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Apercu donnees</CardTitle>
            <Badge>100 lignes max</Badge>
            <Badge>Aucune lecture complete</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <PreviewTable preview={preview} />
        </CardContent>
      </Card>
    </div>
  );
}
