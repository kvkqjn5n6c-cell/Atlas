import { ModulePlaceholder } from "@/components/module-placeholder";
import { modulePlaceholders } from "@/lib/mock/module-placeholders";

export default function ExportsPage() {
  return <ModulePlaceholder {...modulePlaceholders.reports} title="Exports et rapports" />;
}
