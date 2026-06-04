"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Database, Save, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { atlasFieldCatalog, getAtlasFieldById } from "@/lib/connectors/sql/atlas-field-catalog";
import { createMapping, suggestSqlMappings, updateMapping, validateMapping } from "@/lib/connectors/sql/sql-mapping-engine";
import type { SqlMappingBundle } from "@/lib/connectors/sql/sql-mapping-types";
import { createMockSqlConnector } from "@/lib/connectors/sql/sql-mock-connector";
import { createPreparedSqlSource, summarizePreparedSqlSource } from "@/lib/connectors/sql/sql-prepared-source-engine";
import type { PreparedSqlSourceBundle } from "@/lib/connectors/sql/sql-prepared-source-types";
import { readTablePreview } from "@/lib/connectors/sql/sql-preview-reader";
import { readSqlSchema } from "@/lib/connectors/sql/sql-schema-reader";
import type { SqlConnectionConfig, SqlSchemaReadResult, SqlTableInfo } from "@/lib/connectors/sql/sql-types";
import { getSqlConnections } from "@/lib/local/sql-connections-store";
import { getSqlMappings, saveSqlMapping } from "@/lib/local/sql-mappings-store";
import { getPreparedSqlSources, savePreparedSqlSource } from "@/lib/local/sql-prepared-sources-store";

function scoreVariant(score: number) {
  if (score >= 80) return "success";
  if (score >= 55) return "warning";
  return "danger";
}

function fieldLabel(fieldId?: string) {
  return getAtlasFieldById(fieldId)?.label ?? "Non mappe";
}

