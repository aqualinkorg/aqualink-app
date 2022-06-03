/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable fp/no-mutating-methods */
/* eslint-disable fp/no-mutation */
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";

let processing = false;
const stack: { key: string; value?: string }[] = [];

export const useQueryParam = (
  key: string,
  valid: (value: string) => boolean = () => true
) => {
  const { search } = useLocation();
  const history = useHistory();
  const [value, setValue] = useState<string | undefined>(() => {
    const params = new URLSearchParams(search);
    return params.get(key) || undefined;
  });

  const processStack = () => {
    if (processing) return;
    processing = true;
    const item = stack.pop();
    if (!item) return;
    const { key: k, value: v } = item;
    const withoutQuestionMark = search.substring(1);
    const params = withoutQuestionMark.split("&");
    const index = params.findIndex((x) => x.startsWith(k));
    if (v === undefined && index > -1) {
      params.splice(index, 1);
    } else if (v !== undefined && index > -1) {
      const prevValue = params[index];
      const newValue = prevValue.split("=");
      newValue[1] = v;
      params[index] = newValue.join("=");
    } else if (v !== undefined && index < 0) {
      params.push(`${k}=${v}`);
    }
    const newSearch = `?${params.filter((x) => x !== "").join("&")}`;
    if (search === newSearch) {
      processing = false;
      return;
    }
    history.push({
      search: newSearch,
    });
  };

  useEffect(() => {
    stack.push({ key, value });
    processStack();
  }, [value]);

  useEffect(() => {
    processing = false;
    if (stack.length > 0) processStack();
  }, [search]);

  return [value && valid(value) ? value : undefined, setValue] as [
    string | undefined,
    React.Dispatch<React.SetStateAction<string | undefined>>
  ];
};
