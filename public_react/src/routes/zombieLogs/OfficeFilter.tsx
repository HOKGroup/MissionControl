import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/CardGroup";
import Collapse from "react-bootstrap/Collapse";
import Row from "react-bootstrap/Row";

import { Office } from "../../api/schema/shared";
import HorizontalBarChartTimeout from "../../d3/horizontalBarChartTimeout";
import type { DonutData } from "../ZombieLogs";

interface OfficeFilterProps {
  selectedOffice: Office;
  donutData: DonutData[];
}

const OfficeFilter: React.FC<OfficeFilterProps> = ({
  selectedOffice,
  donutData,
}) => {
  const [isCollapsed, setCollapsed] = useState(false);

  return (
    <Row>
      <CardGroup>
        <Card>
          <Card.Header onClick={() => setCollapsed(!isCollapsed)}>
            <Card.Title>Office Filter: {selectedOffice.name}</Card.Title>
          </Card.Header>
          <Collapse in={!isCollapsed}>
            <Card.Body>
              <HorizontalBarChartTimeout
                data={donutData}
                marginLeft="60"
                domainPadding={10}
                clickable={true}
                fillColor="steelblue"
                countTotal="="
                axisTop="="
                onClick={() => console.log("Clicked horizontal bar chart")}
              />
            </Card.Body>
          </Collapse>
        </Card>
      </CardGroup>
    </Row>
  );
};

export default OfficeFilter;
