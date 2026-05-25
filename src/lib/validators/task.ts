import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  clientId: z.string().optional(),
  invoiceId: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.coerce.date().optional()
});

export type TaskFormValues = z.infer<typeof taskSchema>;
