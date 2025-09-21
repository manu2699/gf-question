import type {
  CellValue,
  Column,
  FilterOption,
  TableDatum,
} from "@/components/DataTable/types";
import { formatCurrency, formatDate } from "@/utils/formatting";

import { InvoiceStatuses, type Invoice } from "./type";
import { CommentCell, StatusBadge } from "./cellRenderers";

import styles from "./styles.module.css";

export const columnsDef: Column[] = [
  {
    id: "invoiceNumber",
    label: "Invoice ID",
    render: (value: CellValue) => <b>{value as string}</b>,
  },
  {
    id: "customer.name",
    label: "Customer",
    sortable: true,
  },
  {
    id: "amount",
    label: "Amount",
    sortable: true,
    render: (value: CellValue) => <b>{formatCurrency(value as number)}</b>,
  },
  {
    id: "dueDate",
    label: "Due Date",
    sortable: true,
    render: (value: CellValue) =>
      value ? formatDate(new Date(value.toString())) : "-",
  },
  {
    id: "daysOverdue",
    label: "Days Overdue",
    sortable: true,
    render: (value: CellValue, row?: TableDatum) => {
      const invoice = row as Invoice;
      if (!invoice || invoice.status !== "overdue" || !value) return "On time";
      return <span className={styles.overDueText}>{String(value)} days</span>;
    },
  },
  {
    id: "status",
    label: "Status",
    sortable: true,
    render: (value: CellValue) => <StatusBadge status={String(value)} />,
  },
  {
    id: "comments",
    label: "Comments",
    render: (value: CellValue) => <CommentCell comments={value as string[]} />,
  },
];

export const filterOptions: FilterOption[] = [
  { value: InvoiceStatuses.PAID, label: "Paid" },
  { value: InvoiceStatuses.PENDING, label: "Pending" },
  { value: InvoiceStatuses.OVERDUE, label: "Overdue" },
  { value: InvoiceStatuses.DRAFT, label: "Draft" },
];
