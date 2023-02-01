import { ZombieLog } from "api/schema/zombieLogs";
import CardHeaderWithLoadingBar from "components/CardHeaderWithLoadingBar";
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
          <CardHeaderWithLoadingBar
            isLoading={isLoading}
            onClick={toggleCollapsed}
          >
            <Card.Title>Selected</Card.Title>
          </CardHeaderWithLoadingBar>
          <Collapse in={!isCollapsed}>
            <Card.Body>
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
