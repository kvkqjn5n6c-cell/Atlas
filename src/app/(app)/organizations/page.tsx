import { OrganizationsPage as OrganizationsModulePage } from "@/components/organizations/organizations-page";
import { getOrganizationsData } from "@/lib/services/organizations.service";

export default async function OrganizationsPage() {
  const result = await getOrganizationsData();

  return <OrganizationsModulePage result={result} />;
}
