import { sum } from 'lodash';

export const getAverage = (numbers: number[], round = false) => {
  const average =
    numbers.length > 0 ? sum(numbers) / numbers.length : undefined;
  return average !== undefined && round ? Math.round(average) : average;
};

export const getMin = (numbers: number[]) => {
  return numbers.length > 0 ? Math.min(...numbers) : undefined;
};

export const getMax = (numbers: number[]) => {
  return numbers.length > 0 ? Math.max(...numbers) : undefined;
};
