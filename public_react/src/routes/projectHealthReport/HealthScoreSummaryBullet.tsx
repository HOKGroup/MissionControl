import Collapse from "react-bootstrap/Collapse";
import ListGroup from "react-bootstrap/ListGroup";
import ListGroupItem from "react-bootstrap/ListGroupItem";

import useToggle from "../../hooks/useToggle";
import Badge, { BadgeColor } from "./Badge";

interface HealthReportSummaryBulletProps {
  title: string;
  color?: BadgeColor;
  text: string;
  description: string;
}

const HealthScoreSummaryBullet: React.FC<HealthReportSummaryBulletProps> = ({
  title,
  color,
  text,
  description
}) => {
  const [isCollapsed, toggleIsCollapsed] = useToggle();

  return (
    <ListGroup>
      <ListGroupItem action={true} onClick={toggleIsCollapsed}>
        {title}
        <Badge color={color}>{text}</Badge>
      </ListGroupItem>
      <Collapse in={isCollapsed}>
        <ListGroupItem>{description}</ListGroupItem>
      </Collapse>
    </ListGroup>
  );
};

export default HealthScoreSummaryBullet;
