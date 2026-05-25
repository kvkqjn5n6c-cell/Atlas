import { notFound } from "next/navigation";
import { DataSourceDetailPage } from "@/components/data-sources/data-source-detail-page";
import { getDataSourceDetailData } from "@/lib/services/data-sources.service";

export default async function DataSourceDetailRoutePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getDataSourceDetailData(id);

  if (!result.data) {
    notFound();
  }

  return <DataSourceDetailPage result={{ ...result, data: result.data }} />;
}
