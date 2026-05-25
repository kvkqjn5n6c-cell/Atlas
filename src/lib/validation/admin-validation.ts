import type {
  ActionResult,
  ColumnMappingDraft,
  DataSourceDraft,
  KPIConfigurationDraft,
  UserInvitationDraft
} from "@/types/atlas";

export function validationResult<T>(errors: Record<string, string>, data?: T): ActionResult<T> {
  return {
    success: Object.keys(errors).length === 0,
    message: Object.keys(errors).length === 0 ? "Validation OK." : "Certains champs sont a corriger.",
    data,
    validationErrors: errors,
    mode: "mock",
    persisted: false
  };
}

export function validateDataSourceDraft(input: DataSourceDraft) {
  const errors: Record<string, string> = {};
  if (!input.name.trim()) errors.name = "Le nom de la source est obligatoire.";
  if (!input.organizationId) errors.organizationId = "L'organisation est obligatoire.";
  if (!input.type) errors.type = "Le type de source est obligatoire.";
  if (input.usage.length === 0) errors.usage = "Au moins un usage métier est requis.";
  return validationResult(errors, input);
}

export function validateKpiConfigurationDraft(input: KPIConfigurationDraft) {
  const errors: Record<string, string> = {};
  if (!input.name.trim()) errors.name = "Le nom du KPI est obligatoire.";
  if (!input.organizationId) errors.organizationId = "L'organisation est obligatoire.";
  if (!input.sourceId) errors.sourceId = "La source est obligatoire.";
  if (!input.calculationType) errors.calculationType = "Le type de calcul est obligatoire.";
  if (!Number.isFinite(input.targetValue)) errors.targetValue = "L'objectif doit etre numerique.";
  if (input.warningThreshold === input.criticalThreshold) {
    errors.warningThreshold = "Les seuils doivent etre distincts.";
  }
  if (!input.owner.trim()) errors.owner = "Le responsable métier est obligatoire.";
  return validationResult(errors, input);
}

export function validateColumnMappingDraft(input: ColumnMappingDraft) {
  const errors: Record<string, string> = {};
  if (!input.dataSourceId) errors.dataSourceId = "La source est obligatoire.";
  if (!input.sourceColumn.trim()) errors.sourceColumn = "La colonne source est obligatoire.";
  if (!input.atlasField) errors.atlasField = "Le champ Atlas est obligatoire.";
  return validationResult(errors, input);
}

export function validateUserInvitationDraft(input: UserInvitationDraft) {
  const errors: Record<string, string> = {};
  if (!input.name.trim()) errors.name = "Le nom est obligatoire.";
  if (!input.email.trim()) errors.email = "L'email est obligatoire.";
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.email = "L'email est invalide.";
  }
  if (!input.role) errors.role = "Le rôle est obligatoire.";
  if (!input.organizationId) errors.organizationId = "L'organisation est obligatoire.";
  return validationResult(errors, input);
}
