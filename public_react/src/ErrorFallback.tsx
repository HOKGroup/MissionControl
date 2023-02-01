import Jumbotron from "components/Jumbotron";
import Button from "react-bootstrap/Button";
import { FallbackProps } from "react-error-boundary";

const ErrorFallback: React.FC<FallbackProps> = ({ resetErrorBoundary }) => (
  <Jumbotron>
    <h1>Something went wrong.</h1>
    <Button size="lg" onClick={resetErrorBoundary}>
      Try again
    </Button>
  </Jumbotron>
);

export default ErrorFallback;
