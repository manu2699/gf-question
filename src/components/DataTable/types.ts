export type CellValue =
  | string
  | number
  | boolean
  | Record<string, unknown>
  | null
  | undefined
  | unknown[];

export type TableDatum = Record<string, CellValue>;

export type TableData = TableDatum[];

export interface Column {
  id: string;
  label: string;
  sortable?: boolean;
  render?: (
    value: CellValue,
    row?: TableDatum
  ) => React.ReactNode | string | number;
}

export interface DataTableProps {
  children: React.ReactNode;
  className?: string;
}

export interface DataTableRefObject {
  clearSelectedRows: () => void;
}

export interface DataTableBodyProps {
  columns: Column[];
  data: TableData;
  isLoading?: boolean;
  error?: string | null;
  rowSelectable?: boolean;
  selectedRows?: string[];
  ref?: React.RefObject<DataTableRefObject>;
  onRowClick?: (row: TableDatum, index: number) => void;
  onRowSelect?: (
    selectedRows: string[],
    row: TableDatum,
    isSelected: boolean
  ) => void;
  onColumnSort?: (key: string, direction: SortDirection) => void;
  sortKey?: string;
  sortDirection?: SortDirection;
  getRowId?: (row: TableDatum, index?: number) => string;
  className?: string;
}

export interface DataTableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface DataTableTitleProps {
  children: React.ReactNode;
  className?: string;
}

export interface DataTableSearchProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export interface DataTableFilterProps {
  options: FilterOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export interface DataTableRefreshProps {
  onClick?: () => void;
  isLoading?: boolean;
  className?: string;
}

export interface DataTablePaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize?: number;
  options?: number[];
  onPageSizeChange: (size: number) => void;
  onPageChange: (page: number) => void;
  className?: string;
}

export type SortDirection = "asc" | "desc";
