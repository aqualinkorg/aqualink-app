import { getWindDirection } from './math';

test('It calculates direction properly from velocity.', () => {
  // getWindDirection(windEastwardVelocity: number, windNorhwardVelocity)
  const eastWind = getWindDirection(-1, 0);
  expect(eastWind).toEqual(270);

  const northWind = getWindDirection(0, -1);
  expect(northWind).toEqual(180);

  const northEastWind = getWindDirection(-1, -1);
  expect(northEastWind).toEqual(225);
});
