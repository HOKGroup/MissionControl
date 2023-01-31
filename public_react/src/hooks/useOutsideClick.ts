import { RefObject, useEffect } from "react";

const useOutsideClicks = (
  callback: () => unknown,
  ref: RefObject<HTMLElement> | null
) => {
  useEffect(() => {
    if (!ref) return;

    function handleClickOutside(event: MouseEvent) {
      if (ref?.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [callback, ref]);
};

export default useOutsideClicks;
