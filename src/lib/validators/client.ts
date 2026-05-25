import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(2, "Le nom du client est requis."),
  contactName: z.string().optional(),
  email: z.string().email("Email invalide.").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default("France"),
  notes: z.string().optional()
});

export type ClientFormValues = z.infer<typeof clientSchema>;
