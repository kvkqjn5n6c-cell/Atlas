export type DatasetPipelineNodeType =
  | "sql_connection"
  | "sql_mapping"
  | "prepared_source"
  | "dataset"
  | "dataset_kpi"
  | "groupby_analysis"
  | "groupby_insight"
  | "recommendation"
  | "priority"
  | "action_plan"
  | "decision_journal";

export type DatasetPipelineNodeStatus = "completed" | "available" | "missing" | "warning";

export type DatasetPipelineNode = {
  id: string;
  type: DatasetPipelineNodeType;
  title: string;
  description: string;
  status: DatasetPipelineNodeStatus;
  sourceId?: string;
  relatedIds: string[];
  createdAt?: string;
  warnings: string[];
};

export type DatasetPipelineEdge = {
  from: string;
  to: string;
  label: string;
};

export type DatasetPipelineView = {
  id: string;
  generatedAt: string;
  nodes: DatasetPipelineNode[];
  edges: DatasetPipelineEdge[];
  completionScore: number;
  missingSteps: string[];
  nextRecommendedStep?: string;
};
