export type DataMode = "mock" | "local" | "prisma";

export function getDataMode(): DataMode {
  if (process.env.DATA_MODE === "local") return "local";
  return process.env.DATA_MODE === "prisma" ? "prisma" : "mock";
}

export function isPrismaMode() {
  return getDataMode() === "prisma";
}

export function isMockMode() {
  const mode = getDataMode();
  return mode === "mock" || mode === "local";
}
