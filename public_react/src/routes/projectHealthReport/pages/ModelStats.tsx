import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import useToggle from "../../../hooks/useToggle";
import HealthScore from "../HealthScore";
import HealthScoreSummaryBullet from "../HealthScoreSummaryBullet";

interface ModelStatsProps {
  modelSize: string;
  avgOpenTime: string;
  avgSynchTime: string;
}

const ModelStats: React.FC<ModelStatsProps> = ({
  modelSize,
  avgOpenTime,
  avgSynchTime
}) => {
  const [showTimeSettings, _toggleShowTimeSettings] = useToggle();

  return (
    <Container fluid={true}>
      {showTimeSettings && (
        <Row>
          <div>TIME RANGE SELECTION</div>
        </Row>
      )}
      <Row>
        <HealthScore
          name="Model"
          title="Model"
          description={
            "There are a few simple measurements that we can use to judge model speed and responsiveness. " +
            "The good rule of thumb is to keep the model size smaller than 200Mb and that will help increase both " +
            "open and synch times. Model size is also a good early indicator that something bad has happened to " +
            "the model - it's size can increase significantly if we link and/or explode DWG/STL content."
          }
        >
          <>
            <HealthScoreSummaryBullet
              title="Model Size"
              text={modelSize}
              description={
                "It's best practice to keep the model size under 200MB. It helps preserve your " +
                "hardware resources, and potentially increase model open and synch times. Model Size is often a " +
                "good indicator of potential modeling issues. Use of imported objects like DWG or STL often bloats " +
                "model size giving Model Managers clues about potential issues."
              }
            />
            <HealthScoreSummaryBullet
              title="Average Open Time"
              text={avgOpenTime}
              description={
                "This is not a measure of model health, but rather a glance at potential user " +
                '"discomfort". Users tend to get frustrated at time lost, while waiting for the model to open. ' +
                "If we can minimize that time, they will be able to spend it doing more meaningful things, " +
                "than waiting for Revit to open. Potential ways to speed up the model opening time, is to " +
                "minimize amount of plug-ins that are being loaded at startup."
              }
            />
            <HealthScoreSummaryBullet
              title="Average Synch Time"
              text={avgSynchTime}
              description={
                "This is not a measure of model health, but rather a glance at potential user " +
                '"discomfort". Users tend to get frustrated at time lost, while waiting for the model to synch. ' +
                "Synch time can be decreased by reducing number of warnings in the model, model size, number " +
                "of links etc. All of these things contribute to time that is being needed by Revit to reconcile " +
                "all of the changes. Another quick way to minimize synch time, is to Reload Latest before Synchronizing."
              }
            />
          </>
        </HealthScore>
      </Row>
    </Container>
  );
};

export default ModelStats;
