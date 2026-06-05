export type DatasetFilterOperator =
  | "EQUALS"
  | "NOT_EQUALS"
  | "CONTAINS"
  | "STARTS_WITH"
  | "ENDS_WITH"
  | "GREATER_THAN"
  | "LESS_THAN"
  | "IS_EMPTY"
  | "IS_NOT_EMPTY";

export type DatasetFilter = {
  id: string;
  field: string;
  operator: DatasetFilterOperator;
  value?: string;
};

export type DatasetFilterSet = {
  id: string;
  name: string;
  datasetId?: string;
  filters: DatasetFilter[];
  createdAt: string;
};

export type DatasetFilterValidationResult = {
  valid: boolean;
  warnings: string[];
  errors: string[];
};

export type DatasetFilterSummary = {
  label: string;
  totalRows: number;
  filteredRows: number;
  percentage: number;
  warnings: string[];
};
