import Row from "react-bootstrap/Row";

interface TitleProps {
  projectName: string | undefined;
  projectNumber: string | undefined;
}

const Title: React.FC<TitleProps> = ({ projectName, projectNumber }) => {
  return (
    <Row>
      <div className="page-header">
        {(projectName !== null || projectNumber !== null) && (
          <h1>
            {projectNumber} {projectName}
          </h1>
        )}
        {projectName === null && projectNumber === null && <h1>New Project</h1>}
      </div>
    </Row>
  );
};

export default Title;
