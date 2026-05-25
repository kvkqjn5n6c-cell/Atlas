import { notFound } from "next/navigation";
import { OrganizationDetailPage } from "@/components/organizations/organization-detail-page";
import { getOrganizationDetailData } from "@/lib/services/organizations.service";

export default async function OrganizationDetailRoutePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getOrganizationDetailData(id);

  if (!result.data) {
    notFound();
  }

  return <OrganizationDetailPage result={{ ...result, data: result.data }} />;
}
