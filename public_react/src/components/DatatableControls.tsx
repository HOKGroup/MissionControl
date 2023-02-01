import { Updater } from "@tanstack/react-table";
import DebouncedInput from "components/DebouncedInput";
import { memo, useCallback } from "react";
import Col from "react-bootstrap/Col";
import DropdownButton from "react-bootstrap/DropdownButton";
import DropdownItem from "react-bootstrap/DropdownItem";
import Row from "react-bootstrap/Row";

interface DatatableControlsProps {
  globalFilter: string;
  setGlobalFilter: (filter: string) => void;
  pageSize: number;
  setPageSize: (updater: Updater<number>) => void;
  allowedPageSizes: number[];
  maxPageSize: number;
}

const DatatableControls: React.FC<DatatableControlsProps> = ({
  globalFilter,
  setGlobalFilter,
  pageSize: propsPageSize,
  setPageSize,
  allowedPageSizes,
  maxPageSize
}) => {
  const pageSize = propsPageSize === -1 ? "All" : propsPageSize;

  const onSelect = useCallback(
    (eventKey: string | null) => {
      if (eventKey === "All") {
        setPageSize(maxPageSize);
      } else {
        setPageSize(Number(eventKey));
      }
    },
    [maxPageSize, setPageSize]
  );

  return (
    <Row>
      <Col sm="6" className="d-flex text-start align-items-center mb-4">
        {"Show "}
        <DropdownButton
          variant="light"
          title={pageSize === maxPageSize ? "All" : pageSize}
          onSelect={onSelect}
        >
          {allowedPageSizes.map((argsAllowedSize) => {
            const allowedSize =
              argsAllowedSize === -1 ? "All" : argsAllowedSize.toString();
            return (
              <DropdownItem
                eventKey={allowedSize}
                key={allowedSize}
                value={allowedSize}
              >
                {allowedSize}
              </DropdownItem>
            );
          })}
        </DropdownButton>
        {" entries"}
      </Col>
      <Col sm="6" className="text-end">
        <DebouncedInput
          value={globalFilter ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          placeholder="Search..."
        />
      </Col>
    </Row>
  );
};

export default memo(DatatableControls);
