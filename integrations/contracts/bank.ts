import type { IntegrationContext, IntegrationProvider, IntegrationResult } from "./common";

export type BankAccount = {
  id: string;
  label: string;
  ibanLast4?: string;
  currency: "EUR";
};

export type BankTransaction = {
  id: string;
  accountId: string;
  bookedAt: string;
  label: string;
  amountCents: number;
  counterparty?: string;
};

export interface BankProvider extends IntegrationProvider {
  listAccounts(context: IntegrationContext): Promise<IntegrationResult<BankAccount[]>>;

  listTransactions(
    context: IntegrationContext,
    accountId: string,
    from: Date,
    to: Date
  ): Promise<IntegrationResult<BankTransaction[]>>;
}
