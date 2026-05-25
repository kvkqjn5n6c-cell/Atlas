import type { DataMode } from "@/lib/config/data-mode";

export type ServiceResult<T> = {
  success: boolean;
  data: T;
  sourceMode: DataMode;
  fallbackUsed: boolean;
  warning?: string;
};
