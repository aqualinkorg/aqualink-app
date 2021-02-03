import { useEffect, useState } from "react";
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
    value.length > 50 ? "Must not exceed 50 characters" : undefined,
  isInt: (value: string) => (!isInt(value) ? "Must be an integer" : undefined),
  isNumeric: (value: string) =>
    !isNumeric(value) ? "Must be numeric" : undefined,
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
  initialValue: string,
  checks: ("required" | "maxLength" | "isInt" | "isNumeric")[],
  draftValue?: string,
  extraHandler?: (value: string) => void
): [FormField, (value: string, runExtraHandler?: boolean) => void] => {
  const [field, setField] = useState<FormField>({ value: initialValue });

  useEffect(() => {
    if (draftValue) {
      setField({
        value: draftValue,
        error: checks
          .map((check) => validations[check](draftValue))
          .filter((error) => error)[0],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftValue]);

  const handleFieldChange = (value: string, runExtraHandler?: boolean) => {
    const errors = checks
      .map((check) => validations[check](value))
      .filter((error) => error);
    setField({ value, error: errors[0] });
    if (extraHandler && runExtraHandler) {
      extraHandler(value);
    }
  };

  return [field, handleFieldChange];
};
