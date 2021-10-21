import { isNil, sum } from 'lodash';

export const getAverage = (numbers: number[], round = false) => {
  if (numbers.length === 0) {
    return undefined;
  }
  const average = sum(numbers) / numbers.length;
  return round ? Math.round(average) : average;
};

export const getMin = (numbers: number[]) => {
  return numbers.length > 0 ? Math.min(...numbers) : undefined;
};

export const getMax = (numbers: number[]) => {
  return numbers.length > 0 ? Math.max(...numbers) : undefined;
};

export const getWindSpeed = (
  windEastwardVelocity: number,
  windNorhwardVelocity: number,
) => {
  return (
    windNorhwardVelocity &&
    windEastwardVelocity &&
    Math.sqrt(windNorhwardVelocity ** 2 + windEastwardVelocity ** 2)
  );
};

export const getWindDirection = (
  windEastwardVelocity: number,
  windNorhwardVelocity: number,
) => {
  const degree =
    windNorhwardVelocity &&
    windEastwardVelocity &&
    -(Math.atan2(windEastwardVelocity, windNorhwardVelocity) * 180) / Math.PI;

  if (isNil(degree)) {
    return null
  }
  return degree >= 0 ? degree : degree + 360;
};
