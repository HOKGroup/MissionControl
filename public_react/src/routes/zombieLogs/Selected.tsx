import { useState } from "react";
import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/CardGroup";
import Collapse from "react-bootstrap/Collapse";
import Row from "react-bootstrap/Row";

import { ZombieLog } from "../../api/schema/zombieLogs";
import MachinesTable from "./MachinesTable";

interface SelectedProps {
  selectedMachines: ZombieLog[];
  users: Record<string, string>;
}

const Selected: React.FC<SelectedProps> = ({ selectedMachines, users }) => {
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
              <MachinesTable
                selectedMachines={selectedMachines}
                users={users}
              />
            </Card.Body>
          </Collapse>
        </Card>
      </CardGroup>
    </Row>
  );
};

export default Selected;
