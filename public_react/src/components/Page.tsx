import { PropsWithChildren } from "react";
import Container from "react-bootstrap/Container";

import PageTitle from "./PageTitle";

interface PageProps {
  title: string;
}

const Page: React.FC<PropsWithChildren<PageProps>> = ({ title, children }) => {
  return (
    <Container>
      <PageTitle title={title} />
      {children}
    </Container>
  );
};

export default Page;
