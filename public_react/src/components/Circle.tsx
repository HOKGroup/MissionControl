import { PropsWithChildren } from "react";

type DivProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

interface CircleProps {
  size: number;
}

type CirclePropsWithChildren = PropsWithChildren<CircleProps & DivProps>;

const Circle: React.FC<CirclePropsWithChildren> = ({
  size,
  style,
  children,
  ...props
}) => {
  const divStyle = {
    ...(style || {}),
    width: size,
    height: size
  };

  return (
    <div
      className="rounded-circle d-flex align-items-center justify-content-center"
      style={divStyle}
      {...props}
    >
      {children}
    </div>
  );
};

export default Circle;
