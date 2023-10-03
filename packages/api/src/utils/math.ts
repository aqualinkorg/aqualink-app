import { sum } from 'lodash';

export const getAverage = (numbers: number[], round = false) => {
  if (numbers.length === 0) {
    return undefined;
  }
  const average = sum(numbers) / numbers.length;
  return round ? Math.round(average) : average;
};

export const getMax = (numbers: number[]) => {
  return numbers.length > 0 ? Math.max(...numbers) : undefined;
};

export const getWindSpeed = (
  windEastwardVelocity: number,
  windNorhwardVelocity: number,
) => {
  return Math.sqrt(windNorhwardVelocity ** 2 + windEastwardVelocity ** 2);
};

export const getWindDirection = (
  windEastwardVelocity: number,
  windNorhwardVelocity: number,
) => {
  const degree =
    -(Math.atan2(windNorhwardVelocity, windEastwardVelocity) * 180) / Math.PI -
    90;

  return degree >= 0 ? degree : degree + 360;
};
