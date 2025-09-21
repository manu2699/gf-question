import {
  InvoiceStatuses,
  type Invoice,
  type InvoiceStats,
  type InvoiceStatus,
} from "./type";

const companies = [
  "Acme",
  "Oracle",
  "Redbull",
  "Mercedes",
  "BMW",
  "Honda",
  "Ford",
  "Apple",
  "Atlassian",
  "Binance",
  "Quantum",
  "Apex",
];

const comments = ["Review the invoice.", "Payment is due in 30 days."];

const generateRandomDate = (start: Date, end: Date): Date => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
};

const getRandomBetween = (min: number, max: number): number => {
  return Math.round(Math.random() * (max - min) + min);
};

export const generateMockInvoices = (count: number): Invoice[] => {
  const startDate = new Date("2025-08-15");
  const endDate = new Date();

  return Array.from({ length: count }, (_, index) => {
    const dueDate = generateRandomDate(startDate, endDate);

    const company = companies[getRandomBetween(0, companies.length - 1)];
    const status =
      Object.values(InvoiceStatuses)[
        Math.floor(Math.random() * Object.values(InvoiceStatuses).length)
      ];

    const today = new Date();
    const diffTime = today.getTime() - dueDate.getTime();
    const daysOverdue = Math.max(
      0,
      Math.floor(diffTime / (1000 * 60 * 60 * 24)),
    );

    return {
      id: `INV-${2025 + index}`,
      invoiceNumber: `INV-${2025 + index}`,
      customer: {
        id: `CUST-${1000 + (index % 20)}`,
        name: company,
        email: `billing@xyz.com`,
        company: company,
      },
      amount: getRandomBetween(1000, 50000),
      status: daysOverdue > 30 ? InvoiceStatuses.OVERDUE : status,
      daysOverdue,
      dueDate: dueDate.toISOString(),
      createdAt: startDate.toISOString(),
      updatedAt: startDate.toISOString(),
      comments: comments[getRandomBetween(0, comments.length - 1)]
        ? [comments[getRandomBetween(0, comments.length - 1)]]
        : [],
    };
  });
};

const totalCount = 200;
const mockData = generateMockInvoices(totalCount);
console.log("mock data :: ", mockData);

const getNestedValue = (
  obj: Record<string, unknown>,
  path: string,
): unknown => {
  return path.split(".").reduce((newObj, key) => newObj?.[key], obj);
};

export interface FetchParams {
  pageSize?: number;
  pageNumber?: number;
  searchTerm?: string;
  filterStatus?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export const fetchMockInvoices = (
  {
    pageSize = 10,
    pageNumber = 1,
    searchTerm,
    filterStatus,
    sortBy,
    sortDirection,
  }: FetchParams,
  delay = 500,
) => {
  return new Promise<{ totalCount: number; data: Invoice[] }>((resolve) => {
    let data = [...mockData];

    if (searchTerm?.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      data = data.filter(
        (invoice) =>
          invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
          invoice.customer?.name?.toLowerCase?.().includes(searchLower) ||
          invoice.amount.toString().includes(searchLower),
      );
    }

    if (filterStatus && filterStatus !== "") {
      data = data.filter((invoice) => invoice.status === filterStatus);
    }

    if (sortBy) {
      data = data.sort((a, b) => {
        const aValue = getNestedValue(a, sortBy);
        const bValue = getNestedValue(b, sortBy);
        let comparison = 0;
        if (typeof aValue === "string" && typeof bValue === "string") {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === "number" && typeof bValue === "number") {
          comparison = aValue - bValue;
        }
        return sortDirection === "desc" ? -comparison : comparison;
      });
    }

    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = data.slice(startIndex, endIndex);

    setTimeout(() => {
      resolve({
        totalCount: data.length,
        data: paginatedData,
      });
    }, delay);
  });
};

export const fetchMockStats = (delay = 300) => {
  return new Promise<InvoiceStats>((resolve) => {
    const outstandingInvoices = mockData.filter(
      (inv) =>
        inv.status === InvoiceStatuses.PENDING ||
        inv.status === InvoiceStatuses.OVERDUE,
    );
    const totalOutstanding = outstandingInvoices.reduce(
      (sum, inv) => sum + inv.amount,
      0,
    );
    setTimeout(() => {
      resolve({
        totalOutstanding: { value: totalOutstanding, change: 5.2, trend: "up" },
        collectionRate: { value: 87.3, change: 1.1, trend: "up" },
        activeCustomers: { value: 1247, change: 1.5, trend: "up" },
        avgDaysToPay: { value: 32, change: -2, trend: "down" },
      });
    }, delay);
  });
};

export const updateBulkStatus = (
  rowIds: string[],
  status: InvoiceStatus,
  delay = 500,
) => {
  return new Promise<{ success: boolean }>((resolve) => {
    mockData.forEach((invoice) => {
      if (rowIds.includes(invoice.id)) {
        invoice.status = status;
      }
    });
    setTimeout(() => {
      resolve({ success: true });
    }, delay);
  });
};
