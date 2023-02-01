import Jumbotron from "components/Jumbotron";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { LinkContainer } from "react-router-bootstrap";

const Home: React.FC = () => {
  return (
    <Container>
      <Row>
        <Jumbotron>
          <h1>HOK Mission Control</h1>
          <p>
            This web application has ability to interact with Revit Projects.{" "}
            <br />
            It helps to manage project specific settings and review model state.
          </p>
          <p>
            <LinkContainer to="/projects">
              <Button size="lg" variant="primary">
                View Projects &raquo;
              </Button>
            </LinkContainer>
          </p>
        </Jumbotron>
      </Row>
    </Container>
  );
};

export default Home;
