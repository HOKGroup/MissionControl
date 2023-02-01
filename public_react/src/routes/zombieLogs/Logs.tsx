import { ZombieLog } from "api/schema/zombieLogs";
import CardHeaderWithLoadingBar from "components/CardHeaderWithLoadingBar";
import useToggle from "hooks/useToggle";
import { useCallback } from "react";
import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/CardGroup";
import Collapse from "react-bootstrap/Collapse";
import Row from "react-bootstrap/Row";

import LogsFilter from "./logs/LogsFilter";
import LogsTable from "./logs/LogsTable";

type Office = {
  name: string;
  code: string;
};

interface LogsProps {
  offices: { name: string; code: string[] }[] | undefined;
  officesIsLoading: boolean;
  dateFrom: Date;
  dateTo: Date;
  setDateFrom: (date: Date) => void;
  setDateTo: (date: Date) => void;
  selectedOffice: Office;
  setSelectedOffice: (selectedOffice: Office) => void;
  fetchFilteredZombieLogs: () => void;
  isLoadingFilteredZombieLogs: boolean;
  zombieLogs: ZombieLog[] | undefined;
  isLoadingZombieLogs: boolean;
  isLoadingUsers: boolean;
  machineUsers: Record<string, string> | undefined;
}

const Logs: React.FC<LogsProps> = ({
  offices,
  officesIsLoading,
  dateFrom,
  dateTo,
  setDateFrom,
  setDateTo,
  selectedOffice,
  setSelectedOffice,
  fetchFilteredZombieLogs,
  isLoadingZombieLogs,
  isLoadingFilteredZombieLogs,
  isLoadingUsers,
  zombieLogs,
  machineUsers
}) => {
  const isLoading =
    isLoadingZombieLogs || isLoadingFilteredZombieLogs || isLoadingUsers;

  const [isCollapsed, toggleCollapsed] = useToggle();

  const setDateFromCb = useCallback(
    (date: Date | undefined) => {
      if (!date) return;
      setDateFrom(date);
    },
    [setDateFrom]
  );

  const setDateToCb = useCallback(
    (date: Date | undefined) => {
      if (!date) return;
      setDateTo(date);
    },
    [setDateTo]
  );
  const onSelectOffice = useCallback(
    (officeName: string | null) => {
      if (!officeName) {
        setSelectedOffice({
          name: "All",
          code: "All"
        });

        return;
      }

      const splitName = officeName.split(":");
      if (splitName.length === 2) {
        const name = splitName[0];
        const code = splitName[1];

        setSelectedOffice({ name, code });
      }
    },
    [setSelectedOffice]
  );

  return (
    <Row>
      <CardGroup className="pb-4">
        <Card>
          <CardHeaderWithLoadingBar
            isLoading={isLoading}
            onClick={toggleCollapsed}
          >
            <Card.Title>Logs</Card.Title>
          </CardHeaderWithLoadingBar>
          <Collapse in={!isCollapsed}>
            <Card.Body>
              {zombieLogs && (
                <>
                  <LogsFilter
                    dateTo={dateTo}
                    dateFrom={dateFrom}
                    setDateTo={setDateToCb}
                    setDateFrom={setDateFromCb}
                    selectedOffice={selectedOffice}
                    onSelectOffice={onSelectOffice}
                    officesIsLoading={officesIsLoading}
                    offices={offices}
                    fetchFilteredZombieLogs={fetchFilteredZombieLogs}
                    isLoadingFilteredZombieLogs={isLoadingFilteredZombieLogs}
                  />
                  <Row>
                    {zombieLogs && machineUsers && (
                      <LogsTable
                        zombieLogs={zombieLogs}
                        machineUsers={machineUsers}
                      />
                    )}
                  </Row>
                </>
              )}
            </Card.Body>
          </Collapse>
        </Card>
      </CardGroup>
    </Row>
  );
};

export default Logs;
