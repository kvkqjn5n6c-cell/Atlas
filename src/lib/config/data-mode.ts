export type DataMode = "mock" | "prisma";

export function getDataMode(): DataMode {
  return process.env.DATA_MODE === "prisma" ? "prisma" : "mock";
}

export function isPrismaMode() {
  return getDataMode() === "prisma";
}

export function isMockMode() {
  return getDataMode() === "mock";
}
