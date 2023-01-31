import Row from "react-bootstrap/Row";

interface PageTitleProps {
  title: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ title }) => {
  return (
    <Row>
      <div className="border-bottom pb-2 mt-4 mb-4 mx-0">
        <h1>{title}</h1>
      </div>
    </Row>
  );
};

export default PageTitle;
