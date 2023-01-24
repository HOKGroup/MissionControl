import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Navbar from "react-bootstrap/Navbar";
import { LinkContainer } from "react-router-bootstrap";

const LayoutNavbar: React.FC = () => {
  return (
    <Navbar>
      <Container>
        <Navbar.Toggle aria-controls="navbar-collapse">
          <span className="sr-only">Toggle navigation</span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
        </Navbar.Toggle>
        <Navbar.Brand>HOK Mission Control</Navbar.Brand>
        <Navbar.Collapse id="navbar-collapse">
          <Nav>
            <LinkContainer to="/home">
              <Nav.Link>Home</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/settings">
              <Nav.Link>Settings</Nav.Link>
            </LinkContainer>
            <NavDropdown title="Manage">
              <LinkContainer to="/projects">
                <NavDropdown.Item>Projects</NavDropdown.Item>
              </LinkContainer>
              <NavDropdown.Divider />
              <LinkContainer to="/file-paths">
                <NavDropdown.Item>Files</NavDropdown.Item>
              </LinkContainer>
            </NavDropdown>
            <NavDropdown title="Addins">
              <LinkContainer to="/addins">
                <NavDropdown.Item>Revit Addins</NavDropdown.Item>
              </LinkContainer>
              <NavDropdown.Divider />
              <LinkContainer to="/zombie-logs">
                <NavDropdown.Item>Zombie Logs</NavDropdown.Item>
              </LinkContainer>
            </NavDropdown>
          </Nav>
          <Nav className="ms-auto">
            <Nav.Link href="http://www.hok.com/">
              <img
                src="images/hoklogo.ico"
                height="32"
                width="32"
                style={{ marginTop: 0 }}
                alt="HOK"
              ></img>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default LayoutNavbar;
