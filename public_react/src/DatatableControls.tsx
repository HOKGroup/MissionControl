import { Updater } from "@tanstack/react-table";
import { Dispatch, SetStateAction } from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import DropdownItem from "react-bootstrap/esm/DropdownItem";

import DebouncedInput from "./DebouncedInput";

interface DatatableControlsProps {
  globalFilter: string;
  setGlobalFilter: Dispatch<SetStateAction<string>>;
  pageSize: number;
  setPageSize: (updater: Updater<number>) => void;
}

const DatatableControls: React.FC<DatatableControlsProps> = ({
  globalFilter,
  setGlobalFilter,
  pageSize,
  setPageSize
}) => {
  return (
    <Row>
      <Col sm="6" className="d-flex text-start align-items-center mb-4">
        {"Show "}
        <DropdownButton
          variant="light"
          title={pageSize}
          onSelect={(eventKey) => setPageSize(Number(eventKey))}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <DropdownItem eventKey={pageSize} key={pageSize} value={pageSize}>
              {pageSize}
            </DropdownItem>
          ))}
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

export default DatatableControls;
