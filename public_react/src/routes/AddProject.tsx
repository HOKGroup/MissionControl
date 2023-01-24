import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import DropdownMenu from "react-bootstrap//DropdownMenu";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Feedback from "react-bootstrap/Feedback";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

import Title from "./addProject/Title";

type ProjectName = string | null;
type ProjectNumber = string | null;

const AddProject: React.FC = () => {
  const [projectName, setProjectName] = useState(null as ProjectName);
  const [projectNumber, setProjectNumber] = useState(null as ProjectNumber);

  return (
    <Container>
      <Title projectName={projectName} projectNumber={projectNumber} />
      <Row>
        <Form>
          <Card>
            <Card.Header>
              <Card.Title>Project Info</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group>
                  <Form.Label>
                    Project Number
                    <Button>
                      <FontAwesomeIcon icon="check" color="green" size="sm" />
                    </Button>
                    <Button>
                      <FontAwesomeIcon icon="asterisk" size="sm" color="red" />
                    </Button>
                  </Form.Label>
                  <Col>
                    <Form.Control
                      type="text"
                      onChange={(evt) => setProjectNumber(evt.target.value)}
                    ></Form.Control>
                  </Col>
                </Form.Group>
                <Form.Group>
                  <Form.Label>
                    Project Name
                    <Button>
                      <FontAwesomeIcon icon="check" color="green" size="sm" />
                    </Button>
                    <Button>
                      <FontAwesomeIcon icon="asterisk" color="red" size="sm" />
                    </Button>
                  </Form.Label>
                  <Col sm="9" className="no-padding-right">
                    <Form.Control
                      required
                      type="text"
                      placeholder="Project Name"
                      onChange={(evt) => setProjectName(evt.target.value)}
                    />
                    <Form.Control.Feedback>
                      (*) Project Name is required.
                    </Form.Control.Feedback>
                    {projectName && projectName.length > 35 && (
                      <div>
                        <Form.Control.Feedback
                          type="invalid"
                          className="text-danger"
                        >
                          (*) Project Name is too long.
                        </Form.Control.Feedback>
                      </div>
                    )}
                  </Col>
                </Form.Group>
                <Form.Group>
                  <Form.Label>
                    Office
                    {projectName && (
                      <Button>
                        <FontAwesomeIcon icon="check" color="green" size="sm" />
                      </Button>
                    )}
                    {!projectName && (
                      <Button>
                        <FontAwesomeIcon
                          icon="asterisk"
                          color="red"
                          size="sm"
                        />
                      </Button>
                    )}
                  </Form.Label>
                  <Col>
                    <ButtonGroup>
                      <Button></Button>
                      <DropdownMenu></DropdownMenu>
                    </ButtonGroup>
                  </Col>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Street Address</Form.Label>
                  <Col>
                    <Form.Control type="text"></Form.Control>
                  </Col>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Street Address2</Form.Label>
                  <Col>
                    <Form.Control type="text"></Form.Control>
                  </Col>
                </Form.Group>
                <Form.Group>
                  <Form.Label>City</Form.Label>
                </Form.Group>
                <Form.Group>
                  <Form.Label>State</Form.Label>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Zip Code</Form.Label>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Country</Form.Label>
                </Form.Group>
              </Form>
              <Button type="submit" variant="primary" className="pull-right">
                <FontAwesomeIcon icon="plus" />
                Add Project
              </Button>
              <Button variant="secondary" className="pull-right">
                Cancel
              </Button>
            </Card.Body>
          </Card>
        </Form>
      </Row>
    </Container>
  );
};

export default AddProject;
