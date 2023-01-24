import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dispatch, SetStateAction, useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/CardGroup";
import Col from "react-bootstrap/Col";
import Collapse from "react-bootstrap/Collapse";
import Dropdown from "react-bootstrap/Dropdown";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";

import { Office } from "../../api/schema/shared";

interface LogsProps {
  selectedOffice: Office;
  setSelectedOffice: Dispatch<SetStateAction<Office>>;
}

const Logs: React.FC<LogsProps> = ({ selectedOffice }) => {
  const [isCollapsed, setCollapsed] = useState(false);
  return (
    <Row>
      <CardGroup>
        <Card>
          <Card.Header onClick={() => setCollapsed(!isCollapsed)}>
            <Card.Title className="pt-5">Logs</Card.Title>
          </Card.Header>
          <Collapse in={!isCollapsed}>
            <Card.Body>
              <Row>
                <Col md="4" className="no-padding-left">
                  <Col sm="2" className="p-0">
                    <label htmlFor="fromInput">From: </label>
                  </Col>
                  <Col>
                    <InputGroup>
                      <InputGroup.Text id="fromInput"></InputGroup.Text>
                    </InputGroup>
                    <Button>
                      <FontAwesomeIcon icon="calendar" />
                    </Button>
                  </Col>
                </Col>
                <Col md="4" className="no-padding-left">
                  <Col sm="2" className="p-0">
                    <label htmlFor="fromInput">To: </label>
                  </Col>
                  <Col
                    sm="10"
                    className="no-padding-right no-padding-left"
                  ></Col>
                </Col>
                <Col md="2">
                  <Dropdown>
                    <Dropdown.Toggle>{selectedOffice.name}</Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item>PLACEHOLDER OFFICE</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>
                <Col md="2" className="no-padding-right">
                  <FontAwesomeIcon
                    icon="spinner"
                    spin={true}
                    className="fa-spin"
                  />
                  <Button variant="primary" size="sm" className="pull-right">
                    Filter
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Collapse>
        </Card>
      </CardGroup>
    </Row>
  );
};

export default Logs;
