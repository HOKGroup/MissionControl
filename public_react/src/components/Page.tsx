import { PropsWithChildren } from "react";
import Container from "react-bootstrap/Container";

import PageTitle from "./PageTitle";

interface PageProps {
  title: string;
  isLoading?: boolean;
}

const Page: React.FC<PropsWithChildren<PageProps>> = ({
  title,
  isLoading,
  children
}) => {
  return (
    <Container>
      <PageTitle title={title} isLoading={isLoading} />
      {children}
    </Container>
  );
};

export default Page;
