import { isPrismaMode } from "@/lib/config/data-mode";
import { normalizeBusinessLabel } from "@/lib/local/business-dictionary-store";
import type { BusinessDictionaryField } from "@/types/business-dictionary";
import type { DetectedColumnType } from "@/types/data-import";

let lastFallbackUsed = false;

export function wasBusinessDictionaryFallbackUsed() {
  return lastFallbackUsed;
}

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

type BusinessDictionaryRecord = {
  id: string;
  organizationId: string;
  label: string;
  normalizedLabel: string;
  detectedType: string;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  sourceColumns: { sourceColumn: string }[];
  linkedKpis: { localKpiName: string | null }[];
  metadata: unknown;
};

function metadataArray(record: BusinessDictionaryRecord, key: "tags" | "examples") {
  if (!record.metadata || typeof record.metadata !== "object") return [];
  const value = (record.metadata as Record<string, unknown>)[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function toBusinessDictionaryField(record: BusinessDictionaryRecord): BusinessDictionaryField {
  return {
    id: record.id,
    organizationId: record.organizationId,
    label: record.label,
    normalizedLabel: record.normalizedLabel,
    sourceColumns: record.sourceColumns.map((column) => column.sourceColumn),
    detectedType: record.detectedType as DetectedColumnType,
    usageCount: record.usageCount,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    linkedKpis: record.linkedKpis.map((link) => link.localKpiName).filter((name): name is string => Boolean(name)),
    tags: metadataArray(record, "tags"),
    examples: metadataArray(record, "examples"),
    persisted: false
  };
}

export async function getBusinessDictionaryByOrganizationId(organizationId: string) {
  lastFallbackUsed = false;

  if (!isPrismaMode()) return [];

  try {
    const prisma = await getPrisma();
    const records = await prisma.businessDictionaryField.findMany({
      where: { organizationId },
      include: {
        sourceColumns: true,
        linkedKpis: true
      },
      orderBy: [{ usageCount: "desc" }, { label: "asc" }]
    });

    return records.map(toBusinessDictionaryField);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getBusinessDictionaryByOrganizationId failed, falling back to local/mock.", error);
    return [];
  }
}

export async function createBusinessDictionaryField(input: {
  organizationId: string;
  label: string;
  detectedType: DetectedColumnType;
  sourceColumn: string;
  tags?: string[];
  examples?: string[];
}) {
  lastFallbackUsed = false;

  if (!isPrismaMode()) return null;

  try {
    const prisma = await getPrisma();
    const normalizedLabel = normalizeBusinessLabel(input.label);
    const record = await prisma.businessDictionaryField.create({
      data: {
        organizationId: input.organizationId,
        label: input.label,
        normalizedLabel,
        detectedType: input.detectedType,
        usageCount: 1,
        persistedSource: "prisma",
        metadata: {
          tags: input.tags ?? [],
          examples: input.examples ?? []
        },
        sourceColumns: {
          create: {
            sourceColumn: input.sourceColumn,
            usageCount: 1
          }
        }
      },
      include: {
        sourceColumns: true,
        linkedKpis: true
      }
    });

    return toBusinessDictionaryField(record);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] createBusinessDictionaryField failed.", error);
    return null;
  }
}

export async function updateBusinessDictionaryField(field: BusinessDictionaryField) {
  lastFallbackUsed = false;

  if (!isPrismaMode()) return field;

  try {
    const prisma = await getPrisma();
    const record = await prisma.businessDictionaryField.update({
      where: { id: field.id },
      data: {
        label: field.label,
        normalizedLabel: normalizeBusinessLabel(field.label),
        detectedType: field.detectedType,
        usageCount: field.usageCount,
        metadata: {
          tags: field.tags ?? [],
          examples: field.examples ?? []
        }
      },
      include: {
        sourceColumns: true,
        linkedKpis: true
      }
    });

    return toBusinessDictionaryField(record);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] updateBusinessDictionaryField failed.", error);
    return field;
  }
}

export async function registerBusinessFieldUsage(input: {
  organizationId: string;
  label: string;
  sourceColumn: string;
  detectedType: DetectedColumnType;
  linkedKpi?: string;
  tags?: string[];
  examples?: string[];
}) {
  lastFallbackUsed = false;

  if (!isPrismaMode()) return null;

  try {
    const prisma = await getPrisma();
    const normalizedLabel = normalizeBusinessLabel(input.label);
    const field = await prisma.businessDictionaryField.upsert({
      where: {
        organizationId_normalizedLabel: {
          organizationId: input.organizationId,
          normalizedLabel
        }
      },
      create: {
        organizationId: input.organizationId,
        label: input.label,
        normalizedLabel,
        detectedType: input.detectedType,
        usageCount: 1,
        persistedSource: "prisma",
        metadata: {
          tags: input.tags ?? [],
          examples: input.examples ?? []
        }
      },
      update: {
        usageCount: { increment: 1 },
        detectedType: input.detectedType,
        metadata: {
          tags: input.tags ?? [],
          examples: input.examples ?? []
        }
      }
    });

    await prisma.businessDictionarySourceColumn.upsert({
      where: {
        fieldId_sourceColumn: {
          fieldId: field.id,
          sourceColumn: input.sourceColumn
        }
      },
      create: {
        fieldId: field.id,
        sourceColumn: input.sourceColumn,
        usageCount: 1
      },
      update: {
        usageCount: { increment: 1 }
      }
    });

    if (input.linkedKpi) {
      await linkKpiToBusinessField(field.id, input.linkedKpi);
    }

    const record = await prisma.businessDictionaryField.findUnique({
      where: { id: field.id },
      include: {
        sourceColumns: true,
        linkedKpis: true
      }
    });

    return record ? toBusinessDictionaryField(record) : null;
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] registerBusinessFieldUsage failed.", error);
    return null;
  }
}

export async function linkKpiToBusinessField(fieldId: string, localKpiName: string, kpiConfigurationId?: string) {
  if (!isPrismaMode()) return null;

  try {
    const prisma = await getPrisma();
    return await prisma.businessDictionaryLinkedKpi.create({
      data: {
        fieldId,
        localKpiName,
        kpiConfigurationId
      }
    });
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] linkKpiToBusinessField failed.", error);
    return null;
  }
}

export async function deleteBusinessDictionaryField(id: string) {
  lastFallbackUsed = false;

  if (!isPrismaMode()) return;

  try {
    const prisma = await getPrisma();
    await prisma.businessDictionaryField.delete({ where: { id } });
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] deleteBusinessDictionaryField failed.", error);
  }
}

export async function findMatchingBusinessField(organizationId: string, sourceColumn: string) {
  const fields = await getBusinessDictionaryByOrganizationId(organizationId);
  const { suggestBusinessDictionaryFieldFromFields } = await import("@/lib/data-pipeline/business-dictionary-suggestions");
  return suggestBusinessDictionaryFieldFromFields(fields, sourceColumn);
}
