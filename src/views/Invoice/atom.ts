import { atom } from "jotai";
import type { Invoice, InvoiceStats } from "./type";

interface InvoiceState {
  data: Invoice[];
  totalCount: number;
  loading: boolean;
  error: string | null;
}

interface TableControls {
  pageSize: number;
  pageNumber: number;
  searchTerm: string;
  filterStatus: string;
  sortBy: string;
  sortDirection: "asc" | "desc";
  selectedRows: string[];
}

interface UIState {
  changeStatusModalOpen: boolean;
  newStatus: string;
}

// Server state mimiced as Atom
export const invoiceStateAtom = atom<InvoiceState>({
  data: [],
  totalCount: 0,
  loading: true,
  error: null,
});

export const tableControlsAtom = atom<TableControls>({
  pageSize: 10,
  pageNumber: 1,
  searchTerm: "",
  filterStatus: "",
  sortBy: "",
  sortDirection: "asc",
  selectedRows: [],
});

export const uiStateAtom = atom<UIState>({
  changeStatusModalOpen: false,
  newStatus: "",
});

interface InvoiceStatsAtom {
  stats: InvoiceStats;
  loading: boolean;
  error: string | null;
}

export const invoiceStatsAtom = atom<InvoiceStatsAtom>({
  stats: {
    totalOutstanding: { value: 0, change: 0, trend: "up" },
    collectionRate: { value: 0, change: 0, trend: "up" },
    activeCustomers: { value: 0, change: 0, trend: "up" },
    avgDaysToPay: { value: 0, change: 0, trend: "up" },
  },
  loading: true,
  error: null,
});

export const updateInvoiceDataAtom = atom(
  null,
  (get, set, updates: Partial<InvoiceState>) => {
    const currentState = get(invoiceStateAtom);
    const {
      data = currentState.data,
      totalCount = currentState.totalCount,
      loading = currentState.loading,
      error = currentState.error,
    } = updates;
    set(invoiceStateAtom, {
      ...currentState,
      data,
      totalCount,
      loading,
      error,
    });
  }
);

export const updateTableControlsAtom = atom(
  null,
  (get, set, updates: Partial<TableControls>) => {
    const currentState = get(tableControlsAtom);
    const {
      pageSize = currentState.pageSize,
      pageNumber = currentState.pageNumber,
      searchTerm = currentState.searchTerm,
      filterStatus = currentState.filterStatus,
      sortBy = currentState.sortBy,
      sortDirection = currentState.sortDirection,
      selectedRows = currentState.selectedRows,
    } = updates;
    console.log("table contrl :: 2", currentState, updates);
    set(tableControlsAtom, {
      ...currentState,
      pageSize,
      pageNumber,
      searchTerm,
      filterStatus,
      sortBy,
      sortDirection,
      selectedRows,
    });
  }
);

export const updateUIStateAtom = atom(
  null,
  (get, set, updates: Partial<UIState>) => {
    const currentState = get(uiStateAtom);
    const {
      changeStatusModalOpen = currentState.changeStatusModalOpen,
      newStatus = currentState.newStatus,
    } = updates;
    set(uiStateAtom, {
      ...currentState,
      changeStatusModalOpen,
      newStatus,
    });
  }
);

export const updateInvoiceStatsAtom = atom(
  null,
  (get, set, updates: Partial<InvoiceStatsAtom>) => {
    const currentState = get(invoiceStatsAtom);
    const {
      stats = currentState.stats,
      loading = currentState.loading,
      error = currentState.error,
    } = updates;
    set(invoiceStatsAtom, {
      ...currentState,
      stats,
      loading,
      error,
    });
  }
);
