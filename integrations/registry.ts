import type {
  AccountingProvider,
  BankProvider,
  ExternalApiProvider,
  MailProvider,
  PdpProvider
} from "./contracts";
import {
  MockAccountingProvider,
  MockBankProvider,
  MockExternalApiProvider,
  MockMailProvider,
  MockPdpProvider
} from "./providers/mock";

export type IntegrationRegistry = {
  pdp: PdpProvider;
  bank: BankProvider;
  accounting: AccountingProvider;
  mail: MailProvider;
  externalApi: ExternalApiProvider;
};

const defaultRegistry: IntegrationRegistry = {
  pdp: new MockPdpProvider(),
  bank: new MockBankProvider(),
  accounting: new MockAccountingProvider(),
  mail: new MockMailProvider(),
  externalApi: new MockExternalApiProvider()
};

export function getIntegrationRegistry(): IntegrationRegistry {
  return defaultRegistry;
}

export function getPdpProvider(): PdpProvider {
  return defaultRegistry.pdp;
}

export function getBankProvider(): BankProvider {
  return defaultRegistry.bank;
}

export function getAccountingProvider(): AccountingProvider {
  return defaultRegistry.accounting;
}

export function getMailProvider(): MailProvider {
  return defaultRegistry.mail;
}

export function getExternalApiProvider(): ExternalApiProvider {
  return defaultRegistry.externalApi;
}
