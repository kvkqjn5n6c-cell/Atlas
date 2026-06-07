export type DataMode = "mock" | "local" | "prisma";
export type PrimarySource = "local" | "prisma";
export type ReadStrategy = "LOCAL_ONLY" | "PRISMA_PREFERRED" | "PRISMA_ONLY";

export function getDataMode(): DataMode {
  if (process.env.DATA_MODE === "local") return "local";
  return process.env.DATA_MODE === "prisma" ? "prisma" : "mock";
}

export function getPrimarySource(): PrimarySource {
  return process.env.PRIMARY_SOURCE === "prisma" ? "prisma" : "local";
}

export function isPrismaMode() {
  return getDataMode() === "prisma";
}

export function isPrismaPrimarySource() {
  return getPrimarySource() === "prisma";
}

export function isDecisionDomainPrismaPreferred() {
  return isPrismaMode() || isPrismaPrimarySource();
}

export function getDecisionDomainReadStrategy(): ReadStrategy {
  return isDecisionDomainPrismaPreferred() ? "PRISMA_PREFERRED" : "LOCAL_ONLY";
}

export function isMockMode() {
  const mode = getDataMode();
  return mode === "mock" || mode === "local";
}
