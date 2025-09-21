import { useState, useCallback, useEffect } from "react";
import { DollarSign, TrendingUp, Users, Clock } from "lucide-react";

import { DataTable } from "@/components/DataTable";
import { Modal } from "@/components/Modal";
import { StatsCard } from "@/components/StatCard";
import { debounce } from "@/utils/debounce";
import { formatCurrency } from "@/utils/formatting";

import type { Invoice, InvoiceStats, InvoiceStatus } from "./type";
import {
  fetchMockInvoices,
  fetchMockStats,
  type FetchParams,
  updateBulkStatus,
} from "./api";
import { columnsDef, filterOptions } from "./constants";

import styles from "./styles.module.css";

export const InvoicePage = () => {
  const [stats, setStats] = useState<InvoiceStats>({
    totalOutstanding: { value: 0, change: 0, trend: "up" },
    collectionRate: { value: 0, change: 0, trend: "up" },
    activeCustomers: { value: 0, change: 0, trend: "up" },
    avgDaysToPay: { value: 0, change: 0, trend: "up" },
  });
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  const [tableData, setTableData] = useState<{
    data: Invoice[];
    count: number;
    error: string | null;
    isLoading: boolean;
  }>({
    data: [],
    count: 0,
    error: null,
    isLoading: false,
  });

  const [pageState, setPageState] = useState<{
    size: number;
    number: number;
  }>({
    size: 10,
    number: 1,
  });

  const [sortState, setSortState] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "",
    direction: "asc",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const [changeStatusModalOpen, setChangeStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<InvoiceStatus | "">("");

  const fetchData = useCallback(
    (params: FetchParams = {}) => {
      setTableData((prev) => ({ ...prev, isLoading: true }));
      fetchMockInvoices(
        {
          pageSize: params.pageSize ?? pageState.size,
          pageNumber: params.pageNumber ?? pageState.number,
          searchTerm: params.searchTerm ?? searchQuery,
          filterStatus: params.filterStatus ?? statusFilter,
          sortBy: params.sortBy ?? sortState.key,
          sortDirection: params.sortDirection ?? sortState.direction,
        },
        800,
      ).then((data) => {
        setTableData({
          data: data.data as Invoice[],
          count: data.totalCount,
          error: null,
          isLoading: false,
        });
      });
    },
    [pageState, searchQuery, statusFilter, sortState],
  );

  useEffect(() => {
    setIsStatsLoading(true);
    fetchData();
    fetchMockStats().then((data) => {
      setStats(data);
      setIsStatsLoading(false);
    });
  }, []);

  const handleColumnSort = useCallback(
    (columnId: string, direction: "asc" | "desc") => {
      setSortState({ key: columnId, direction });
      fetchData({ sortBy: columnId, sortDirection: direction });
    },
    [],
  );

  const handleFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
    setPageState((prev) => ({ ...prev, number: 1 }));
    fetchData({ filterStatus: value, pageNumber: 1 });
  }, []);

  const debouncedFetch = useCallback(
    debounce((params) => fetchData(params as FetchParams), 500),
    [],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      debouncedFetch({ pageNumber: 1, searchTerm: value });
    },
    [debouncedFetch],
  );

  const handlePageChange = useCallback((page: number) => {
    setPageState((prev) => ({ ...prev, number: page }));
    fetchData({ pageNumber: page });
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageState({ size, number: 1 });
    fetchData({ pageSize: size, pageNumber: 1 });
  }, []);

  const handleRowSelect = useCallback((selectedRowsIds: string[]) => {
    setSelectedRows(selectedRowsIds);
  }, []);

  const handleStatusChange = () => {
    if (!newStatus) return;
    updateBulkStatus(selectedRows, newStatus).then(() => {
      fetchData();
      setChangeStatusModalOpen(false);
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
          isLoading={isStatsLoading}
          label="Total Outstanding"
          value={formatCurrency(Number(stats?.totalOutstanding?.value))}
          change={stats.totalOutstanding?.change}
          trend={stats.totalOutstanding?.trend}
        />
        <StatsCard
          icon={<TrendingUp />}
          isLoading={isStatsLoading}
          label="Collections Rate"
          value={`${stats.collectionRate.value}%`}
          change={stats.collectionRate.change}
          trend={stats.collectionRate.trend}
        />
        <StatsCard
          icon={<Users />}
          isLoading={isStatsLoading}
          label="Active Customers"
          value={stats.activeCustomers?.value}
          change={stats.activeCustomers?.change}
          trend={stats.activeCustomers?.trend}
        />
        <StatsCard
          icon={<Clock />}
          isLoading={isStatsLoading}
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
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <DataTable.Filter
              options={filterOptions}
              value={statusFilter}
              onChange={handleFilterChange}
              placeholder="All Status"
            />
            <DataTable.Refresh
              onClick={fetchData}
              isLoading={tableData.isLoading}
            />
          </DataTable.Header>

          {selectedRows.length > 0 ? (
            <DataTable.SubHeader>
              <span>{selectedRows.length} Invoices Selected</span>
              <button onClick={() => setChangeStatusModalOpen(true)}>
                Change Status
              </button>
            </DataTable.SubHeader>
          ) : null}

          <DataTable.Body
            columns={columnsDef}
            data={tableData.data}
            isLoading={tableData.isLoading}
            error={tableData.error}
            // onRowClick={handleRowClick}
            rowSelectable={true}
            selectedRows={selectedRows}
            onRowSelect={handleRowSelect}
            onColumnSort={handleColumnSort}
            sortKey={sortState.key}
            sortDirection={sortState.direction}
            getRowId={(row) => `${row.id}`}
          />

          <DataTable.Pagination
            currentPage={pageState.number}
            totalCount={tableData.count}
            pageSize={pageState.size}
            onPageSizeChange={handlePageSizeChange}
            onPageChange={handlePageChange}
          />
        </DataTable>
        <div className={styles.sidebar}>
          <div className={styles.panel}>
            <h4>Recent Activity</h4>
            <div className={styles.activityList}></div>
          </div>
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
          Assign new status for {selectedRows.length} selected invoices
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
