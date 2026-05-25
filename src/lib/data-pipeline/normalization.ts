import type { ColumnMapping, DataPreviewRow, NormalizedRecord } from "@/types/atlas";

export function normalizePreviewRows(
  rows: DataPreviewRow[],
  mappings: ColumnMapping[],
  organizationId: string
): NormalizedRecord[] {
  const activeMappings = mappings.filter((mapping) => mapping.status === "mapped");

  return rows.map((row) => {
    const fields = activeMappings.reduce<NormalizedRecord["fields"]>((normalizedFields, mapping) => {
      const value = row.values[mapping.sourceColumn];

      if (value !== undefined) {
        normalizedFields[mapping.atlasField] = value;
      }

      return normalizedFields;
    }, {});

    const mappedValueCount = Object.keys(fields).length;
    const qualityScore =
      activeMappings.length > 0 ? Math.round((mappedValueCount / activeMappings.length) * 100) : 0;

    return {
      id: `normalized-${row.id}`,
      organizationId,
      dataSourceId: row.dataSourceId,
      fields,
      qualityScore
    };
  });
}

export function calculateNormalizationCoverage(records: NormalizedRecord[]) {
  if (records.length === 0) {
    return 0;
  }

  const totalQuality = records.reduce((total, record) => total + record.qualityScore, 0);
  return Math.round(totalQuality / records.length);
}

// TODO Phase 3: gerer les conversions typographiques, devises, dates et nomenclatures client.
