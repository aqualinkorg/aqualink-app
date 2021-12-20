import { useLocation } from "react-router-dom";

export const useQueryParams = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  return (key: string) => params.get(key) || undefined;
};
