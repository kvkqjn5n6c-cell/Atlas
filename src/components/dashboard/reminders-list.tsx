import type { DashboardReminder } from "@/types/business";

const priorityLabel = {
  LOW: "Basse",
  MEDIUM: "Moyenne",
  HIGH: "Haute"
};

export function RemindersList({ reminders }: { reminders: DashboardReminder[] }) {
  return (
    <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <h2 className="text-base font-semibold text-ink">Relances a traiter</h2>
      <div className="mt-4 space-y-3">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink">{reminder.title}</p>
                {reminder.clientName ? (
                  <p className="mt-1 text-xs text-slate-500">{reminder.clientName}</p>
                ) : null}
              </div>
              <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-600">
                {priorityLabel[reminder.priority]}
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500">Échéance : {reminder.dueDate}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
