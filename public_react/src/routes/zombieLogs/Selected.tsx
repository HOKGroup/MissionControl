import { useState } from "react";
import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/CardGroup";
import Collapse from "react-bootstrap/Collapse";
import Row from "react-bootstrap/Row";

import { ZombieLog } from "../../api/schema/zombieLogs";

interface SelectedProps {
  selectedMachines: ZombieLog[];
}

const Selected: React.FC<SelectedProps> = () => {
  const [isCollapsed, setCollapsed] = useState(false);

  return (
    <Row>
      <CardGroup>
        <Card>
          <Card.Header onClick={() => setCollapsed(!isCollapsed)}>
            <Card.Title>Selected</Card.Title>
          </Card.Header>
          <Collapse in={!isCollapsed}>
            <Card.Body>
              <Card.Text>MACHINES TABLE</Card.Text>
            </Card.Body>
          </Collapse>
        </Card>
      </CardGroup>
    </Row>
  );
};

export default Selected;
