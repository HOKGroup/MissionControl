import { PropsWithChildren } from "react";
import BBadge, { BadgeProps as BBadgeProps } from "react-bootstrap/Badge";

const colorClassNames = {
  red: "danger",
  orange: "warning",
  green: "success"
};

export enum BadgeColor {
  Red = "red",
  Orange = "orange",
  Green = "green"
}

interface BadgeProps {
  color?: BadgeColor;
}

const Badge: React.FC<PropsWithChildren<BadgeProps & BBadgeProps>> = ({
  color,
  children,
  ...props
}) => {
  const bg = color ? colorClassNames[color] : "light";
  const text = bg === "light" ? "dark" : undefined;

  return (
    <BBadge
      bg={bg}
      text={text}
      style={{ opacity: 1, float: "right" }}
      {...props}
    >
      {children}
    </BBadge>
  );
};

export default Badge;
