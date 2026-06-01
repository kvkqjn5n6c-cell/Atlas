export type LocalExecutiveSummary = {
  id: string;
  organizationId: string;
  generatedAt: string;
  globalSituation: string;
  mainRisks: string[];
  keyFindings: string[];
  recommendedActions: string[];
  dataReliabilityNotes: string[];
  memoryHighlights: string[];
  relatedKpiIds: string[];
  relatedAlertIds: string[];
  persisted: false;
};
