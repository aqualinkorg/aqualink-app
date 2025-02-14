/* eslint-disable react-hooks/exhaustive-deps */
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import * as React from 'react';

let processing = false;
const queue: { key: string; value?: string }[] = [];

/**
 * To update the query string in the url, query params must change
 * synchronously, so there is no missing update. That is achieved by
 * adding key/value pairs into a 'queue' and then processing them one
 * by one. 'processing' is essentially a lock, locking 'processStack'
 * function right on entry and unlocking it just after 'search' is
 * updated with the new value.
 */
export const useQueryParam = (
  key: string,
  valid: (value: string) => boolean = () => true,
) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  const [value, setValue] = useState<string | undefined>(() => {
    // NOTE: IE does not support URLSearchParams
    const params = new URLSearchParams(search);
    return params.get(key) || undefined;
  });

  const processStack = () => {
    if (processing) return;
    processing = true;
    const item = queue.shift();
    if (!item) return;
    const { key: k, value: v } = item;
    const params = new URLSearchParams(search);
    const hasKey = params.has(k);
    if (hasKey) params.delete(k);
    if (v !== undefined) params.set(k, v);
    const newSearch = params.toString();
    if (search === newSearch) {
      processing = false;
      processStack();
      return;
    }
    router.push(`${pathname}?${newSearch}`);
  };

  useEffect(() => {
    queue.push({ key, value });
    processStack();
  }, [value]);

  useEffect(() => {
    processing = false;
    if (queue.length > 0) processStack();
  }, [search]);

  return [value && valid(value) ? value : undefined, setValue] as [
    string | undefined,
    React.Dispatch<React.SetStateAction<string | undefined>>,
  ];
};
