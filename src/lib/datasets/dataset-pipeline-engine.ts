import type { PreparedSqlSourceBundle } from "@/lib/connectors/sql/sql-prepared-source-types";
import type { SqlConnectionConfig } from "@/lib/connectors/sql/sql-types";
import type { AtlasDataset } from "@/lib/datasets/atlas-dataset-types";
import type { DatasetGroupByInsight } from "@/lib/datasets/dataset-groupby-insight-types";
import type { DatasetGroupByAnalysis } from "@/lib/datasets/dataset-groupby-types";
import type { DatasetKpiDefinition } from "@/lib/datasets/dataset-kpi-types";
import type { SqlMappingBundle } from "@/lib/connectors/sql/sql-mapping-types";
import type { DecisionJournalEntry } from "@/types/decision-journal";
import type { DatasetPipelineEdge, DatasetPipelineNode, DatasetPipelineNodeStatus, DatasetPipelineNodeType, DatasetPipelineView } from "@/types/dataset-pipeline";
import type { LocalActionPlan } from "@/types/local-action-plans";
import type { LocalPriorityItem } from "@/types/local-priorities";
import type { LocalRecommendation } from "@/types/local-recommendations";

export type DatasetPipelineInput = {
  sqlConnections?: SqlConnectionConfig[];
  sqlMappings?: SqlMappingBundle[];
  preparedSources?: PreparedSqlSourceBundle[];
  datasets?: AtlasDataset[];
  datasetKpis?: DatasetKpiDefinition[];
  groupByAnalyses?: DatasetGroupByAnalysis[];
  groupByInsights?: DatasetGroupByInsight[];
  recommendations?: LocalRecommendation[];
  priorities?: LocalPriorityItem[];
  actionPlans?: LocalActionPlan[];
  decisionJournalEntries?: DecisionJournalEntry[];
};

const pipelineOrder: Array<{
  type: DatasetPipelineNodeType;
  title: string;
  emptyDescription: string;
  completedDescription: (count: number) => string;
  nextStep: string;
  linkLabel: string;
}> = [
  {
    type: "sql_connection",
    title: "Connexion SQL",
    emptyDescription: "Aucune connexion SQL locale n'est encore configuree.",
    completedDescription: (count) => `${count} connexion(s) SQL disponible(s) en lecture seule.`,
    nextStep: "Configurer une connexion SQL en lecture seule.",
    linkLabel: "/sql-connections"
  },
  {
    type: "sql_mapping",
    title: "Mapping SQL",
    emptyDescription: "Aucune table SQL n'est mappee vers les champs Atlas.",
    completedDescription: (count) => `${count} mapping(s) SQL traduisent les colonnes en champs Atlas.`,
    nextStep: "Mapper une table SQL vers les champs Atlas.",
    linkLabel: "/sql-mappings"
  },
  {
    type: "prepared_source",
    title: "Source preparee",
    emptyDescription: "Aucune source SQL preparee n'est disponible pour le pipeline.",
    completedDescription: (count) => `${count} source(s) SQL preparee(s) sont pretes pour un Dataset Atlas.`,
    nextStep: "Preparer une source SQL depuis un mapping valide.",
    linkLabel: "/data-sources"
  },
  {
    type: "dataset",
    title: "Dataset Atlas",
    emptyDescription: "Aucun Dataset Atlas n'a ete genere depuis une source preparee.",
    completedDescription: (count) => `${count} Dataset(s) Atlas normalisent les donnees externes.`,
    nextStep: "Generer un Dataset Atlas depuis une source preparee.",
    linkLabel: "/data-sources"
  },
  {
    type: "dataset_kpi",
    title: "KPI Dataset",
    emptyDescription: "Aucun KPI local n'a encore ete cree depuis un Dataset.",
    completedDescription: (count) => `${count} KPI Dataset alimentent les moteurs Atlas.`,
    nextStep: "Creer un KPI local depuis un Dataset Atlas.",
    linkLabel: "/datasets"
  },
  {
    type: "groupby_analysis",
    title: "Analyse Group By",
    emptyDescription: "Aucune analyse comparative Group By n'est sauvegardee.",
    completedDescription: (count) => `${count} analyse(s) comparative(s) segmentent les donnees par groupe metier.`,
    nextStep: "Sauvegarder une analyse comparative Group By.",
    linkLabel: "/datasets"
  },
  {
    type: "groupby_insight",
    title: "Insight comparatif",
    emptyDescription: "Aucun insight comparatif n'est encore detecte.",
    completedDescription: (count) => `${count} insight(s) comparatif(s) interpretent les ecarts.`,
    nextStep: "Generer des insights depuis une analyse comparative.",
    linkLabel: "/datasets"
  },
  {
    type: "recommendation",
    title: "Recommandation",
    emptyDescription: "Aucune recommandation issue Dataset n'est disponible.",
    completedDescription: (count) => `${count} recommandation(s) Dataset transforment les signaux en actions.`,
    nextStep: "Consulter les recommandations issues des insights Dataset.",
    linkLabel: "/pilotage"
  },
  {
    type: "priority",
    title: "Priorite",
    emptyDescription: "Aucune priorite issue Dataset n'est consolidee.",
    completedDescription: (count) => `${count} priorite(s) Dataset aident a ordonner les sujets.`,
    nextStep: "Consulter les priorites Atlas issues Dataset.",
    linkLabel: "/priorities"
  },
  {
    type: "action_plan",
    title: "Plan d'action",
    emptyDescription: "Aucun plan d'action Dataset n'est engage.",
    completedDescription: (count) => `${count} plan(s) d'action Dataset pilotent l'execution.`,
    nextStep: "Creer un plan d'action depuis une recommandation Dataset.",
    linkLabel: "/pilotage"
  },
  {
    type: "decision_journal",
    title: "Journal decisionnel",
    emptyDescription: "Aucun evenement Dataset n'est encore trace dans le journal.",
    completedDescription: (count) => `${count} evenement(s) Dataset rendent la chaine tracable.`,
    nextStep: "Tracer les evenements Dataset dans le journal decisionnel.",
    linkLabel: "/decision-journal"
  }
];

