import { getAtlasFieldById, getRequiredAtlasFields } from "@/lib/connectors/sql/atlas-field-catalog";
import type {
  SqlColumnMapping,
  SqlCreateMappingInput,
  SqlMappingBundle,
  SqlMappingSuggestion,
  SqlMappingValidationResult,
  SqlUpdateMappingInput
} from "@/lib/connectors/sql/sql-mapping-types";

function now() {
  return new Date().toISOString();
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "");
}

function buildTableMappingId(connectionId: string, tableName: string, schema?: string) {
  return `sql-map-${connectionId}-${schema ?? "default"}-${tableName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildColumnMappingId(tableMappingId: string, sourceColumn: string) {
  return `${tableMappingId}-${normalizeText(sourceColumn)}`;
}

const deterministicRules: Array<{
  field: string;
  patterns: RegExp[];
  reason: string;
  confidence: number;
}> = [
  {
    field: "date",
    patterns: [/^date$/, /date_/, /_date$/, /created_at/, /updated_at/, /realisation/, /periode/],
    reason: "Nom de colonne date ou horodatage.",
    confidence: 92
  },
  {
    field: "cost",
    patterns: [/^cout$/, /cout_/, /_cout/, /cost/, /charge/, /expense/, /depense/, /sous_traitance/],
    reason: "Nom de colonne associe a un cout ou une charge.",
    confidence: 90
  },
  {
    field: "amount",
    patterns: [/montant/, /amount/, /revenue/, /ca_/, /^ca$/, /price/, /prix/, /total/, /valeur/],
    reason: "Nom de colonne associe a un montant.",
    confidence: 86
  },
  {
    field: "client",
    patterns: [/client/, /customer/, /account/, /compte/],
    reason: "Nom de colonne associe au client.",
    confidence: 88
  },
  {
    field: "region",
    patterns: [/region/, /territoire/, /zone/],
    reason: "Nom de colonne associe a une region ou zone.",
    confidence: 84
  },
  {
    field: "agency",
    patterns: [/agence/, /agency/, /site/, /bureau/],
    reason: "Nom de colonne associe a une agence ou un site.",
    confidence: 82
  },
  {
    field: "project",
    patterns: [/projet/, /project/, /chantier/],
    reason: "Nom de colonne associe a un projet.",
    confidence: 82
  },
  {
    field: "mission",
    patterns: [/mission/, /job/, /work_order/, /ordre_travail/],
    reason: "Nom de colonne associe a une mission.",
    confidence: 82
  },
  {
    field: "intervention",
    patterns: [/intervention/, /ticket/, /operation/],
    reason: "Nom de colonne associe a une intervention.",
    confidence: 82
  },
  {
    field: "status",
    patterns: [/statut/, /status/, /etat/, /state/],
    reason: "Nom de colonne associe a un statut.",
    confidence: 80
  },
  {
    field: "quantity",
    patterns: [/quantite/, /quantity/, /^qty$/, /^nb_/, /^nombre/, /volume/],
    reason: "Nom de colonne associe a un volume ou une quantite.",
    confidence: 78
  },
  {
    field: "user",
    patterns: [/utilisateur/, /user/, /owner/, /responsable/, /commercial/],
    reason: "Nom de colonne associe a un utilisateur ou responsable.",
    confidence: 78
  },
  {
    field: "reference",
    patterns: [/reference/, /^ref$/, /^id$/, /code/, /numero/],
    reason: "Nom de colonne associe a une reference.",
    confidence: 74
  },
  {
    field: "product",
    patterns: [/produit/, /product/, /service/, /offre/],
    reason: "Nom de colonne associe a un produit ou service.",
    confidence: 76
  },
  {
    field: "category",
    patterns: [/categorie/, /category/, /^type$/, /famille/],
    reason: "Nom de colonne associe a une categorie.",
    confidence: 74
  },
  {
    field: "company",
    patterns: [/entreprise/, /company/, /organization/, /organisation/, /societe/],
    reason: "Nom de colonne associe a une entreprise.",
    confidence: 74
  }
];

export function suggestSqlMappings(columns: Array<{ name: string; dataType: string }>): SqlMappingSuggestion[] {
  return columns.map((column) => {
    const normalizedName = normalizeText(column.name);
    const rule = deterministicRules.find((item) => item.patterns.some((pattern) => pattern.test(normalizedName)));

    if (!rule) {
      return {
        sourceColumn: column.name,
        sourceType: column.dataType,
        confidence: 0,
        reason: "Aucune regle deterministe ne correspond au nom de colonne."
      };
    }

    return {
      sourceColumn: column.name,
      sourceType: column.dataType,
      suggestedField: rule.field,
      confidence: rule.confidence,
      reason: rule.reason
    };
  });
}

export function createMapping(input: SqlCreateMappingInput): SqlMappingBundle {
  const timestamp = now();
  const tableMappingId = buildTableMappingId(input.connectionId, input.table.name, input.table.schema);
  const suggestionsByColumn = new Map(suggestSqlMappings(input.table.columns).map((suggestion) => [suggestion.sourceColumn, suggestion]));

  return {
    tableMapping: {
      id: tableMappingId,
      connectionId: input.connectionId,
      tableName: input.table.name,
      schema: input.table.schema,
      description: input.description ?? `Mapping SQL pour ${input.table.schema ? `${input.table.schema}.` : ""}${input.table.name}`,
      createdAt: timestamp,
      updatedAt: timestamp,
      persisted: false
    },
    columnMappings: input.table.columns.map((column) => {
      const suggestion = suggestionsByColumn.get(column.name);
      const field = getAtlasFieldById(suggestion?.suggestedField);

      return {
        id: buildColumnMappingId(tableMappingId, column.name),
        tableMappingId,
        sourceColumn: column.name,
        sourceType: column.dataType,
        targetField: suggestion?.suggestedField,
        required: Boolean(field?.required),
        enabled: Boolean(suggestion?.suggestedField)
      };
    })
  };
}

export function updateMapping(input: SqlUpdateMappingInput): SqlMappingBundle {
  return {
    tableMapping: {
      ...input.mapping.tableMapping,
      updatedAt: now()
    },
    columnMappings: input.mapping.columnMappings.map((column) =>
      column.sourceColumn === input.sourceColumn
        ? {
            ...column,
            targetField: input.targetField,
            enabled: input.enabled ?? column.enabled,
            required: input.required ?? column.required
          }
        : column
    )
  };
}

export function getMappedColumns(mapping: SqlMappingBundle) {
  return mapping.columnMappings.filter((column) => column.enabled && Boolean(column.targetField));
}

export function validateMapping(mapping: SqlMappingBundle): SqlMappingValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const enabledColumns = mapping.columnMappings.filter((column) => column.enabled);
  const mappedColumns = getMappedColumns(mapping);
  const unmappedColumns = enabledColumns.filter((column) => !column.targetField);
  const mappedTargetFields = mappedColumns.map((column) => column.targetField).filter((field): field is string => Boolean(field));
  const duplicateTargetFields = mappedTargetFields.filter((field, index) => mappedTargetFields.indexOf(field) !== index);
  const uniqueDuplicateTargetFields = [...new Set(duplicateTargetFields)];
  const missingRequiredFields = getRequiredAtlasFields()
    .filter((field) => !mappedTargetFields.includes(field.id))
    .map((field) => field.label);

  unmappedColumns.forEach((column) => warnings.push(`Colonne active non mappee : ${column.sourceColumn}.`));
  mapping.columnMappings
    .filter((column) => !column.enabled)
    .forEach((column) => warnings.push(`Colonne ignoree : ${column.sourceColumn}.`));

  uniqueDuplicateTargetFields.forEach((fieldId) => {
    const field = getAtlasFieldById(fieldId);
    errors.push(`Champ Atlas mappe plusieurs fois : ${field?.label ?? fieldId}.`);
  });

  missingRequiredFields.forEach((field) => errors.push(`Champ obligatoire manquant : ${field}.`));

  const qualityScore = Math.max(
    0,
    Math.min(
      100,
      100 -
        warnings.length * 4 -
        uniqueDuplicateTargetFields.length * 15 -
        missingRequiredFields.length * 20 -
        Math.max(0, mapping.columnMappings.length - mappedColumns.length) * 2
    )
  );

  return {
    valid: errors.length === 0,
    qualityScore,
    mappedColumnCount: mappedColumns.length,
    unmappedColumnCount: mapping.columnMappings.length - mappedColumns.length,
    duplicateTargetFields: uniqueDuplicateTargetFields,
    missingRequiredFields,
    warnings,
    errors
  };
}
