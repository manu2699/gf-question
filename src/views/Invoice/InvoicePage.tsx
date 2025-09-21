import { useState, useCallback, useEffect, useRef } from "react";
import { DollarSign, TrendingUp, Users, Clock } from "lucide-react";
import { useAtomValue, useSetAtom, getDefaultStore } from "jotai";

import { DataTable } from "@/components/DataTable";
import type { DataTableRefObject } from "@/components/DataTable/types";
import { Modal } from "@/components/Modal";
import { StatsCard } from "@/components/StatCard";
import { debounce } from "@/utils/debounce";
import { formatCurrency } from "@/utils/formatting";

import type { Invoice, InvoiceStatus } from "./type";
import { fetchMockInvoices, fetchMockStats, updateBulkStatus } from "./api";
import { columnsDef, filterOptions } from "./constants";
import {
  invoiceStateAtom,
  invoiceStatsAtom,
  tableControlsAtom,
  updateInvoiceDataAtom,
  updateInvoiceStatsAtom,
  updateTableControlsAtom,
} from "./atom";

import styles from "./styles.module.css";

export const InvoicePage = () => {
  const { stats, loading: statsLoading } = useAtomValue(invoiceStatsAtom);
  const {
    data: invoices,
    loading: invoicesLoading,
    totalCount: totalInvoices,
    error: invoicesError,
  } = useAtomValue(invoiceStateAtom);
  const tableControls = useAtomValue(tableControlsAtom);

  const updateInvoiceStats = useSetAtom(updateInvoiceStatsAtom);
  const updateInvoiceData = useSetAtom(updateInvoiceDataAtom);
  const updateTableControls = useSetAtom(updateTableControlsAtom);

  const [changeStatusModalOpen, setChangeStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<InvoiceStatus | "">("");

  const tableRef = useRef<DataTableRefObject>({
    clearSelectedRows: () => {
      updateTableControls({ selectedRows: [] });
    },
  });

  const fetchData = useCallback(() => {
    updateInvoiceData({ loading: true });
    const tableControls = getDefaultStore().get(tableControlsAtom);
    fetchMockInvoices({
      pageSize: tableControls.pageSize,
      pageNumber: tableControls.pageNumber,
      searchTerm: tableControls.searchTerm,
      filterStatus: tableControls.filterStatus,
      sortBy: tableControls.sortBy,
      sortDirection: tableControls.sortDirection,
    }).then((data) => {
      updateInvoiceData({
        data: data.data as Invoice[],
        totalCount: data.totalCount,
        error: null,
        loading: false,
      });
    });
  }, [updateInvoiceData]);

  useEffect(() => {
    fetchData();
    fetchMockStats().then((data) => {
      updateInvoiceStats({
        stats: data,
        loading: false,
        error: null,
      });
    });
  }, []);

  const handleColumnSort = useCallback(
    (columnId: string, direction: "asc" | "desc") => {
      updateTableControls({ sortBy: columnId, sortDirection: direction });
      fetchData();
    },
    []
  );

  const handleFilterChange = useCallback((value: string) => {
    updateTableControls({ filterStatus: value, pageNumber: 1 });
    fetchData();
  }, []);

  const debouncedFetch = useCallback(
    debounce(() => fetchData(), 500),
    []
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      updateTableControls({ searchTerm: value, pageNumber: 1 });
      debouncedFetch();
    },
    [debouncedFetch, updateTableControls]
  );

  const handlePageChange = useCallback((page: number) => {
    updateTableControls({ pageNumber: page });
    fetchData();
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    updateTableControls({ pageSize: size });
    fetchData();
  }, []);

  const handleRowSelect = useCallback(
    (selectedRowsIds: string[]) => {
      updateTableControls({ selectedRows: selectedRowsIds });
    },
    [updateTableControls]
  );

  const handleStatusChange = () => {
    if (!newStatus) return;
    updateBulkStatus(tableControls.selectedRows, newStatus).then(() => {
      setChangeStatusModalOpen(false);
      tableRef.current.clearSelectedRows();
    });
  };

  return (
    <div className={"page"}>
      <header className={styles.header}>
        <h1>Collections Dashboard</h1>
        <p>Monitor and manage your accounts receivable in real-time</p>
      </header>

      <div className={styles.statsGrid}>
        <StatsCard
          icon={<DollarSign />}
          isLoading={statsLoading}
          label="Total Outstanding"
          value={formatCurrency(Number(stats?.totalOutstanding?.value))}
          change={stats.totalOutstanding?.change}
          trend={stats.totalOutstanding?.trend}
        />
        <StatsCard
          icon={<TrendingUp />}
          isLoading={statsLoading}
          label="Collections Rate"
          value={`${stats.collectionRate.value}%`}
          change={stats.collectionRate.change}
          trend={stats.collectionRate.trend}
        />
        <StatsCard
          icon={<Users />}
          isLoading={statsLoading}
          label="Active Customers"
          value={stats.activeCustomers?.value}
          change={stats.activeCustomers?.change}
          trend={stats.activeCustomers?.trend}
        />
        <StatsCard
          icon={<Clock />}
          isLoading={statsLoading}
          label="Avg. Days to Pay"
          value={`${stats.avgDaysToPay?.value} days`}
          change={stats.avgDaysToPay?.change}
          trend={stats.avgDaysToPay?.trend}
        />
      </div>

      <div className={styles.contentGrid}>
        <DataTable className={styles.tableContainer}>
          <DataTable.Header>
            <DataTable.Title>Invoice Management</DataTable.Title>
            <DataTable.Search
              placeholder="Search invoices..."
              value={tableControls.searchTerm}
              onChange={handleSearchChange}
            />
            <DataTable.Filter
              options={filterOptions}
              value={tableControls.filterStatus}
              onChange={handleFilterChange}
              placeholder="All Status"
            />
            <DataTable.Refresh
              onClick={fetchData}
              isLoading={invoicesLoading}
            />
          </DataTable.Header>

          {tableControls.selectedRows.length > 0 ? (
            <DataTable.SubHeader>
              <span>{tableControls.selectedRows.length} Invoices Selected</span>
              <button
                className={"secondaryButton"}
                onClick={() => tableRef.current.clearSelectedRows()}
              >
                Clear Selection
              </button>
              <button onClick={() => setChangeStatusModalOpen(true)}>
                Change Status
              </button>
            </DataTable.SubHeader>
          ) : null}

          <DataTable.Body
            columns={columnsDef}
            data={invoices}
            isLoading={invoicesLoading}
            error={invoicesError}
            rowSelectable={true}
            selectedRows={tableControls.selectedRows}
            onRowSelect={handleRowSelect}
            onColumnSort={handleColumnSort}
            sortKey={tableControls.sortBy}
            sortDirection={tableControls.sortDirection}
            getRowId={(row) => `${row.id}`}
            ref={tableRef}
          />

          <DataTable.Pagination
            currentPage={tableControls.pageNumber}
            totalCount={totalInvoices}
            pageSize={tableControls.pageSize}
            onPageSizeChange={handlePageSizeChange}
            onPageChange={handlePageChange}
          />
        </DataTable>
        <div className={styles.sidebar}>
          <h4>Recent Activity</h4>
          <div className={styles.activityList}></div>
        </div>
      </div>

      <Modal
        isOpen={changeStatusModalOpen}
        title="Change Status"
        onClose={() => setChangeStatusModalOpen(false)}
        width={"500px"}
        footerRenderer={() => (
          <>
            <button
              className={"secondaryButton"}
              onClick={() => setChangeStatusModalOpen(false)}
            >
              Cancel
            </button>
            <button onClick={handleStatusChange}>Save</button>
          </>
        )}
      >
        <span>
          Assign new status for {tableControls.selectedRows.length} selected
          invoices
          <br />
          <select
            onChange={(e) => setNewStatus(e.target.value as InvoiceStatus)}
            value={newStatus}
          >
            <option value="">Select Status</option>
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </span>
      </Modal>
    </div>
  );
};
