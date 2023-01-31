import { useCallback, useState } from "react";

const useToggle = (initialValue = false): [boolean, () => void] => {
  const [value, setValue] = useState(initialValue);

  const toggleValue = useCallback(() => setValue((val) => !val), []);

  return [value, toggleValue];
};

export default useToggle;
