import { isNumber, isNaN } from "lodash";

export function formatNumber(n?: number | null, decimal = 0) {
  return isNumber(n) && !isNaN(n) ? n.toFixed(decimal) : "- -";
}

export function isPositiveNumber(arg?: number) {
  return isNumber(arg) && arg > 0;
}
