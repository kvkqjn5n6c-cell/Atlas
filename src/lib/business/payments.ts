import type {
  PaymentFiltersState,
  PaymentRecord,
  PaymentRiskLevel,
  PaymentStats,
  PaymentStatus
} from "@/types/payment";

const statusPriority: Record<PaymentStatus, number> = {
  late: 5,
  partial: 4,
  pending: 3,
  paid: 1,
  cancelled: 0
};

const riskPriority: Record<PaymentRiskLevel, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1
};

export function calculatePaymentStats(payments: PaymentRecord[]): PaymentStats {
  return {
    expectedAmount: payments.reduce((total, payment) => total + payment.expectedAmount, 0),
    receivedAmount: payments.reduce((total, payment) => total + payment.receivedAmount, 0),
    outstandingAmount: payments.reduce((total, payment) => total + payment.outstandingAmount, 0),
    overdueAmount: payments
      .filter((payment) => payment.daysLate > 0)
      .reduce((total, payment) => total + payment.outstandingAmount, 0),
    latePayments: payments.filter((payment) => payment.daysLate > 0).length,
    highRiskPayments: payments.filter(
      (payment) => payment.riskLevel === "high" || payment.riskLevel === "critical"
    ).length
  };
}

export function applyPaymentFilter(payments: PaymentRecord[], filters: PaymentFiltersState) {
  const search = filters.search.trim().toLowerCase();

  return payments.filter((payment) => {
    const matchesStatus = filters.status === "all" || payment.status === filters.status;
    const matchesLate = !filters.lateOnly || payment.daysLate > 0;
    const matchesRisk = filters.riskLevel === "all" || payment.riskLevel === filters.riskLevel;
    const matchesSearch =
      search.length === 0 ||
      payment.clientName.toLowerCase().includes(search) ||
      payment.invoiceNumber.toLowerCase().includes(search);

    return matchesStatus && matchesLate && matchesRisk && matchesSearch;
  });
}

export function sortPaymentsByDecisionPriority(payments: PaymentRecord[]) {
  return [...payments].sort((a, b) => {
    const lateDelta = Math.min(b.daysLate, 60) - Math.min(a.daysLate, 60);

    if (lateDelta !== 0) {
      return lateDelta;
    }

    const riskDelta = riskPriority[b.riskLevel] - riskPriority[a.riskLevel];

    if (riskDelta !== 0) {
      return riskDelta;
    }

    const statusDelta = statusPriority[b.status] - statusPriority[a.status];

    if (statusDelta !== 0) {
      return statusDelta;
    }

    return b.outstandingAmount - a.outstandingAmount;
  });
}
