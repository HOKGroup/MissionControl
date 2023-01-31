import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PropsWithChildren } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import Circle from "../../components/Circle";
import useToggle from "../../hooks/useToggle";

interface HealthReportSummaryProps {
  title: string;
  description: string;
}

const HealthReportSummary: React.FC<
  PropsWithChildren<HealthReportSummaryProps>
> = ({ title, description, children }) => {
  const [showDetails, toggleShowDetails] = useToggle();

  return (
    <Row>
      <Col md={3}>
        <Circle size={120} style={{ backgroundColor: "red" }}>
          <div style={{ lineHeight: "1.2rem" }}>
            <div className="text text-center">PLACEHOLDER MiB</div>
            <div className="text text-center" style={{ lineHeight: "1.5rem" }}>
              Model Size
            </div>
          </div>
        </Circle>
      </Col>
      <Col md={showDetails ? 5 : 9}>
        <h4>
          {title}
          <div>
            {!showDetails && (
              <button className="fa-button" onClick={toggleShowDetails}>
                <FontAwesomeIcon icon="caret-right" size="lg" />
              </button>
            )}
            {showDetails && (
              <button className="fa-button" onClick={toggleShowDetails}>
                <FontAwesomeIcon icon="caret-down" size="lg" />
              </button>
            )}
          </div>
        </h4>
        <p className="small">{description}</p>
      </Col>
      {showDetails && <Col md={4}>{children}</Col>}
    </Row>
  );
};

export default HealthReportSummary;
