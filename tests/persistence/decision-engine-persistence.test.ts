import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDecisionJournalData, saveDecisionJournalEntryData } from "@/lib/services/decision-journal.service";
import { getLocalActionPlansData, saveLocalActionPlanData } from "@/lib/services/local-action-plans.service";
import {
  getRecommendationFeedbackData,
  saveRecommendationFeedbackData
} from "@/lib/services/recommendation-feedback.service";
import { getJournalEntries } from "@/lib/local/decision-journal-store";
import { getLocalActionPlans } from "@/lib/local/local-action-plans-store";
import { getRecommendationFeedback } from "@/lib/local/local-recommendation-feedback-store";
import type { DecisionJournalEntry } from "@/types/decision-journal";
import type { LocalActionPlan } from "@/types/local-action-plans";
import type { LocalRecommendationFeedback } from "@/types/local-recommendation-feedback";

const prismaMock = vi.hoisted(() => ({
  localActionPlan: {
    findMany: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn()
  },
  localRecommendationFeedback: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn()
  },
  decisionJournalEntry: {
    findMany: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn()
  }
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

function createLocalStorageMock() {
  const store = new Map<string, string>();

  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => store.clear())
  };
}

const organizationId = "org-atlas-demo";
const now = "2026-06-01T10:00:00.000Z";

function plan(overrides: Partial<LocalActionPlan> = {}): LocalActionPlan {
  return {
    id: "plan-1",
    organizationId,
    title: "Plan réduction sous-traitance",
    description: "Plan local créé depuis une recommandation.",
    sourceRecommendationId: "recommendation-1",
    relatedKpiIds: ["kpi-1"],
    relatedInsightIds: [],
    priority: "high",
    status: "todo",
    owner: "Direction opérations",
    expectedImpact: "Réduire les coûts.",
    actions: [{ id: "task-1", label: "Analyser les coûts", status: "todo" }],
    createdAt: now,
    updatedAt: now,
    persisted: false,
    ...overrides
  };
}

function feedback(overrides: Partial<LocalRecommendationFeedback> = {}): LocalRecommendationFeedback {
  return {
    id: "feedback-1",
    recommendationId: "recommendation-1",
    relevance: "relevant",
    actionTaken: "planned",
    impactObserved: "unknown",
    createdAt: now,
    updatedAt: now,
    persisted: false,
    ...overrides
  };
}

function journalEntry(overrides: Partial<DecisionJournalEntry> = {}): DecisionJournalEntry {
  return {
    id: "journal-1",
    createdAt: now,
    type: "action_plan_created",
    title: "Plan d'action créé",
    description: "Plan local créé depuis une recommandation Atlas.",
    sourceType: "action_plan",
    sourceId: "plan-1",
    priority: "high",
    status: "todo",
    relatedKpiIds: ["kpi-1"],
    relatedRecommendationIds: ["recommendation-1"],
    relatedActionPlanIds: ["plan-1"],
    relatedMemoryReferences: [],
    metadata: {},
    ...overrides
  };
}

function prismaPlanRecord(input: LocalActionPlan) {
  return {
    ...input,
    sourceRecommendationId: input.sourceRecommendationId ?? null,
    sourceAlertId: input.sourceAlertId ?? null,
    dueDate: input.dueDate ?? null,
    createdAt: new Date(input.createdAt),
    updatedAt: new Date(input.updatedAt)
  };
}

function prismaFeedbackRecord(input: LocalRecommendationFeedback) {
  return {
    ...input,
    comment: input.comment ?? null,
    linkedActionPlanId: input.linkedActionPlanId ?? null,
    createdAt: new Date(input.createdAt),
    updatedAt: new Date(input.updatedAt)
  };
}

function prismaJournalRecord(input: DecisionJournalEntry) {
  return {
    ...input,
    priority: input.priority ?? null,
    status: input.status ?? null,
    confidenceScore: input.confidenceScore ?? null,
    createdAt: new Date(input.createdAt),
    updatedAt: new Date(input.createdAt)
  };
}

beforeEach(() => {
  process.env.DATA_MODE = "local";
  process.env.PRIMARY_SOURCE = "local";
  vi.clearAllMocks();
  vi.stubGlobal("window", { localStorage: createLocalStorageMock() });
});

