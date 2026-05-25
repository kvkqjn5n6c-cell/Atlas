import type {
  BankAccount,
  BankTransaction,
  BankProvider,
  IntegrationContext,
  IntegrationResult
} from "../../contracts";

export class MockBankProvider implements BankProvider {
  metadata = {
    id: "mock-bank",
    name: "Mock Bank",
    kind: "bank" as const,
    status: "ready" as const
  };

  async healthcheck(): Promise<IntegrationResult<{ reachable: boolean }>> {
    return { ok: true, data: { reachable: true } };
  }

  async listAccounts(context: IntegrationContext): Promise<IntegrationResult<BankAccount[]>> {
    return {
      ok: true,
      data: [
        {
          id: `${context.organizationId}:main-account`,
          label: "Compte courant principal",
          ibanLast4: "2048",
          currency: "EUR"
        }
      ]
    };
  }

  async listTransactions(
    _context: IntegrationContext,
    accountId: string,
    from: Date,
    to: Date
  ): Promise<IntegrationResult<BankTransaction[]>> {
    return {
      ok: true,
      data: [
        {
          id: `${accountId}:demo-transaction`,
          accountId,
          bookedAt: new Date(Math.max(from.getTime(), Date.now())).toISOString(),
          label: `Transactions mockees jusqu'au ${to.toISOString().slice(0, 10)}`,
          amountCents: 516000,
          counterparty: "Maison Lumen"
        }
      ]
    };
  }
}
