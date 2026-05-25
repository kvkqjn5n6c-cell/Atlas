import { getDataMode } from "@/lib/config/data-mode";
import {
  validateColumnMappingDraft,
  validateDataSourceDraft,
  validateKpiConfigurationDraft,
  validateUserInvitationDraft
} from "@/lib/validation/admin-validation";
import type {
  ActionResult,
  ColumnMappingDraft,
  DataSourceDraft,
  KPIConfigurationDraft,
  UserInvitationDraft
} from "@/types/atlas";

function simulated<T>(message: string, data: T): ActionResult<T> {
  return {
    success: true,
    message,
    data,
    mode: getDataMode(),
    persisted: false
  };
}

export async function createDataSourceAction(input: DataSourceDraft): Promise<ActionResult<DataSourceDraft>> {
  const validation = validateDataSourceDraft(input);
  if (!validation.success) return validation;
  // TODO Prisma: create DataSource, then enqueue a read-only import test.
  return simulated("Source créée en simulation. Prochaines étapes : mapping, import test, configuration KPI.", input);
}

export async function saveKpiConfigurationAction(
  input: KPIConfigurationDraft
): Promise<ActionResult<KPIConfigurationDraft>> {
  const validation = validateKpiConfigurationDraft(input);
  if (!validation.success) return validation;
  // TODO Prisma: upsert KPIConfiguration and schedule recalculation.
  return simulated("KPI enregistre en simulation. La configuration n'est pas persistee.", input);
}

export async function validateColumnMappingAction(
  input: ColumnMappingDraft
): Promise<ActionResult<ColumnMappingDraft>> {
  const validation = validateColumnMappingDraft(input);
  if (!validation.success) return validation;
  // TODO Prisma: persist ColumnMapping status and quality score.
  return simulated("Mapping mis a jour localement. La correction n'est pas persistee.", input);
}

export async function inviteUserAction(
  input: UserInvitationDraft
): Promise<ActionResult<UserInvitationDraft>> {
  const validation = validateUserInvitationDraft(input);
  if (!validation.success) return validation;
  // TODO Prisma: create invited User/OrganizationUser and later send email.
  return simulated("Invitation simulée. Aucun email réel n'a été envoyé.", input);
}
