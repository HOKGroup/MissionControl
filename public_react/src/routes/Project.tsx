import Page from "components/Page";
import { useParams } from "react-router";

const Project: React.FC = () => {
  const { id: projectId } = useParams();

  return (
    <Page title="PROJECT PLACEHOLDER TITLE">
      <div>{projectId}</div>
    </Page>
  );
};

export default Project;
