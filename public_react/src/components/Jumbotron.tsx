import { ComponentProps } from "react";

const Jumbotron: React.FC<ComponentProps<"div">> = ({ children, ...props }) => {
  const className = [props.className, "bg-light p-5 my-5 rounded-lg"].join(" ");

  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

export default Jumbotron;
