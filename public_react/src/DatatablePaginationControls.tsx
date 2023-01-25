import { Updater } from "@tanstack/react-table";
import Col from "react-bootstrap/Col";
import Pagination from "react-bootstrap/Pagination";
import Row from "react-bootstrap/Row";

interface DatatablePaginationControlsProps {
  setPageIndex: (updater: Updater<number>) => void;
  canPreviousPage: boolean;
  canNextPage: boolean;
  previousPage: () => void;
  nextPage: () => void;
  pageCount: number;
  pageIndex: number;
  pageRowCount: number;
  filteredRowCount: number;
  totalRowCount: number;
}

const DatatablePaginationControls: React.FC<
  DatatablePaginationControlsProps
> = ({
  setPageIndex,
  canPreviousPage,
  canNextPage,
  previousPage,
  nextPage,
  pageCount,
  pageIndex,
  pageRowCount,
  filteredRowCount,
  totalRowCount
}) => {
  return (
    <Row>
      <Col sm="5" className="d-flex justify-content-start align-items-center">
        Showing {pageIndex + 1} to {pageRowCount} of {filteredRowCount}
        {filteredRowCount !== totalRowCount
          ? ` (filtered from ${totalRowCount} total entries)`
          : null}
      </Col>
      <Col sm="7" className="d-flex justify-content-end align-items-center">
        <Pagination className="mb-0">
          <Pagination.First
            disabled={!canPreviousPage}
            onClick={() => setPageIndex(0)}
          />
          <Pagination.Prev
            disabled={!canPreviousPage}
            onClick={() => previousPage()}
          />
          {Array.from({ length: pageCount }, (_v, i) => {
            return (
              <Pagination.Item
                key={i}
                active={pageIndex === i}
                onClick={() => setPageIndex(i)}
              >
                {i + 1}
              </Pagination.Item>
            );
          })}
          <Pagination.Next disabled={!canNextPage} onClick={() => nextPage()} />
          <Pagination.Last
            disabled={!canNextPage}
            onClick={() => setPageIndex(pageCount - 1)}
          />
        </Pagination>
      </Col>
    </Row>
  );
};

export default DatatablePaginationControls;
