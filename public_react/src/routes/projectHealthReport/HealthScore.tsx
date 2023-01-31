import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PropsWithChildren } from "react";
import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/CardGroup";
import CardHeader from "react-bootstrap/CardHeader";

import HealthScoreSummary from "./HealthScoreSummary";

interface HealthScoreProps {
  name: string;
  title: string;
  description: string;
}

const HealthScore: React.FC<PropsWithChildren<HealthScoreProps>> = ({
  name,
  title,
  description,
  children
}) => {
  return (
    <CardGroup>
      <Card>
        <CardHeader>
          {name} Health Score:
          <button className="fa-button">
            <FontAwesomeIcon icon="cog" spin={true} />
          </button>
        </CardHeader>
        <Card.Body>
          <HealthScoreSummary title={title} description={description}>
            {children}
          </HealthScoreSummary>
        </Card.Body>
      </Card>
    </CardGroup>
  );
};

export default HealthScore;
