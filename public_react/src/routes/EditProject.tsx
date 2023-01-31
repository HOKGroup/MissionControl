import Page from "components/Page";
import { useParams } from "react-router";

const EditProject: React.FC = () => {
  const { id: projectId } = useParams();

  return (
    <Page title="PROJECT PLACEHOLDER TITLE">
      <div>{projectId}</div>
    </Page>
  );
};

export default EditProject;
