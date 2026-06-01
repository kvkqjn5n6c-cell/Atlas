export type LocalDataSource = "localStorage" | "mock" | "prisma" | "fallback";

export type LocalDataResult<T> = {
  data: T;
  source: LocalDataSource;
  fallbackUsed: boolean;
  warnings: string[];
  lastUpdated: string;
};
