import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ColumnDef } from "@tanstack/react-table";
import { apiHooks } from "api/api";
import { Project } from "api/schema/projects";
import Datatable from "components/Datatable";
import Page from "components/Page";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { useNavigate } from "react-router";
import { LinkContainer } from "react-router-bootstrap";

const Projects: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: projectsData,
    isLoading: _projectsDataIsLoading,
    error: _projectsError
  } = apiHooks.useGetProjects();

  const columns: ColumnDef<Project>[] = [
    {
      header: "Project Number",
      accessorKey: "number"
    },
    {
      header: "Project Name",
      accessorKey: "name"
    },
    {
      header: "Office",
      accessorKey: "office"
    },
    {
      header: "Project Address",
      accessorFn: (row) =>
        `${row.address?.city || ""}, ${row.address?.state || ""}`
    }
  ];
  return (
    <Page title="Projects">
      <Row>
        <Datatable
          initialPageSize={25}
          allowedPageSizes={[25, 50, 100, -1]}
          columns={columns}
          data={projectsData || []}
          onClickRow={(row) => {
            navigate(`/projects/edit/${row.original._id}`);
          }}
        />
      </Row>
      <Row className="pt-4">
        <Col md={9} />
        <Col md={3}>
          <LinkContainer to="/projects/add">
            <Button variant="primary" className="float-end">
              <FontAwesomeIcon icon="plus" />
              New Project
            </Button>
          </LinkContainer>
        </Col>
      </Row>
    </Page>
  );
};

export default Projects;
