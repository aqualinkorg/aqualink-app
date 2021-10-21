import { getWindDirection } from './math';

test('It calculates direction properly from velocity.', () => {
  // getWindDirection(windEastwardVelocity: number, windNorhwardVelocity)
  const eastWind = getWindDirection(-1, 0);
  expect(eastWind).toEqual(90);

  const northWind = getWindDirection(0, -1);
  expect(northWind).toEqual(0);
});
