import { ModulePlaceholder } from "@/components/module-placeholder";
import { modulePlaceholders } from "@/lib/mock/module-placeholders";

export default function QuotesPage() {
  return <ModulePlaceholder {...modulePlaceholders.quotes} />;
}
