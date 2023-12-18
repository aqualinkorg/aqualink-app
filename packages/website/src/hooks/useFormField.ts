import { useEffect, useReducer } from 'react';

import validators from 'helpers/validators';

export interface FormField<T extends string | boolean> {
  value: T;
  error?: string;
}

/**
 * Custom hook that handles the changes of a form textfield
 * @param initialValue - The textfield's initial value
 * @param checks - An array of validations for the textfield's value
 * @param draftValue - A value that is being manipulated by another component
 *                   and should be passed to the textfield as well
 * @param extraHandler - An action that might be executed after the textfield's
 *                     value is set
 */
export const useFormField = <T extends string | boolean>(
  initialValue: T,
  checks: (
    | 'required'
    | 'maxLength'
    | 'isInt'
    | 'isNumeric'
    | 'isLong'
    | 'isLat'
    | 'isEmail'
  )[],
  draftValue?: T,
  extraHandler?: (value: T) => void,
): [FormField<T>, (value: T, runExtraHandler?: boolean) => void] => {
  const reducer = (_state: FormField<T>, newValue: T): FormField<T> => ({
    value: newValue,
    error: checks
      .map((check) =>
        typeof newValue === 'boolean' ? undefined : validators[check](newValue),
      )
      .filter((error) => error)[0],
  });
  const [field, dispatch] = useReducer(reducer, { value: initialValue });

  useEffect(() => {
    if (draftValue !== undefined) {
      dispatch(draftValue);
    }
  }, [draftValue]);

  const handleFieldChange = (value: T, runExtraHandler = false) => {
    dispatch(value);
    if (extraHandler && runExtraHandler) {
      extraHandler(value);
    }
  };

  return [field, handleFieldChange];
};
