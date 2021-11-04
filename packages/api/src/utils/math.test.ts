import { getWindDirection } from './math';

test('It calculates direction properly from velocity.', () => {
  // For SOFAR windDirection represents the direction the wind is GOING TO.
  // getWindDirection(windEastwardVelocity: number, windNorhwardVelocity)
  const eastWindDirection = getWindDirection(-1, 0);
  expect(eastWindDirection).toEqual(270);

  const northWindDirection = getWindDirection(0, -1);
  expect(northWindDirection).toEqual(180);

  const northEastWindDirection = getWindDirection(-1, -1);
  expect(northEastWindDirection).toEqual(225);
});
