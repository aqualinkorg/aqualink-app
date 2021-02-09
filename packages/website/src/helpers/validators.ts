import isNumeric from "validator/lib/isNumeric";

export default {
  isNumeric: (value: string) => isNumeric(value),
  isLong: (value: string) =>
    isNumeric(value) && Math.abs(parseFloat(value)) <= 180,
  isLat: (value: string) =>
    isNumeric(value) && Math.abs(parseFloat(value)) <= 90,
};
