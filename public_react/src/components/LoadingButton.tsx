import { PropsWithChildren } from "react";
import Button, { ButtonProps } from "react-bootstrap/Button";

interface LoadingButtonProps extends PropsWithChildren<ButtonProps> {
  isLoading: boolean;
  onClick: () => void;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  onClick,
  children,
  ...props
}) => {
  return (
    <Button
      disabled={isLoading}
      onClick={!isLoading ? onClick : undefined}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </Button>
  );
};

export default LoadingButton;
