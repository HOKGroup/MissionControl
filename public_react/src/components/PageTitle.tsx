import Row from "react-bootstrap/Row";

import LoadingBar from "./LoadingBar";

interface PageTitleProps {
  title: string;
  isLoading?: boolean;
}

const PageTitle: React.FC<PageTitleProps> = ({ title, isLoading }) => {
  return (
    <Row className="mb-4">
      <div className="border-bottom pb-2 mt-4 mx-0">
        <h1>{title}</h1>
      </div>
      {isLoading && <LoadingBar className="border-top mb-4 px-0" />}
    </Row>
  );
};

export default PageTitle;
