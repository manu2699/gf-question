import React, {
  useState,
  useCallback,
  useMemo,
  useImperativeHandle,
} from "react";
import {
  Search,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  StepForward,
  StepBack,
} from "lucide-react";

import type {
  DataTableProps,
  DataTableHeaderProps,
  DataTableTitleProps,
  DataTableSearchProps,
  DataTableFilterProps,
  DataTableRefreshProps,
  DataTableBodyProps,
  DataTablePaginationProps,
  SortDirection,
  TableDatum,
} from "./types";

import styles from "./styles.module.css";

const DataTableTitle: React.FC<DataTableTitleProps> = ({
  children,
  className,
}) => <h2 className={`${styles.title} ${className || ""}`}>{children}</h2>;

const DataTableSearch: React.FC<DataTableSearchProps> = ({
  placeholder = "Search...",
  value = "",
  onChange,
}) => (
  <div className={styles.searchContainer}>
    <Search className={styles.searchIcon} size={16} />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={styles.searchInput}
    />
  </div>
);

const DataTableFilter: React.FC<DataTableFilterProps> = ({
  options,
  value = "",
  onChange,
  placeholder = "All",
}) => (
  <select
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
    className={styles.filterSelect}
  >
    <option value="">{placeholder}</option>
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

const DataTableRefresh: React.FC<DataTableRefreshProps> = ({
  onClick,
  isLoading = false,
}) => (
  <button
    onClick={onClick}
    className={`${styles.refreshButton} secondaryButton`}
    disabled={isLoading}
  >
    <RefreshCw size={16} />
  </button>
);

const DataTableHeader: React.FC<DataTableHeaderProps> = ({ children }) => {
  const childrenArray = React.Children.toArray(children);
  const { title, actions } = childrenArray.reduce(
    (acc, child: React.ReactNode | React.ReactElement) => {
      if (!React.isValidElement(child)) return acc;
      if (child.type === DataTableTitle) {
        acc.title.push(child);
      } else if (
        [DataTableSearch, DataTableFilter, DataTableRefresh].some(
          (Comp) => child.type === Comp
        )
      ) {
        acc.actions.push(child);
      }
      return acc;
    },
    { title: [] as React.ReactNode[], actions: [] as React.ReactNode[] }
  );

  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>{title}</div>
      <div className={styles.headerRight}>{actions}</div>
    </div>
  );
};

const DataTableSubHeader = ({ children }: { children: React.ReactNode }) => {
  return <div className={styles.subHeader}>{children}</div>;
};

const getNestedValue = (obj: Record<string, unknown>, path: string): string => {
  return String(
    path.split(".").reduce((newObj, key) => newObj?.[key], obj) || ""
  );
};

