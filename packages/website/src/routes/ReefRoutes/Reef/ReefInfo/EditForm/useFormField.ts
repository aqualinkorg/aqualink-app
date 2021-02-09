import { useEffect, useReducer } from "react";
import isInt from "validator/lib/isInt";
import isNumeric from "validator/lib/isNumeric";

export interface FormField {
  value: string;
  error?: string;
}

const validations = {
  required: (value: string) =>
    value === "" || value === "NaN" ? "Required field" : undefined,
  maxLength: (value: string) =>
    value.length > 100 ? "Must not exceed 100 characters" : undefined,
  isInt: (value: string) => (!isInt(value) ? "Must be an integer" : undefined),
  isNumeric: (value: string) =>
    !isNumeric(value) ? "Must be numeric" : undefined,
  isLat: (value: string) =>
    !isNumeric(value) || Math.abs(parseFloat(value)) > 90
      ? "Invalid latitude value"
      : undefined,
  isLong: (value: string) =>
    !isNumeric(value) || Math.abs(parseFloat(value)) > 180
      ? "Invalid longitude value"
      : undefined,
};

/**
 * Custom hook that handles the changes of a form textfield
 * @param initialValue - The textfield's initial value
 * @param checks - An array of validations for the textfield's value
 * @param draftValue - A value that is being manipulated by another component
 *                   and should be passed to the textfield as well
 * @param extraHandler - An action that might be executed after the textfield's
 *                     value is set
 */
export const useFormField = (
  initialValue: string | null | undefined,
  checks: (
    | "required"
    | "maxLength"
    | "isInt"
    | "isNumeric"
    | "isLong"
    | "isLat"
  )[],
  draftValue?: string,
  extraHandler?: (value: string) => void
): [FormField, (value: string, runExtraHandler?: boolean) => void] => {
  const reducer = (_state: FormField, newValue: string): FormField => ({
    value: newValue,
    error: checks
      .map((check) => validations[check](newValue))
      .filter((error) => error)[0],
  });
  const [field, dispatch] = useReducer(reducer, { value: initialValue || "" });

  useEffect(() => {
    if (draftValue) {
      dispatch(draftValue);
    }
  }, [draftValue]);

  const handleFieldChange = (value: string, runExtraHandler = false) => {
    dispatch(value);
    if (extraHandler && runExtraHandler) {
      extraHandler(value);
    }
  };

  return [field, handleFieldChange];
};
