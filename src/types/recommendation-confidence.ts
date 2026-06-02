export type ConfidenceLevel = "low" | "medium" | "high" | "very_high";

export type ConfidenceFactor = {
  label: string;
  value: number;
  weight: number;
  explanation: string;
};

export type RecommendationConfidence = {
  recommendationId: string;
  score: number;
  level: ConfidenceLevel;
  factors: ConfidenceFactor[];
  warnings: string[];
  calculatedAt: string;
};