export function SqlMappingsPage() {
  const [mounted, setMounted] = useState(false);
  const [connections, setConnections] = useState<SqlConnectionConfig[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState("");
  const [schema, setSchema] = useState<SqlSchemaReadResult | undefined>();
  const [selectedTableKey, setSelectedTableKey] = useState("");
  const [currentMapping, setCurrentMapping] = useState<SqlMappingBundle | undefined>();
  const [savedMappings, setSavedMappings] = useState<SqlMappingBundle[]>([]);
  const [preparedSources, setPreparedSources] = useState<PreparedSqlSourceBundle[]>([]);
  const [lastPreparedSource, setLastPreparedSource] = useState<PreparedSqlSourceBundle | undefined>();
  const [message, setMessage] = useState("");
  const connector = useMemo(() => createMockSqlConnector(), []);
  const selectedConnection = connections.find((connection) => connection.id === selectedConnectionId) ?? connections[0];
  const tables = schema ? [...schema.tables, ...schema.views] : [];
  const selectedTable = tables.find((table) => `${table.schema ?? ""}.${table.name}` === selectedTableKey) ?? tables[0];
  const suggestions = useMemo(
    () => (selectedTable ? suggestSqlMappings(selectedTable.columns) : []),
    [selectedTable]
  );
  const validation = currentMapping ? validateMapping(currentMapping) : undefined;
  const canPrepareSource = Boolean(currentMapping && validation && validation.mappedColumnCount > 0 && selectedConnection && selectedTable);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextConnections = getSqlConnections();
      setConnections(nextConnections);
      setSelectedConnectionId(nextConnections[0]?.id ?? "");
      setSavedMappings(getSqlMappings());
      setPreparedSources(getPreparedSqlSources());
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  async function loadSchema(connection = selectedConnection) {
    if (!connection) return;

    const nextSchema = await readSqlSchema(connection, connector);
    const nextTables = [...nextSchema.tables, ...nextSchema.views];
    setSchema(nextSchema);
    setSelectedTableKey(nextTables[0] ? `${nextTables[0].schema ?? ""}.${nextTables[0].name}` : "");
    setCurrentMapping(undefined);
    setLastPreparedSource(undefined);
    setMessage(`Schema lu : ${nextSchema.tables.length} table(s), ${nextSchema.views.length} vue(s).`);
  }

  function startMapping(table: SqlTableInfo = selectedTable) {
    if (!selectedConnection || !table) return;

    const mapping = createMapping({
      connectionId: selectedConnection.id ?? selectedConnection.name,
      table,
      description: `Mapping metier Atlas pour ${table.schema ? `${table.schema}.` : ""}${table.name}`
    });
    setCurrentMapping(mapping);
    setLastPreparedSource(undefined);
    setMessage("Suggestions deterministes appliquees. Verifiez les champs avant sauvegarde.");
  }

  function updateColumn(sourceColumn: string, targetField?: string) {
    if (!currentMapping) return;

    setCurrentMapping(updateMapping({
      mapping: currentMapping,
      sourceColumn,
      targetField: targetField || undefined,
      enabled: Boolean(targetField)
    }));
  }

  function toggleColumn(sourceColumn: string, enabled: boolean) {
    if (!currentMapping) return;

    setCurrentMapping(updateMapping({
      mapping: currentMapping,
      sourceColumn,
      enabled
    }));
  }

  function saveMapping() {
    if (!currentMapping) return;
    const saved = saveSqlMapping(currentMapping);
    setCurrentMapping(saved);
    setSavedMappings(getSqlMappings());
    setMessage("Mapping SQL sauvegarde localement. Aucune donnee n'a ete importee.");
  }

  async function prepareSource() {
    if (!currentMapping || !selectedConnection || !selectedTable || !canPrepareSource) return;

    const preview = await readTablePreview(selectedConnection, selectedTable.name, selectedTable.schema, connector);
    const prepared = createPreparedSqlSource(currentMapping, selectedTable, preview);
    const saved = savePreparedSqlSource(prepared);
    setLastPreparedSource(saved);
    setPreparedSources(getPreparedSqlSources());
    setMessage("Source SQL preparee localement. Atlas conserve uniquement le mapping et un apercu limite.");
  }

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mapping SQL</CardTitle>
          <p className="mt-1 text-sm text-slate-500">Chargement des connexions SQL locales.</p>
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
              <Badge variant="brand">Mapping SQL</Badge>
              <Badge>Deterministe</Badge>
              <Badge>Lecture seule</Badge>
              <Badge>LocalStorage</Badge>
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
              Traduire une table SQL en vocabulaire Atlas
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Selectionnez une table SQL, verifiez les suggestions et mappez les colonnes vers les champs Atlas. Cette phase ne declenche aucun import, aucun KPI et aucune ecriture SQL.
            </p>
          </div>
          <Link
            href="/sql-connections"
            className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Gerer connexions SQL
          </Link>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Source SQL</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {connections.length === 0 ? (
              <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
                Aucune connexion SQL locale. Creez d&apos;abord une connexion depuis Connexions SQL.
              </p>
            ) : (
              <>
                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Connexion</span>
                  <select
                    className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-brand-300"
                    value={selectedConnectionId}
                    onChange={(event) => {
                      setSelectedConnectionId(event.target.value);
                      setSchema(undefined);
                      setCurrentMapping(undefined);
                    }}
                  >
                    {connections.map((connection) => (
                      <option key={connection.id} value={connection.id}>
                        {connection.name}
                      </option>
                    ))}
                  </select>
                </label>
                <Button onClick={() => loadSchema()}>
                  <Database className="h-4 w-4" aria-hidden="true" />
                  Lire schema
                </Button>
              </>
            )}

            {tables.length > 0 ? (
              <label className="space-y-1 text-sm">
                <span className="font-medium text-slate-700">Table ou vue</span>
                <select
                  className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-brand-300"
                  value={selectedTableKey}
                  onChange={(event) => {
                    setSelectedTableKey(event.target.value);
                    setCurrentMapping(undefined);
                  }}
                >
                  {tables.map((table) => (
                    <option key={`${table.schema}-${table.name}`} value={`${table.schema ?? ""}.${table.name}`}>
                      {table.schema ? `${table.schema}.` : ""}{table.name} ({table.type})
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {selectedTable ? (
              <Button variant="primary" onClick={() => startMapping(selectedTable)}>
                <Wand2 className="h-4 w-4" aria-hidden="true" />
                Generer mapping suggere
              </Button>
            ) : null}

            {message ? <p className="rounded-md border border-line bg-slate-50 p-3 text-sm text-slate-600">{message}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Suggestions deterministes</CardTitle>
              <Badge>{suggestions.length} colonne(s)</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {suggestions.length === 0 ? (
              <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
                Lisez un schema puis selectionnez une table pour afficher les suggestions.
              </p>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {suggestions.map((suggestion) => (
                  <article key={suggestion.sourceColumn} className="rounded-md border border-line bg-slate-50 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{suggestion.sourceType}</Badge>
                      <Badge variant={suggestion.confidence >= 80 ? "success" : suggestion.confidence > 0 ? "warning" : "default"}>
                        {suggestion.confidence}% confiance
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-ink">{suggestion.sourceColumn}</p>
                    <p className="mt-1 text-sm text-slate-600">Suggestion : {fieldLabel(suggestion.suggestedField)}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{suggestion.reason}</p>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="border-brand-100">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Mapping colonnes SQL vers Atlas</CardTitle>
            {validation ? <Badge variant={scoreVariant(validation.qualityScore)}>Score {validation.qualityScore}/100</Badge> : null}
            {validation ? <Badge>{validation.mappedColumnCount} mappee(s)</Badge> : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!currentMapping ? (
            <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
              Generez un mapping suggere pour commencer la traduction metier.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-line">
                <table className="min-w-[980px] w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Active</th>
                      <th className="px-4 py-3 font-medium">Colonne SQL</th>
                      <th className="px-4 py-3 font-medium">Type SQL</th>
                      <th className="px-4 py-3 font-medium">Champ Atlas</th>
                      <th className="px-4 py-3 font-medium">Obligatoire</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line bg-white">
                    {currentMapping.columnMappings.map((column) => (
                      <tr key={column.id} className="align-top transition hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={column.enabled}
                            onChange={(event) => toggleColumn(column.sourceColumn, event.target.checked)}
                            aria-label={`Activer ${column.sourceColumn}`}
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-ink">{column.sourceColumn}</td>
                        <td className="px-4 py-3 text-slate-600">{column.sourceType}</td>
                        <td className="px-4 py-3">
                          <select
                            className="h-9 min-w-[220px] rounded-md border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-brand-300"
                            value={column.targetField ?? ""}
                            onChange={(event) => updateColumn(column.sourceColumn, event.target.value)}
                          >
                            <option value="">Non mappe</option>
                            {atlasFieldCatalog.map((field) => (
                              <option key={field.id} value={field.id}>
                                {field.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          {column.required ? <Badge variant="warning">Oui</Badge> : <Badge>Non</Badge>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {validation ? (
                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-md border border-line bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={validation.valid ? "success" : "danger"}>{validation.valid ? "Valide" : "A corriger"}</Badge>
                      <Badge>{validation.unmappedColumnCount} non mappee(s)</Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Ce score mesure uniquement la qualite du mapping. Aucune donnee SQL n&apos;est importee.
                    </p>
                  </div>
                  <div className="rounded-md border border-line bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-ink">Alertes validation</p>
                    {[...validation.errors, ...validation.warnings].length === 0 ? (
                      <p className="mt-2 text-sm text-slate-600">Aucun conflit detecte.</p>
                    ) : (
                      <ul className="mt-2 space-y-2">
                        {[...validation.errors, ...validation.warnings].slice(0, 8).map((item, index) => (
                          <li key={`mapping-validation-${index}-${item}`} className="text-sm text-slate-600">
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button variant="primary" onClick={saveMapping}>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Sauvegarder mapping local
                </Button>
                <Button onClick={prepareSource} disabled={!canPrepareSource}>
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Preparer cette source
                </Button>
              </div>

              {lastPreparedSource ? (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="success">Source preparee</Badge>
                    <Badge>Score {lastPreparedSource.source.qualityScore}/100</Badge>
                    <Badge>{lastPreparedSource.source.availableAtlasFields.length} champ(s) Atlas</Badge>
                    <Badge>{lastPreparedSource.preview.rows.length} ligne(s) apercu</Badge>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-emerald-950">
                    {summarizePreparedSqlSource(lastPreparedSource.source).summary}
                  </p>
                  <p className="mt-2 text-sm text-emerald-800">
                    Champs disponibles : {summarizePreparedSqlSource(lastPreparedSource.source).fields}.
                  </p>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Mappings sauvegardes</CardTitle>
            <Badge>{savedMappings.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {savedMappings.length === 0 ? (
            <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
              Aucun mapping SQL sauvegarde localement.
            </p>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {savedMappings.map((mapping) => {
                const savedValidation = validateMapping(mapping);

                return (
                  <article key={mapping.tableMapping.id} className="rounded-md border border-line bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={scoreVariant(savedValidation.qualityScore)}>Score {savedValidation.qualityScore}/100</Badge>
                      <Badge>{savedValidation.mappedColumnCount} colonne(s)</Badge>
                      <Badge>Local</Badge>
                    </div>
                    <h3 className="mt-3 text-sm font-semibold text-ink">
                      {mapping.tableMapping.schema ? `${mapping.tableMapping.schema}.` : ""}{mapping.tableMapping.tableName}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{mapping.tableMapping.description}</p>
                    <p className="mt-3 text-xs text-slate-500">Mis a jour : {new Date(mapping.tableMapping.updatedAt).toLocaleString("fr-FR")}</p>
                  </article>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Sources SQL preparees</CardTitle>
            <Badge>{preparedSources.length}</Badge>
            <Badge>Pretes pour pipeline futur</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {preparedSources.length === 0 ? (
            <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
              Aucune source SQL preparee. Validez un mapping puis utilisez le bouton Preparer cette source.
            </p>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {preparedSources.map(({ source, preview }) => (
                <article key={source.id} className="rounded-md border border-line bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={scoreVariant(source.qualityScore)}>Score {source.qualityScore}/100</Badge>
                    <Badge>{source.availableAtlasFields.length} champ(s)</Badge>
                    <Badge>{preview.rows.length} ligne(s) apercu</Badge>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-ink">{source.displayName}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Champs Atlas : {source.availableAtlasFields.map((field) => field.label).join(", ") || "aucun"}.
                  </p>
                  <p className="mt-3 text-xs text-slate-500">Preparee : {new Date(source.updatedAt).toLocaleString("fr-FR")}</p>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-brand-100 bg-brand-50">
        <CardContent className="flex flex-wrap items-center gap-3 p-5 text-sm text-brand-700">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          Mapping SQL V1 prepare la future ingestion. Il ne lit pas toute la table et ne cree pas encore d&apos;indicateurs.
        </CardContent>
      </Card>
    </div>
  );
}
