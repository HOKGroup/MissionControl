import { useEffect } from "react";
import { toast } from "react-toastify";

const useToastError = (err: Error | null) => {
  useEffect(() => {
    !!err && toast.error(err.message);
  }, [err]);
};

export { useToastError };