const DataTableBody = ({
  columns,
  data,
  isLoading = false,
  error = null,
  rowSelectable = false,
  selectedRows = [],
  onRowClick,
  onRowSelect,
  onColumnSort,
  sortKey,
  sortDirection,
  getRowId = (_: TableDatum, index?: number) => `row-${index?.toString()}`,
  className,
  ref,
}: DataTableBodyProps) => {
  const [localSelectedRows, setLocalSelectedRows] =
    useState<string[]>(selectedRows);

  useImperativeHandle(ref, () => ({
    clearSelectedRows: () => {
      setLocalSelectedRows([]);
      if (onRowSelect) {
        onRowSelect([], data[0], false);
      }
    },
  }));

  const handleSort = useCallback(
    (key: string) => {
      const newDirection: SortDirection =
        sortDirection === "asc" ? "desc" : "asc";
      onColumnSort?.(key, newDirection);
    },
    [sortDirection, onColumnSort]
  );

  const handleRowSelect = useCallback(
    (rowId: string, row: TableDatum, isSelected: boolean) => {
      const newSelectedRows = isSelected
        ? [...localSelectedRows, rowId]
        : localSelectedRows.filter((id) => id !== rowId);

      setLocalSelectedRows(newSelectedRows);
      onRowSelect?.(newSelectedRows, row, isSelected);
    },
    [localSelectedRows, onRowSelect]
  );

  const handleSelectAll = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const isSelected = event.target.checked;
      let selectedRows: string[] = [];
      if (isSelected) {
        selectedRows = data.map((row, index) => getRowId(row, index));
      }
      setLocalSelectedRows(selectedRows);
      if (onRowSelect && data.length > 0) {
        onRowSelect(selectedRows, data[0], isSelected);
      }
    },
    [data, getRowId, onRowSelect]
  );

  const getSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) {
      return <ChevronsUpDown size={14} />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp size={14} />
    ) : (
      <ChevronDown size={14} />
    );
  };

  const checkboxState = useMemo(() => {
    if (localSelectedRows.length === 0) return "none";
    if (localSelectedRows.length === data.length) return "all";
    return "some";
  }, [localSelectedRows.length, data.length]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <TableSkeleton rows={10} cols={columns.length} />
      </div>
    );
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!data || data.length === 0) {
    return <div className={styles.noData}>No data available</div>;
  }

  return (
    <div className={`${styles.tableWrapper} ${className || ""}`}>
      <table className={styles.table}>
        <thead className={styles.tableHeader}>
          <tr className={styles.tableHeaderRow}>
            {rowSelectable && (
              <th className={styles.tableHeaderCell}>
                {/* {renderCheckboxIcon(getCheckboxState(), handleSelectAll)} */}
                <input
                  type="checkbox"
                  checked={checkboxState === "all"}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = checkboxState === "some";
                    }
                  }}
                  onChange={handleSelectAll}
                  className={styles.checkbox}
                />
              </th>
            )}
            {columns.map((column) => (
              <th key={column.id} className={styles.tableHeaderCell}>
                {column.sortable ? (
                  <div
                    className={styles.sortable}
                    onClick={() => handleSort(column.id)}
                  >
                    {column.label}
                    {getSortIcon(column.id)}
                  </div>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.tableBody}>
          {data.map((row, index) => {
            const rowId = getRowId(row, index);
            const isSelected = localSelectedRows.includes(rowId);
            return (
              <tr
                key={rowId}
                className={`${styles.tableRow} ${
                  isSelected ? styles.tableRowSelected : ""
                }`}
                onClick={() => onRowClick?.(row, index)}
              >
                {rowSelectable && (
                  <td className={styles.tableCell}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) =>
                        handleRowSelect(rowId, row, e.target.checked)
                      }
                      className={styles.checkbox}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                )}
                {columns.map((column) => {
                  return (
                    <td key={column.id} className={styles.tableCell}>
                      {column.render
                        ? column.render(row[column.id], row)
                        : getNestedValue(row, column.id)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const DataTablePagination: React.FC<DataTablePaginationProps> = ({
  currentPage,
  totalCount,
  pageSize = 10,
  options = [10, 25, 50, 100],
  onPageSizeChange,
  onPageChange,
  className,
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  const getVisiblePages = () => {
    if (totalPages <= 1) return [1];
    const delta = 2;
    const pages: (string | number)[] = [1];
    if (currentPage - delta > 2) {
      pages.push("...");
    }
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage + delta < totalPages - 1) {
      pages.push("...");
    }
    if (totalCount > 1) {
      pages.push(totalPages);
    }
    return pages;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount || 0);

  return (
    <div className={`${styles.pagination} ${className || ""}`}>
      <div>
        <div className={styles.pageRowsSelect}>
          <span>Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {options.map((size) => (
              <option key={size} value={size} selected={size === pageSize}>
                {size}
              </option>
            ))}
          </select>
          <div className={styles.paginationInfo}>
            Showing {startItem} to {endItem} of {totalCount} entries
          </div>
        </div>
      </div>

      <div className={styles.paginationControls}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={styles.paginationButton}
        >
          <StepBack size={16} />
        </button>

        {getVisiblePages().map((page, index) =>
          page === "..." ? (
            <span key={`dots-${index}`} className={styles.paginationInfo}>
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`${styles.pageNumber} ${
                currentPage === page ? styles.pageNumberActive : ""
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={styles.paginationButton}
        >
          <StepForward size={16} />
        </button>
      </div>
    </div>
  );
};

const TableSkeleton = ({ rows, cols }: { rows: number; cols: number }) => (
  <>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className={styles.skeletonRow}>
        {Array.from({ length: cols }).map((_, colIndex) => (
          <div key={colIndex} className={`${styles.skeletonCell} skeleton`} />
        ))}
      </div>
    ))}
  </>
);

export const DataTable: React.FC<DataTableProps> & {
  Header: typeof DataTableHeader;
  Title: typeof DataTableTitle;
  SubHeader: typeof DataTableSubHeader;
  Search: typeof DataTableSearch;
  Filter: typeof DataTableFilter;
  Refresh: typeof DataTableRefresh;
  Body: typeof DataTableBody;
  Pagination: typeof DataTablePagination;
} = ({ children, className }) => {
  return (
    <div className={`${styles.dataTable} ${className || ""}`}>{children}</div>
  );
};

DataTable.Header = DataTableHeader;
DataTable.Title = DataTableTitle;
DataTable.SubHeader = DataTableSubHeader;
DataTable.Search = DataTableSearch;
DataTable.Filter = DataTableFilter;
DataTable.Refresh = DataTableRefresh;
DataTable.Body = DataTableBody;
DataTable.Pagination = DataTablePagination;
