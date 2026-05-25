export type BusinessInvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export type BusinessPaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "FAILED" | "REFUNDED";

export type BusinessExpenseStatus = "PLANNED" | "COMMITTED" | "PAID" | "CANCELLED";

export type InvoiceForFinance = {
  id: string;
  issueDate: Date;
  dueDate: Date;
  status: BusinessInvoiceStatus;
  totalExcludingTax: number;
  totalIncludingTax: number;
};

export type PaymentForFinance = {
  invoiceId: string;
  amount: number;
  paidAt?: Date | null;
  status: BusinessPaymentStatus;
};

export type ExpenseForFinance = {
  id: string;
  dueDate?: Date | null;
  expenseDate: Date;
  paidAt?: Date | null;
  status: BusinessExpenseStatus;
  totalIncludingTax: number;
};

export type OverdueInvoice = InvoiceForFinance & {
  paidAmount: number;
  outstandingAmount: number;
  daysOverdue: number;
};

export type CashflowForecast = {
  asOf: Date;
  horizonDate: Date;
  startingCash: number;
  expectedReceipts: number;
  expectedExpenses: number;
  projectedCash: number;
};

export type BusinessHealthScoreInput = {
  invoicedRevenue: number;
  collectedRevenue: number;
  overdueAmount: number;
  outstandingReceivables: number;
  projectedCash: number;
};

const billableInvoiceStatuses: BusinessInvoiceStatus[] = [
  "SENT",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE"
];

const collectibleInvoiceStatuses: BusinessInvoiceStatus[] = ["SENT", "PARTIALLY_PAID", "OVERDUE"];

const collectedPaymentStatuses: BusinessPaymentStatus[] = ["PAID", "PARTIAL"];

function isOnOrBefore(date: Date, limit: Date) {
  return date.getTime() <= limit.getTime();
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function calculateInvoicedRevenue(invoices: InvoiceForFinance[]) {
  return sum(
    invoices
      .filter((invoice) => billableInvoiceStatuses.includes(invoice.status))
      .map((invoice) => invoice.totalExcludingTax)
  );
}

export function calculateCollectedRevenue(payments: PaymentForFinance[], asOf = new Date()) {
  return sum(
    payments
      .filter((payment) => collectedPaymentStatuses.includes(payment.status))
      .filter((payment) => payment.paidAt && isOnOrBefore(payment.paidAt, asOf))
      .map((payment) => payment.amount)
  );
}

export function calculatePaidAmountForInvoice(
  invoiceId: string,
  payments: PaymentForFinance[],
  asOf = new Date()
) {
  return calculateCollectedRevenue(
    payments.filter((payment) => payment.invoiceId === invoiceId),
    asOf
  );
}

export function calculateOverdueInvoices(
  invoices: InvoiceForFinance[],
  payments: PaymentForFinance[],
  asOf = new Date()
): OverdueInvoice[] {
  return invoices
    .filter((invoice) => collectibleInvoiceStatuses.includes(invoice.status))
    .filter((invoice) => invoice.dueDate.getTime() < asOf.getTime())
    .map((invoice) => {
      const paidAmount = calculatePaidAmountForInvoice(invoice.id, payments, asOf);
      const outstandingAmount = Math.max(invoice.totalIncludingTax - paidAmount, 0);
      const daysOverdue = Math.floor(
        (asOf.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        ...invoice,
        paidAmount,
        outstandingAmount,
        daysOverdue
      };
    })
    .filter((invoice) => invoice.outstandingAmount > 0);
}

export function calculateOutstandingReceivables(
  invoices: InvoiceForFinance[],
  payments: PaymentForFinance[],
  asOf = new Date()
) {
  return sum(
    invoices
      .filter((invoice) => collectibleInvoiceStatuses.includes(invoice.status))
      .map((invoice) =>
        Math.max(
          invoice.totalIncludingTax - calculatePaidAmountForInvoice(invoice.id, payments, asOf),
          0
        )
      )
  );
}

export function calculateSimpleCashflowForecast({
  invoices,
  payments,
  expenses,
  startingCash,
  asOf = new Date(),
  horizonDays = 30
}: {
  invoices: InvoiceForFinance[];
  payments: PaymentForFinance[];
  expenses: ExpenseForFinance[];
  startingCash: number;
  asOf?: Date;
  horizonDays?: number;
}): CashflowForecast {
  const horizonDate = new Date(asOf);
  horizonDate.setDate(horizonDate.getDate() + horizonDays);

  const expectedReceipts = sum(
    invoices
      .filter((invoice) => collectibleInvoiceStatuses.includes(invoice.status))
      .filter((invoice) => isOnOrBefore(invoice.dueDate, horizonDate))
      .map((invoice) =>
        Math.max(
          invoice.totalIncludingTax - calculatePaidAmountForInvoice(invoice.id, payments, asOf),
          0
        )
      )
  );

  const expectedExpenses = sum(
    expenses
      .filter((expense) => expense.status !== "PAID" && expense.status !== "CANCELLED")
      .filter((expense) => isOnOrBefore(expense.dueDate ?? expense.expenseDate, horizonDate))
      .map((expense) => expense.totalIncludingTax)
  );

  return {
    asOf,
    horizonDate,
    startingCash,
    expectedReceipts,
    expectedExpenses,
    projectedCash: startingCash + expectedReceipts - expectedExpenses
  };
}

export function generateBusinessHealthScore(input: BusinessHealthScoreInput) {
  const collectionRate =
    input.invoicedRevenue > 0 ? input.collectedRevenue / input.invoicedRevenue : 1;
  const overduePressure =
    input.outstandingReceivables > 0 ? input.overdueAmount / input.outstandingReceivables : 0;

  const collectionPenalty = Math.max(0, 1 - collectionRate) * 35;
  const overduePenalty = Math.min(overduePressure, 1) * 30;
  const cashPenalty = input.projectedCash < 0 ? 25 : 0;
  const lowCashPenalty =
    input.projectedCash >= 0 && input.projectedCash < input.outstandingReceivables * 0.1 ? 10 : 0;

  return Math.round(
    Math.max(0, Math.min(100, 100 - collectionPenalty - overduePenalty - cashPenalty - lowCashPenalty))
  );
}
