import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ColumnDef,
  PaginationState,
  Row,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import Container from "react-bootstrap/Container";
import BRow from "react-bootstrap/Row";
import BTable from "react-bootstrap/Table";

import DatatableControls from "./DatatableControls";
import DatatablePaginationControls from "./DatatablePaginationControls";

interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getRowClassNames: (row: Row<T>) => string;
}

function Datatable<T>({ data, columns, getRowClassNames }: TableProps<T>) {
  const [globalFilter, setGlobalFilter] = useState("");

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
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
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        pageSize={table.getState().pagination.pageSize}
        setPageSize={table.setPageSize}
      />
      <BRow>
        <BTable striped bordered hover responsive size="sm">
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
                        <div className="d-flex justify-content-between align-items-center">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: <FontAwesomeIcon icon="sort-asc" />,
                            desc: <FontAwesomeIcon icon="sort-desc" />
                          }[header.column.getIsSorted() as string] ?? (
                            <FontAwesomeIcon icon="sort" />
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
            {table.getPaginationRowModel().rows.map((row) => (
              <tr key={row.id} className={getRowClassNames(row)}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
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
      <BRow>
        <DatatablePaginationControls
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
    </Container>
  );
}

export default Datatable;