const pipelineEdges: DatasetPipelineEdge[] = [
  { from: "sql_connection", to: "sql_mapping", label: "selection table" },
  { from: "sql_mapping", to: "prepared_source", label: "mapping valide" },
  { from: "prepared_source", to: "dataset", label: "preview normalisee" },
  { from: "dataset", to: "dataset_kpi", label: "agregation" },
  { from: "dataset", to: "groupby_analysis", label: "comparaison" },
  { from: "groupby_analysis", to: "groupby_insight", label: "interpretation" },
  { from: "groupby_insight", to: "recommendation", label: "action proposee" },
  { from: "recommendation", to: "priority", label: "priorisation" },
  { from: "recommendation", to: "action_plan", label: "passage a l'action" },
  { from: "action_plan", to: "decision_journal", label: "tracabilite" }
];

function ids<T>(items: T[], getId: (item: T) => string | undefined) {
  return items.map(getId).filter((id): id is string => Boolean(id));
}

function latestDate(values: Array<string | undefined>) {
  return values.filter((value): value is string => Boolean(value)).sort().at(-1);
}

function nodeStatus(count: number, warnings: string[], previousCompleted: boolean): DatasetPipelineNodeStatus {
  if (count > 0 && warnings.length > 0) return "warning";
  if (count > 0) return "completed";
  return previousCompleted ? "available" : "missing";
}

function pipelineCollections(input: DatasetPipelineInput) {
  const sqlConnections = input.sqlConnections ?? [];
  const sqlMappings = input.sqlMappings ?? [];
  const preparedSources = input.preparedSources ?? [];
  const datasets = input.datasets ?? [];
  const datasetKpis = input.datasetKpis ?? [];
  const groupByAnalyses = input.groupByAnalyses ?? [];
  const groupByInsights = input.groupByInsights ?? [];
  const recommendations = (input.recommendations ?? []).filter((recommendation) => recommendation.sourceType === "dataset_groupby_insight");
  const priorities = (input.priorities ?? []).filter((priority) => priority.sourceTypes.includes("dataset_groupby_insight"));
  const actionPlans = (input.actionPlans ?? []).filter((plan) => plan.sourceType === "dataset_groupby_insight");
  const decisionJournalEntries = (input.decisionJournalEntries ?? []).filter((entry) =>
    entry.type === "dataset_generated" ||
    entry.type === "dataset_kpi_created" ||
    entry.type === "dataset_analysis" ||
    entry.type === "groupby_insight" ||
    entry.type === "dataset_action_plan_created"
  );

  return {
    sql_connection: sqlConnections,
    sql_mapping: sqlMappings,
    prepared_source: preparedSources,
    dataset: datasets,
    dataset_kpi: datasetKpis,
    groupby_analysis: groupByAnalyses,
    groupby_insight: groupByInsights,
    recommendation: recommendations,
    priority: priorities,
    action_plan: actionPlans,
    decision_journal: decisionJournalEntries
  };
}

function nodeWarnings(type: DatasetPipelineNodeType, input: DatasetPipelineInput): string[] {
  if (type === "sql_mapping") {
    return (input.sqlMappings ?? [])
      .filter((mapping) => mapping.columnMappings.every((column) => !column.enabled || !column.targetField))
      .map((mapping) => `Mapping ${mapping.tableMapping.tableName} sans champ Atlas actif.`);
  }
  if (type === "prepared_source") {
    return (input.preparedSources ?? []).flatMap((bundle) => bundle.source.warnings);
  }
  if (type === "dataset") {
    return (input.datasets ?? []).flatMap((dataset) => dataset.warnings);
  }
  if (type === "groupby_analysis") {
    return (input.groupByAnalyses ?? []).flatMap((analysis) => analysis.warnings);
  }
  return [];
}

