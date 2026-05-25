import { CalendarClock, Mail, Phone, ReceiptText, ScrollText, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ClientNextAction as ClientNextActionType } from "@/types/client";

const icons = {
  call: Phone,
  email: Mail,
  invoice: ReceiptText,
  quote: ScrollText,
  meeting: Users
};

export function ClientNextAction({ action }: { action?: ClientNextActionType }) {
  if (!action) {
    return <span className="text-sm text-slate-400">Aucune action planifiee</span>;
  }

  const Icon = icons[action.type];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-ink">
        <Icon className="h-4 w-4 text-brand-700" aria-hidden="true" />
        {action.label}
      </div>
      <Badge>
        <CalendarClock className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
        {action.dueDate}
      </Badge>
    </div>
  );
}
