import isNumeric from 'validator/lib/isNumeric';
import isInt from 'validator/lib/isInt';
import isEmail from 'validator/lib/isEmail';

export default {
  required: (value: string) =>
    value !== '' && value !== 'NaN' ? undefined : 'Required field',
  maxLength: (value: string) =>
    value.length <= 100 ? undefined : 'Must not exceed 100 characters',
  isInt: (value: string) => (isInt(value) ? undefined : 'Must be an integer'),
  isNumeric: (value: string) =>
    isNumeric(value) ? undefined : 'Must be numeric',
  isLong: (value: string) =>
    isNumeric(value) && Math.abs(parseFloat(value)) <= 180
      ? undefined
      : 'Enter a valid longitude between -180 and 180',
  isLat: (value: string) =>
    isNumeric(value) && Math.abs(parseFloat(value)) <= 90
      ? undefined
      : 'Enter a valid latitude between -90 and 90',
  isEmail: (value: string) =>
    isEmail(value) ? undefined : 'Enter a valid email',
};
