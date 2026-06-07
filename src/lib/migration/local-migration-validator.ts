import type {
  LocalMigrationBundle,
  LocalMigrationDomainBundle,
  LocalMigrationValidationResult
} from "@/types/local-to-prisma-migration";

const MAX_RECORDS_WARNING = 5000;

function recordId(record: unknown) {
  if (typeof record !== "object" || record === null) return undefined;
  const value = (record as { id?: unknown }).id;
  return typeof value === "string" && value.trim() ? value : undefined;
}

function recordField(record: unknown, field: string) {
  if (typeof record !== "object" || record === null) return undefined;
  const value = (record as Record<string, unknown>)[field];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function duplicateIds(records: unknown[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  records.forEach((record) => {
    const id = recordId(record);
    if (!id) return;
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  });

  return [...duplicates];
}

function idsFor(bundle: LocalMigrationBundle, domainName: string) {
  return new Set(
    bundle.domains
      .find((domain) => domain.domain === domainName)
      ?.records
      .map(recordId)
      .filter((id): id is string => Boolean(id)) ?? []
  );
}

function domainReferenceWarnings(domain: LocalMigrationDomainBundle, bundle?: LocalMigrationBundle) {
  if (!bundle) return [];

  const warnings: string[] = [];
  const kpiIds = idsFor(bundle, "local_kpis");
  const datasetIds = idsFor(bundle, "atlas_datasets");
  const groupByAnalysisIds = idsFor(bundle, "dataset_groupby_analyses");
  const preparedSourceIds = idsFor(bundle, "prepared_sql_sources");

  if (domain.domain === "local_kpi_results" || domain.domain === "local_kpi_history") {
    domain.records.forEach((record) => {
      const kpiId = recordField(record, "kpiId");
      if (kpiId && !kpiIds.has(kpiId)) warnings.push(`Reference KPI absente : ${domain.domain} -> ${kpiId}.`);
    });
  }

  if (domain.domain === "local_alert_rules") {
    domain.records.forEach((record) => {
      const kpiId = recordField(record, "kpiId");
      if (kpiId && !kpiIds.has(kpiId)) warnings.push(`Regle d'alerte liee a un KPI absent : ${kpiId}.`);
    });
  }

  if (domain.domain === "atlas_datasets") {
    domain.records.forEach((record) => {
      const sourceId = recordField(record, "sourceId");
      if (sourceId && !preparedSourceIds.has(sourceId)) warnings.push(`Dataset lie a une source preparee absente : ${sourceId}.`);
    });
  }

  if (domain.domain === "dataset_groupby_analyses") {
    domain.records.forEach((record) => {
      const datasetId = recordField(record, "datasetId");
      if (datasetId && !datasetIds.has(datasetId)) warnings.push(`Analyse GroupBy liee a un dataset absent : ${datasetId}.`);
    });
  }

  if (domain.domain === "dataset_groupby_insights") {
    domain.records.forEach((record) => {
      const datasetId = recordField(record, "datasetId");
      const analysisId = recordField(record, "groupByAnalysisId");
      if (datasetId && !datasetIds.has(datasetId)) warnings.push(`Insight GroupBy lie a un dataset absent : ${datasetId}.`);
      if (analysisId && !groupByAnalysisIds.has(analysisId)) warnings.push(`Insight GroupBy lie a une analyse absente : ${analysisId}.`);
    });
  }

  return warnings;
}

export function validateMigrationDomain(
  domain: LocalMigrationDomainBundle,
  bundle?: LocalMigrationBundle
): LocalMigrationValidationResult["domainResults"][number] {
  const warnings = [...domain.warnings];
  const errors = [...domain.errors];
  const duplicates = duplicateIds(domain.records);

  if (domain.count === 0) warnings.push("Domaine vide.");
  if (domain.count > MAX_RECORDS_WARNING) warnings.push(`Volume eleve : ${domain.count} enregistrement(s).`);
  if (duplicates.length > 0) errors.push(`IDs dupliques : ${duplicates.slice(0, 10).join(", ")}.`);

  domain.records.forEach((record, index) => {
    if (!recordId(record)) errors.push(`ID manquant sur ${domain.domain}[${index}].`);
  });

  warnings.push(...domainReferenceWarnings(domain, bundle));

  if (domain.domain === "sql_connections_redacted" && domain.count > 0) {
    const leakedSecret = domain.records.some((record) => {
      const password = typeof record === "object" && record !== null
        ? (record as { password?: unknown }).password
        : undefined;
      return typeof password === "string" && password !== "[REDACTED]";
    });

    if (leakedSecret) errors.push("Une connexion SQL contient encore un mot de passe non masque.");
  }

  return {
    domain: domain.domain,
    valid: errors.length === 0,
    count: domain.count,
    warnings: [...new Set(warnings)],
    errors
  };
}

export function validateLocalMigrationBundle(bundle: LocalMigrationBundle): LocalMigrationValidationResult {
  const warnings = [...bundle.warnings];
  const errors = [...bundle.errors];

  if (!bundle.id) errors.push("Bundle sans id.");
  if (bundle.source !== "localStorage") errors.push("Source de bundle inattendue.");
  if (bundle.domains.length === 0) errors.push("Aucun domaine exporte.");

  const domainResults = bundle.domains.map((domain) => validateMigrationDomain(domain, bundle));
  const totalRecords = bundle.domains.reduce((total, domain) => total + domain.count, 0);

  if (totalRecords === 0) warnings.push("Aucune donnee locale a migrer.");
  if (totalRecords > MAX_RECORDS_WARNING) warnings.push(`Bundle volumineux : ${totalRecords} enregistrement(s).`);

  return {
    valid: errors.length === 0 && domainResults.every((domain) => domain.valid),
    generatedAt: new Date().toISOString(),
    domainResults,
    warnings: [...new Set([...warnings, ...domainResults.flatMap((domain) => domain.warnings)])],
    errors: [...errors, ...domainResults.flatMap((domain) => domain.errors)]
  };
}
