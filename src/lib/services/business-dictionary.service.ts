import { getDataMode, isPrismaMode } from "@/lib/config/data-mode";
import {
  getBusinessDictionaryByOrganizationId,
  wasBusinessDictionaryFallbackUsed
} from "@/lib/repositories/business-dictionary.repository";
import type { BusinessDictionaryField } from "@/types/business-dictionary";
import type { ServiceResult } from "@/types/service-results";

export type BusinessDictionaryData = {
  organizationId: string;
  fields: BusinessDictionaryField[];
  source: "local" | "prisma" | "fallback";
};

export async function getBusinessDictionaryData(
  organizationId: string
): Promise<ServiceResult<BusinessDictionaryData>> {
  const fields = await getBusinessDictionaryByOrganizationId(organizationId);
  const fallbackUsed = wasBusinessDictionaryFallbackUsed();

  return {
    success: true,
    data: {
      organizationId,
      fields,
      source: isPrismaMode() ? (fallbackUsed ? "fallback" : "prisma") : "local"
    },
    sourceMode: getDataMode(),
    fallbackUsed,
    warning: fallbackUsed ? "Fallback local actif : Prisma indisponible pour le dictionnaire métier." : undefined
  };
}
