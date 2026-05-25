import type {
  InvoiceBusinessStatus,
  InvoiceFiltersState,
  InvoiceRecord,
  InvoiceStats,
  InvoiceTransmissionStatus
} from "@/types/invoice";

const businessPriority: Record<InvoiceBusinessStatus, number> = {
  rejected: 9,
  "partially-paid": 8,
  accepted: 7,
  transmitted: 6,
  "ready-transmission": 5,
  validated: 4,
  draft: 3,
  paid: 1,
  cancelled: 0
};

const transmissionPriority: Record<InvoiceTransmissionStatus, number> = {
  rejected: 8,
  error: 7,
  pending: 5,
  transmitted: 4,
  "not-transmitted": 3,
  accepted: 1
};

export function calculateInvoiceStats(invoices: InvoiceRecord[]): InvoiceStats {
  return {
    totalInvoices: invoices.length,
    amountIncludingTax: invoices.reduce((total, invoice) => total + invoice.amountIncludingTax, 0),
    collectedAmount: invoices.reduce((total, invoice) => total + invoice.collectedAmount, 0),
    outstandingAmount: invoices.reduce((total, invoice) => total + invoice.outstandingAmount, 0),
    overdueAmount: invoices
      .filter((invoice) => invoice.daysLate > 0)
      .reduce((total, invoice) => total + invoice.outstandingAmount, 0),
    lateInvoices: invoices.filter((invoice) => invoice.daysLate > 0).length,
    blockedInvoices: invoices.filter(
      (invoice) =>
        invoice.businessStatus === "rejected" ||
        invoice.transmissionStatus === "rejected" ||
        invoice.transmissionStatus === "error"
    ).length
  };
}

export function applyInvoiceFilter(invoices: InvoiceRecord[], filters: InvoiceFiltersState) {
  const search = filters.search.trim().toLowerCase();

  return invoices.filter((invoice) => {
    const matchesBusinessStatus =
      filters.businessStatus === "all" || invoice.businessStatus === filters.businessStatus;
    const matchesTransmissionStatus =
      filters.transmissionStatus === "all" ||
      invoice.transmissionStatus === filters.transmissionStatus;
    const matchesLate = !filters.lateOnly || invoice.daysLate > 0;
    const matchesSearch =
      search.length === 0 ||
      invoice.clientName.toLowerCase().includes(search) ||
      invoice.invoiceNumber.toLowerCase().includes(search);

    return matchesBusinessStatus && matchesTransmissionStatus && matchesLate && matchesSearch;
  });
}

export function sortInvoicesByDecisionPriority(invoices: InvoiceRecord[]) {
  return [...invoices].sort((a, b) => {
    const lateDelta = Math.min(b.daysLate, 60) - Math.min(a.daysLate, 60);

    if (lateDelta !== 0) {
      return lateDelta;
    }

    const transmissionDelta =
      transmissionPriority[b.transmissionStatus] - transmissionPriority[a.transmissionStatus];

    if (transmissionDelta !== 0) {
      return transmissionDelta;
    }

    const businessDelta = businessPriority[b.businessStatus] - businessPriority[a.businessStatus];

    if (businessDelta !== 0) {
      return businessDelta;
    }

    return b.outstandingAmount - a.outstandingAmount;
  });
}
