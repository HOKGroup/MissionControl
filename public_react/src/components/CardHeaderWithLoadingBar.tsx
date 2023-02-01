import CardHeader, { CardHeaderProps } from "react-bootstrap/CardHeader";

import LoadingBar from "./LoadingBar";

interface CardHeaderWithLoadingBarProps extends CardHeaderProps {
  isLoading: boolean;
}

const CardHeaderWithLoadingBar: React.FC<CardHeaderWithLoadingBarProps> = ({
  isLoading,
  children,
  ...props
}) => (
  <>
    <CardHeader {...props}>{children}</CardHeader>
    {isLoading && (
      <CardHeader className="p-0">
        <LoadingBar className="rounded-0" />
      </CardHeader>
    )}
  </>
);

export default CardHeaderWithLoadingBar;