describe("decision engine persistence v1", () => {
  it("sauvegarde un plan en mode local", async () => {
    const result = await saveLocalActionPlanData(plan());

    expect(result.source).toBe("local");
    expect(getLocalActionPlans()).toHaveLength(1);
    expect(getLocalActionPlans()[0].title).toBe("Plan réduction sous-traitance");
  });

  it("sauvegarde un feedback en mode prisma simule", async () => {
    process.env.DATA_MODE = "prisma";
    prismaMock.localRecommendationFeedback.upsert.mockResolvedValueOnce(prismaFeedbackRecord(feedback()));

    const result = await saveRecommendationFeedbackData(feedback(), organizationId);

    expect(result.source).toBe("prisma");
    expect(prismaMock.localRecommendationFeedback.upsert).toHaveBeenCalledOnce();
    expect(result.data.recommendationId).toBe("recommendation-1");
  });

  it("retombe en local si Prisma echoue pour un plan", async () => {
    process.env.DATA_MODE = "prisma";
    prismaMock.localActionPlan.upsert.mockRejectedValueOnce(new Error("DB unavailable"));

    const result = await saveLocalActionPlanData(plan());

    expect(result.source).toBe("fallback");
    expect(getLocalActionPlans()).toHaveLength(1);
  });

  it("ecrit une entree de journal en mode local", async () => {
    const result = await saveDecisionJournalEntryData(journalEntry(), organizationId);

    expect(result.source).toBe("local");
    expect(getJournalEntries()).toHaveLength(1);
    expect(getJournalEntries()[0].type).toBe("action_plan_created");
  });

  it("sauvegarde une entree de journal en mode prisma simule", async () => {
    process.env.DATA_MODE = "prisma";
    prismaMock.decisionJournalEntry.upsert.mockResolvedValueOnce(prismaJournalRecord(journalEntry()));

    const result = await saveDecisionJournalEntryData(journalEntry(), organizationId);

    expect(result.source).toBe("prisma");
    expect(prismaMock.decisionJournalEntry.upsert).toHaveBeenCalledOnce();
    expect(result.data.sourceId).toBe("plan-1");
  });

  it("sauvegarde un feedback en fallback local si Prisma echoue", async () => {
    process.env.DATA_MODE = "prisma";
    prismaMock.localRecommendationFeedback.upsert.mockRejectedValueOnce(new Error("DB unavailable"));

    const result = await saveRecommendationFeedbackData(feedback(), organizationId);

    expect(result.source).toBe("fallback");
    expect(getRecommendationFeedback()).toHaveLength(1);
  });

  it("lit le journal en mode local", async () => {
    await saveDecisionJournalEntryData(journalEntry(), organizationId);

    const result = await getDecisionJournalData(organizationId);

    expect(result.source).toBe("local");
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe("journal-1");
  });

  it("lit les plans en mode prisma simule", async () => {
    process.env.DATA_MODE = "prisma";
    prismaMock.localActionPlan.findMany.mockResolvedValueOnce([prismaPlanRecord(plan())]);

    const result = await getLocalActionPlansData(organizationId);

    expect(result.source).toBe("prisma");
    expect(prismaMock.localActionPlan.findMany).toHaveBeenCalledOnce();
    expect(result.data[0].id).toBe("plan-1");
  });

  it("lit les plans depuis Prisma quand PRIMARY_SOURCE=prisma meme si DATA_MODE=local", async () => {
    process.env.PRIMARY_SOURCE = "prisma";
    prismaMock.localActionPlan.findMany.mockResolvedValueOnce([prismaPlanRecord(plan({ id: "plan-prisma" }))]);

    const result = await getLocalActionPlansData(organizationId);

    expect(result.source).toBe("prisma");
    expect(prismaMock.localActionPlan.findMany).toHaveBeenCalledOnce();
    expect(result.data[0].id).toBe("plan-prisma");
  });

  it("lit le journal depuis Prisma quand PRIMARY_SOURCE=prisma", async () => {
    process.env.PRIMARY_SOURCE = "prisma";
    prismaMock.decisionJournalEntry.findMany.mockResolvedValueOnce([prismaJournalRecord(journalEntry({ id: "journal-prisma" }))]);

    const result = await getDecisionJournalData(organizationId);

    expect(result.source).toBe("prisma");
    expect(prismaMock.decisionJournalEntry.findMany).toHaveBeenCalledOnce();
    expect(result.data[0].id).toBe("journal-prisma");
  });

  it("lit le feedback depuis Prisma quand PRIMARY_SOURCE=prisma", async () => {
    process.env.PRIMARY_SOURCE = "prisma";
    prismaMock.localRecommendationFeedback.findMany.mockResolvedValueOnce([prismaFeedbackRecord(feedback({ id: "feedback-prisma" }))]);

    const result = await getRecommendationFeedbackData(organizationId);

    expect(result.source).toBe("prisma");
    expect(prismaMock.localRecommendationFeedback.findMany).toHaveBeenCalledOnce();
    expect(result.data[0].id).toBe("feedback-prisma");
  });

  it("retombe sur le plan local si PRIMARY_SOURCE=prisma et la lecture Prisma echoue", async () => {
    await saveLocalActionPlanData(plan({ id: "plan-local" }));
    process.env.PRIMARY_SOURCE = "prisma";
    prismaMock.localActionPlan.findMany.mockRejectedValueOnce(new Error("DB unavailable"));

    const result = await getLocalActionPlansData(organizationId);

    expect(result.source).toBe("fallback");
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe("plan-local");
  });

  it("retombe sur le feedback local si la lecture Prisma echoue", async () => {
    await saveRecommendationFeedbackData(feedback(), organizationId);
    process.env.DATA_MODE = "prisma";
    prismaMock.localRecommendationFeedback.findMany.mockRejectedValueOnce(new Error("DB unavailable"));

    const result = await getRecommendationFeedbackData(organizationId);

    expect(result.source).toBe("fallback");
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe("feedback-1");
  });
});
