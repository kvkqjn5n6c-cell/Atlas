import { getDataMode, isPrismaMode } from "@/lib/config/data-mode";
import { activePeriod } from "@/lib/context/scope-defaults";
import { getMappingsForSource } from "@/lib/data-pipeline/mapping-engine";
import { calculateNormalizationCoverage, normalizePreviewRows } from "@/lib/data-pipeline/normalization";
import { parseImportPreview } from "@/lib/data-pipeline/import-parser";
import {
  getDataSourceById,
  getDataSources,
  getImportJobsByDataSource,
  getImportJobsByOrganization,
  wasDataSourcesFallbackUsed
} from "@/lib/repositories/data-sources.repository";
import { getOrganizationByIdMock } from "@/lib/repositories/organizations.repository";
import type { ColumnMapping, DataImportJob, DataPreviewRow, DataSource, Organization } from "@/types/atlas";
import type { ServiceResult } from "@/types/service-results";

export type DataSourcesData = {
  sources: DataSource[];
  imports: DataImportJob[];
  activePeriod: string;
};

export type DataSourceDetailData = {
  source: DataSource;
  organization?: Organization;
  job?: DataImportJob;
  jobs: DataImportJob[];
  mappings: ColumnMapping[];
  previewRows: DataPreviewRow[];
  normalizationCoverage: number;
};

function warning() {
  return isPrismaMode() ? "Fallback mock automatique si Prisma n'est pas disponible." : undefined;
}

export async function getDataSourcesData(): Promise<ServiceResult<DataSourcesData>> {
  const sources = await getDataSources();
  const imports = sources.flatMap((source) => getImportJobsByOrganization(source.organizationId));

  return {
    success: true,
    data: {
      sources,
      imports,
      activePeriod
    },
    sourceMode: getDataMode(),
    fallbackUsed: wasDataSourcesFallbackUsed(),
    warning: warning()
  };
}

export async function getDataSourceDetailData(
  id: string
): Promise<ServiceResult<DataSourceDetailData | null>> {
  const source = await getDataSourceById(id);

  if (!source) {
    return {
      success: false,
      data: null,
      sourceMode: getDataMode(),
      fallbackUsed: false,
      warning: "Source de données introuvable."
    };
  }

  const jobs = getImportJobsByDataSource(source.id);
  const job = jobs[0];
  const mappings = getMappingsForSource(source.id);
  const preview = parseImportPreview(source);
  const normalizedRecords = normalizePreviewRows(preview.rows, mappings, source.organizationId);

  return {
    success: true,
    data: {
      source,
      organization: getOrganizationByIdMock(source.organizationId),
      job,
      jobs,
      mappings,
      previewRows: preview.rows,
      normalizationCoverage: calculateNormalizationCoverage(normalizedRecords)
    },
    sourceMode: getDataMode(),
    fallbackUsed: wasDataSourcesFallbackUsed(),
    warning: warning()
  };
}
