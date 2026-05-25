import { ModulePlaceholder } from "@/components/module-placeholder";
import { modulePlaceholders } from "@/lib/mock/module-placeholders";

export default function ExpensesPage() {
  return <ModulePlaceholder {...modulePlaceholders.expenses} />;
}
