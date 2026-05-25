import { DataSourcesPage } from "@/components/data-sources/data-sources-page";
import { getDataSourcesData } from "@/lib/services/data-sources.service";

export default async function DataSourcesRoutePage() {
  const result = await getDataSourcesData();

  return <DataSourcesPage result={result} />;
}
