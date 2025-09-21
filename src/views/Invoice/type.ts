import type { TableDatum } from "@/components/DataTable/types";

export const InvoiceStatuses = {
  PAID: "paid",
  PENDING: "pending",
  OVERDUE: "overdue",
  DRAFT: "draft",
} as const;

export type InvoiceStatus =
  (typeof InvoiceStatuses)[keyof typeof InvoiceStatuses];

export interface Invoice extends TableDatum {
  id: string;
  invoiceNumber: string;
  customer: {
    name: string;
  };
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  comments: string[];
  daysOverdue?: number;
}

type StatData = {
  value: number | string;
  change: number | string;
  trend: "up" | "down";
};

export interface InvoiceStats {
  totalOutstanding: StatData;
  collectionRate: StatData;
  activeCustomers: StatData;
  avgDaysToPay: StatData;
}
