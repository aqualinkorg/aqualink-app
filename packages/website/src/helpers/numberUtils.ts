import { isNumber, isNaN } from 'lodash';

export function formatNumber(n?: number | null, decimal = 0) {
  return isNumber(n) && !isNaN(n) ? n.toFixed(decimal) : '- -';
}

export function isPositiveNumber(arg?: number) {
  return isNumber(arg) && arg > 0;
}

export function invertDirection(direction: number | undefined) {
  if (!isNumber(direction)) {
    return undefined;
  }
  return (direction + 180) % 360;
}
