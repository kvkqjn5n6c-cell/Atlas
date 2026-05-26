import { BusinessDictionaryPage } from "@/components/business-dictionary/business-dictionary-page";
import { activeOrganizationId } from "@/lib/context/scope-defaults";
import { getBusinessDictionaryData } from "@/lib/services/business-dictionary.service";

export default async function BusinessDictionaryRoutePage() {
  const result = await getBusinessDictionaryData(activeOrganizationId);
  return <BusinessDictionaryPage result={result} />;
}
