import { ZombieLog } from "api/schema/zombieLogs";
import LoadingBar from "components/LoadingBar";
import useToggle from "hooks/useToggle";
import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/CardGroup";
import Collapse from "react-bootstrap/Collapse";
import Row from "react-bootstrap/Row";

import MachinesTable from "./MachinesTable";

interface SelectedProps {
  isLoading: boolean;
  selectedMachines: ZombieLog[] | null;
  machineUsers: Record<string, string> | undefined;
}

const Selected: React.FC<SelectedProps> = ({
  isLoading,
  selectedMachines,
  machineUsers
}) => {
  const [isCollapsed, toggleCollapsed] = useToggle();

  return (
    <Row>
      <CardGroup>
        <Card>
          <Card.Header onClick={toggleCollapsed}>
            <Card.Title>Selected</Card.Title>
          </Card.Header>
          <Collapse in={!isCollapsed}>
            <Card.Body>
              {isLoading && <LoadingBar />}
              {machineUsers && (
                <MachinesTable
                  selectedMachines={selectedMachines || []}
                  machineUsers={machineUsers}
                />
              )}
            </Card.Body>
          </Collapse>
        </Card>
      </CardGroup>
    </Row>
  );
};

export default Selected;
