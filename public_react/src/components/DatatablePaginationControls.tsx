import { Updater } from "@tanstack/react-table";
import Col from "react-bootstrap/Col";
import Pagination from "react-bootstrap/Pagination";
import Row from "react-bootstrap/Row";

interface DatatablePaginationControlsProps {
  pageSize: number;
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
  pageSize,
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
        Showing {pageRowCount ? pageIndex * pageSize + 1 : 0} to{" "}
        {pageIndex * pageSize + pageRowCount} of {filteredRowCount}
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
          <Pagination.Prev disabled={!canPreviousPage} onClick={previousPage} />
          {Array.from({ length: pageCount }, (_v, i) => {
            if (i !== 0 && i !== pageCount - 1) {
              if (pageCount - pageIndex < 5) {
                if (pageCount - i <= 5) {
                  // no op
                } else if (pageCount - i === 6)
                  return <Pagination.Ellipsis key={i} />;
                else return null;
              } else if (pageIndex < 4) {
                if (i === 5) {
                  return <Pagination.Ellipsis key={i} />;
                } else if (i > 5) return null;
              } else if (i < pageIndex) {
                if (pageIndex - i === 2) return <Pagination.Ellipsis key={i} />;
                else if (pageIndex - i > 1) return null;
              } else if (i > pageIndex) {
                if (i - pageIndex === 2) return <Pagination.Ellipsis key={i} />;
                else if (i - pageIndex > 1) return null;
              }
            }

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
          <Pagination.Next disabled={!canNextPage} onClick={nextPage} />
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
