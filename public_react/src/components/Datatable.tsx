import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ColumnDef,
  PaginationState,
  Row,
  SortDirection,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import DatatableControls from "components/DatatableControls";
import DatatablePaginationControls from "components/DatatablePaginationControls";
import { useMemo, useState } from "react";
import Container from "react-bootstrap/Container";
import BRow from "react-bootstrap/Row";
import BTable from "react-bootstrap/Table";

interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getRowClassName?: (row: Row<T>) => string;
  initialPageSize?: number;
  allowedPageSizes?: number[];
  onClickRow?: (row: Row<T>) => void;
}

function Datatable<T>({
  data,
  columns,
  getRowClassName,
  initialPageSize,
  allowedPageSizes,
  onClickRow
}: TableProps<T>) {
  const [globalFilter, setGlobalFilter] = useState("");

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize || 10
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize
    }),
    [pageIndex, pageSize]
  );

  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
      pagination
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    autoResetPageIndex: true
  });

  return (
    <Container>
      <DatatableControls
        maxPageSize={table.getPrePaginationRowModel().rows.length}
        allowedPageSizes={allowedPageSizes || [10, 25, 50, 100, -1]}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        pageSize={table.getState().pagination.pageSize}
        setPageSize={table.setPageSize}
      />
      <BRow>
        <BTable striped hover responsive size="sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : "",
                          onClick: header.column.getToggleSortingHandler()
                        }}
                      >
                        <div
                          style={{ cursor: "pointer" }}
                          className="d-flex justify-content-between align-items-center no-select"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: (
                              <FontAwesomeIcon icon="arrow-down-short-wide" />
                            ),
                            desc: (
                              <FontAwesomeIcon icon="arrow-down-wide-short" />
                            )
                          }[header.column.getIsSorted() as SortDirection] ?? (
                            <span>
                              <FontAwesomeIcon
                                size="sm"
                                icon="arrow-down-long"
                              />
                              <FontAwesomeIcon size="sm" icon="arrow-up-long" />
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getPaginationRowModel().rows.length === 0 && (
              <tr>
                <td className="text-center p-2" colSpan={columns.length}>
                  No data available in table
                </td>
              </tr>
            )}
            {table.getPaginationRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`${
                  getRowClassName && getRowClassName(row)
                } bg-opacity-25`}
                onClick={() => onClickRow && onClickRow(row)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={cell.column.columnDef.meta?.className}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {/*<tfoot>
            {table.getFooterGroups().map((footerGroup) => (
              <tr key={footerGroup.id}>
                {footerGroup.headers.map((header) => (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.footer,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
            </tfoot>*/}
        </BTable>
      </BRow>
      {table.getPageCount() > 0 && (
        <BRow>
          <DatatablePaginationControls
            pageSize={pageSize}
            setPageIndex={table.setPageIndex}
            canPreviousPage={table.getCanPreviousPage()}
            previousPage={table.previousPage}
            nextPage={table.nextPage}
            canNextPage={table.getCanNextPage()}
            pageCount={table.getPageCount()}
            pageIndex={table.getState().pagination.pageIndex}
            pageRowCount={table.getPaginationRowModel().rows.length}
            filteredRowCount={table.getFilteredRowModel().rows.length}
            totalRowCount={table.getCoreRowModel().rows.length}
          />
        </BRow>
      )}
    </Container>
  );
}

export default Datatable;
