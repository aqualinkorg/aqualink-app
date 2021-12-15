import { getWindDirection } from './math';

test('It calculates direction properly from velocity.', () => {
  // We use the meteorological convention - the direction the wind is "COMING FROM".
  // getWindDirection(windEastwardVelocity: number, windNorhwardVelocity)
  const eastWindDirection = getWindDirection(-1, 0);
  expect(eastWindDirection).toEqual(90);

  const northWindDirection = getWindDirection(0, -1);
  expect(northWindDirection).toEqual(0);

  const northEastWindDirection = getWindDirection(-1, -1);
  expect(northEastWindDirection).toEqual(45);

  const northWestWindDirection = getWindDirection(1, -1);
  expect(northWestWindDirection).toEqual(315);
});
