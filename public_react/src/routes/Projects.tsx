import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { LinkContainer } from "react-router-bootstrap";

interface Project {
  number: any;
  name: any;
  office: any;
  address: any;
}

const serverData = [
  {
    name: "My Project",
    number: "1",
    office: "My office",
    address: "MY address"
  },
  {
    name: "My Project",
    number: "2",
    office: "My office",
    address: "MY address"
  },
  {
    name: "My Project",
    number: "3",
    office: "My office",
    address: "MY address"
  },
  {
    name: "My Project",
    number: "4",
    office: "My office",
    address: "MY address"
  },
  {
    name: "My Project",
    number: "5",
    office: "My office",
    address: "MY address"
  },
  {
    name: "My Project",
    number: "6",
    office: "My office",
    address: "MY address"
  },
  {
    name: "My Project",
    number: "7",
    office: "My office",
    address: "MY address"
  },
  {
    name: "My Project",
    number: "8",
    office: "My office",
    address: "MY address"
  },
  {
    name: "My Project",
    number: "9",
    office: "My office",
    address: "MY address"
  }
];

const Projects: React.FC = () => {
  const [data, setData] = useState<Project[]>([]);

  return (
    <Container>
      <Row>
        <div className="page-header">
          <h1>Projects</h1>
        </div>
      </Row>
      <Row>TABLE HERE</Row>
      <Row>
        <LinkContainer to="/projects/add">
          <Button variant="primary" className="pull-right">
            <FontAwesomeIcon icon="plus" />
            New Project
          </Button>
        </LinkContainer>
      </Row>
    </Container>
  );
};

export default Projects;