function relatedIds(type: DatasetPipelineNodeType, input: DatasetPipelineInput): string[] {
  const collections = pipelineCollections(input);
  const items = collections[type];

  if (type === "sql_connection") return ids(items as SqlConnectionConfig[], (item) => item.id ?? item.name);
  if (type === "sql_mapping") return ids(items as SqlMappingBundle[], (item) => item.tableMapping.id);
  if (type === "prepared_source") return ids(items as PreparedSqlSourceBundle[], (item) => item.source.id);
  if (type === "dataset") return ids(items as AtlasDataset[], (item) => item.id);
  if (type === "dataset_kpi") return ids(items as DatasetKpiDefinition[], (item) => item.id);
  if (type === "groupby_analysis") return ids(items as DatasetGroupByAnalysis[], (item) => item.id);
  if (type === "groupby_insight") return ids(items as DatasetGroupByInsight[], (item) => item.id);
  if (type === "recommendation") return ids(items as LocalRecommendation[], (item) => item.id);
  if (type === "priority") return ids(items as LocalPriorityItem[], (item) => item.id);
  if (type === "action_plan") return ids(items as LocalActionPlan[], (item) => item.id);
  return ids(items as DecisionJournalEntry[], (item) => item.id);
}

function createdAt(type: DatasetPipelineNodeType, input: DatasetPipelineInput) {
  if (type === "sql_connection") return latestDate((input.sqlConnections ?? []).map((item) => item.updatedAt ?? item.createdAt));
  if (type === "sql_mapping") return latestDate((input.sqlMappings ?? []).map((item) => item.tableMapping.updatedAt));
  if (type === "prepared_source") return latestDate((input.preparedSources ?? []).map((item) => item.source.updatedAt));
  if (type === "dataset") return latestDate((input.datasets ?? []).map((item) => item.createdAt));
  if (type === "dataset_kpi") return latestDate((input.datasetKpis ?? []).map((item) => item.createdAt));
  if (type === "groupby_analysis") return latestDate((input.groupByAnalyses ?? []).map((item) => item.generatedAt));
  if (type === "groupby_insight") return latestDate((input.groupByInsights ?? []).map((item) => item.createdAt));
  if (type === "recommendation") return latestDate((input.recommendations ?? []).map((item) => item.createdAt));
  if (type === "priority") return latestDate((input.priorities ?? []).map((item) => item.createdAt));
  if (type === "action_plan") return latestDate((input.actionPlans ?? []).map((item) => item.updatedAt ?? item.createdAt));
  return latestDate((input.decisionJournalEntries ?? []).map((item) => item.createdAt));
}

export function calculatePipelineCompletion(nodes: DatasetPipelineNode[]) {
  if (nodes.length === 0) return 0;
  const completed = nodes.filter((node) => node.status === "completed" || node.status === "warning").length;
  return Math.round((completed / nodes.length) * 100);
}

export function detectMissingPipelineSteps(nodes: DatasetPipelineNode[]) {
  return nodes
    .filter((node) => node.status === "missing" || node.status === "available")
    .map((node) => node.title);
}

export function getNextRecommendedPipelineStep(nodes: DatasetPipelineNode[]) {
  const nextNode = nodes.find((node) => node.status === "available" || node.status === "missing");
  const config = nextNode ? pipelineOrder.find((item) => item.type === nextNode.type) : undefined;
  return config?.nextStep;
}

export function summarizePipeline(view: DatasetPipelineView) {
  if (view.completionScore === 100) return "La chaine Dataset est complete : les donnees externes sont tracables jusqu'au plan d'action.";
  if (view.completionScore >= 60) return `Pipeline avance : ${view.completionScore}% de la chaine Dataset est en place.`;
  if (view.completionScore > 0) return `Pipeline initialise : ${view.completionScore}% de la chaine Dataset est disponible.`;
  return "Aucun pipeline Dataset local n'est encore initialise.";
}

export function buildDatasetPipelineView(input: DatasetPipelineInput): DatasetPipelineView {
  const collections = pipelineCollections(input);
  let previousCompleted = true;
  const nodes = pipelineOrder.map((config): DatasetPipelineNode => {
    const count = collections[config.type].length;
    const warnings = nodeWarnings(config.type, input);
    const status = nodeStatus(count, warnings, previousCompleted);
    const node: DatasetPipelineNode = {
      id: config.type,
      type: config.type,
      title: config.title,
      description: count > 0 ? config.completedDescription(count) : config.emptyDescription,
      status,
      sourceId: config.linkLabel,
      relatedIds: relatedIds(config.type, input),
      createdAt: createdAt(config.type, input),
      warnings
    };

    previousCompleted = previousCompleted && count > 0;
    return node;
  });

  const view: DatasetPipelineView = {
    id: "dataset-pipeline-local",
    generatedAt: new Date().toISOString(),
    nodes,
    edges: pipelineEdges,
    completionScore: calculatePipelineCompletion(nodes),
    missingSteps: detectMissingPipelineSteps(nodes),
    nextRecommendedStep: getNextRecommendedPipelineStep(nodes)
  };

  return view;
}
