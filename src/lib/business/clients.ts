import type { ClientFiltersState, ClientRecord, ClientRiskLevel, ClientStats } from "@/types/client";

const riskWeight: Record<ClientRiskLevel, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1
};

export function calculateClientStats(clients: ClientRecord[]): ClientStats {
  return {
    activeClients: clients.filter((client) => client.status === "active").length,
    atRiskClients: clients.filter((client) => client.status === "at-risk").length,
    invoicedRevenue: clients.reduce((total, client) => total + client.invoicedRevenue, 0),
    collectedRevenue: clients.reduce((total, client) => total + client.collectedRevenue, 0),
    outstandingRevenue: clients.reduce((total, client) => total + client.outstandingRevenue, 0)
  };
}

export function filterClients(clients: ClientRecord[], filters: ClientFiltersState[]) {
  return filters.reduce((filteredClients, filter) => applyClientFilter(filteredClients, filter), clients);
}

export function applyClientFilter(clients: ClientRecord[], filters: ClientFiltersState) {
  const search = filters.search.trim().toLowerCase();

  return clients.filter((client) => {
    const matchesStatus = filters.status === "all" || client.status === filters.status;
    const matchesRisk = filters.riskLevel === "all" || client.riskLevel === filters.riskLevel;
    const matchesSearch =
      search.length === 0 ||
      client.name.toLowerCase().includes(search) ||
      client.contactName.toLowerCase().includes(search) ||
      client.city.toLowerCase().includes(search);

    return matchesStatus && matchesRisk && matchesSearch;
  });
}

export function sortClientsByDecisionPriority(clients: ClientRecord[]) {
  return [...clients].sort((a, b) => {
    const riskDelta = riskWeight[b.riskLevel] - riskWeight[a.riskLevel];

    if (riskDelta !== 0) {
      return riskDelta;
    }

    return b.outstandingRevenue - a.outstandingRevenue;
  });
}
