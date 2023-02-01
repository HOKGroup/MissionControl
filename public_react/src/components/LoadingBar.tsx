import { useCallback, useEffect, useState } from "react";
import ProgressBar, { ProgressBarProps } from "react-bootstrap/ProgressBar";

interface LoadingBarProps {
  increment?: number;
  interval?: number;
}

const LoadingBar: React.FC<LoadingBarProps & ProgressBarProps> = ({
  increment: propsIncrement,
  interval: propsInterval,
  ...progressBarProps
}) => {
  const [now, setNow] = useState(0);

  const increment = propsIncrement || 10;
  const interval = propsInterval || 200;

  const updateNow = useCallback(
    () => setNow((now) => Math.min(now + increment, 95)),
    [increment]
  );

  useEffect(() => {
    const intervalId = setInterval(updateNow, interval);
    return () => clearInterval(intervalId);
  }, [interval, updateNow]);

  return <ProgressBar now={now} striped={true} {...progressBarProps} />;
};

export default LoadingBar;
