import ErrorFallback from "ErrorFallback";
import Container from "react-bootstrap/Container";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LayoutNavbar from "./layout/Navbar";

const Layout: React.FC = () => {
  return (
    <>
      <LayoutNavbar />
      <Container id="main-content-container" className="pb-5">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Outlet />
        </ErrorBoundary>
        <ToastContainer
          position="top-right"
          closeButton={true}
          autoClose={4_000}
          newestOnTop={true}
        />
      </Container>
      <footer className="footer">
        <Container>
          <p className="text-muted">Copyright &copy; HOK Group 2023</p>
        </Container>
      </footer>
    </>
  );
};

export default Layout;
