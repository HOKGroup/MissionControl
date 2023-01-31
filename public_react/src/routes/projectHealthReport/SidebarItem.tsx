import { useCallback } from "react";
import ListGroupItem from "react-bootstrap/ListGroupItem";

import { HealthReportPage } from "../ProjectHealthReport";
import Badge, { BadgeColor } from "./Badge";

interface SidebarItemProps {
  name: string;
  scoreData: {
    passingChecks: number;
    newMax: number;
  };
  color?: BadgeColor;
  page: HealthReportPage;
  activePage: HealthReportPage;
  setPage: (page: HealthReportPage) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  name,
  scoreData,
  color,
  page,
  activePage,
  setPage
}) => {
  const { passingChecks, newMax } = scoreData;

  const handleClick = useCallback(() => {
    setPage(page);
  }, [page, setPage]);

  return (
    <ListGroupItem
      variant="light"
      action={true}
      onClick={handleClick}
      active={page === activePage}
    >
      {name}
      <Badge color={color}>
        {passingChecks > newMax ? "N" : passingChecks}
        {"/"}
        {passingChecks > newMax ? "A" : newMax}
      </Badge>
    </ListGroupItem>
  );
};

export default SidebarItem;
