import type {
  ActionPlanItem,
  Alert,
  AtlasField,
  DataImportStatus,
  DataSourceStatus,
  DataSourceUsage,
  KPIDataQuality,
  KPIStatus,
  Report,
  UserRole,
  UserStatus
} from "@/types/atlas";

export function formatKpiStatus(status: KPIStatus) {
  const labels: Record<KPIStatus, string> = {
    healthy: "Conforme",
    watch: "À surveiller",
    critical: "Critique"
  };

  return labels[status];
}

export function formatImportStatus(status: DataImportStatus) {
  const labels: Record<DataImportStatus, string> = {
    pending: "En attente",
    running: "En cours",
    completed: "Terminé",
    failed: "Échec",
    partial: "Partiel"
  };

  return labels[status];
}

export function formatMappingStatus(status: "to-review" | "mapped" | "unmapped" | "ignored") {
  const labels = {
    "to-review": "À vérifier",
    mapped: "Mappé",
    unmapped: "Non mappé",
    ignored: "Ignoré"
  };

  return labels[status];
}

export function formatAlertSeverity(severity: Alert["severity"]) {
  const labels: Record<Alert["severity"], string> = {
    info: "Information",
    warning: "À surveiller",
    critical: "Critique"
  };

  return labels[severity];
}

export function formatAlertUrgency(urgency: Alert["urgency"]) {
  const labels: Record<Alert["urgency"], string> = {
    immediate: "Immédiat",
    "this-week": "Cette semaine",
    monitoring: "Surveillance"
  };

  return labels[urgency];
}

export function formatAlertStatus(status: NonNullable<Alert["status"]>) {
  const labels: Record<NonNullable<Alert["status"]>, string> = {
    open: "Ouverte",
    "in-progress": "En cours",
    resolved: "Résolue"
  };

  return labels[status];
}

export function formatOrganizationStatus(status: "active" | "watch" | "inactive") {
  const labels = {
    active: "Actif",
    watch: "À surveiller",
    inactive: "Inactif"
  };

  return labels[status];
}

export function formatActionStatus(status: ActionPlanItem["status"]) {
  const labels: Record<ActionPlanItem["status"], string> = {
    todo: "À faire",
    "in-progress": "En cours",
    done: "Terminé"
  };

  return labels[status];
}

export function formatActionPriority(priority: ActionPlanItem["priority"]) {
  const labels: Record<ActionPlanItem["priority"], string> = {
    high: "Haute",
    medium: "Moyenne",
    low: "Basse"
  };

  return labels[priority];
}

export function formatReportStatus(status: Report["status"]) {
  const labels: Record<Report["status"], string> = {
    draft: "Brouillon",
    ready: "Prêt",
    sent: "Envoyé"
  };

  return labels[status];
}

export function formatDataQuality(quality: KPIDataQuality) {
  const labels: Record<KPIDataQuality, string> = {
    reliable: "Fiable",
    partial: "Partielle",
    outdated: "Obsolète",
    error: "En erreur"
  };

  return labels[quality];
}

export function formatDataSourceStatus(status: DataSourceStatus) {
  const labels: Record<DataSourceStatus, string> = {
    connected: "Connecté",
    "to-check": "À vérifier",
    error: "Erreur",
    inactive: "Inactif"
  };

  return labels[status];
}

export function formatDataSourceUsage(usage: DataSourceUsage) {
  const labels: Record<DataSourceUsage, string> = {
    CA: "CA",
    marge: "Marge",
    activite: "Activité",
    tresorerie: "Trésorerie",
    interventions: "Interventions",
    qualite: "Qualité"
  };

  return labels[usage];
}

export function formatAtlasField(field: AtlasField) {
  const labels: Record<AtlasField, string> = {
    Date: "Date",
    ChiffreAffaires: "Chiffre d'affaires",
    Marge: "Marge",
    Region: "Région",
    StatutMission: "Statut mission",
    Client: "Client",
    Tresorerie: "Trésorerie",
    Intervention: "Intervention",
    Qualite: "Qualité",
    NonMappe: "Non mappé"
  };

  return labels[field];
}

export function formatUserStatus(status: UserStatus) {
  const labels: Record<UserStatus, string> = {
    active: "Actif",
    invited: "Invitation envoyée",
    inactive: "Inactif"
  };

  return labels[status];
}

export function formatUserRole(role: UserRole) {
  const labels: Record<UserRole, string> = {
    SUPER_ADMIN: "Super admin",
    CONSULTANT: "Consultant",
    CLIENT_ADMIN: "Admin client",
    CLIENT_USER: "Utilisateur client"
  };

  return labels[role];
}
