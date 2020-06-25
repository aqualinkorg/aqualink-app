import { calculateDegreeHeatingDays } from './temperature';

// Mock functions
function getSeaSurfaceTemperatures(reefID: number) {
  return Array.from(Array(reefID), (_, index) => index);
}

function getMaximumMonthlyMean(reefID: number) {
  return 27.5 + reefID;
}

test('Not enough SST.', () => {
  const seaSurfaceTemperatures = getSeaSurfaceTemperatures(1);
  const maximumMonthlyMean = getMaximumMonthlyMean(1);
  return expect(() => {
    calculateDegreeHeatingDays(seaSurfaceTemperatures, maximumMonthlyMean);
  }).toThrow(Error);
});

test('Calculates data as expected.', () => {
  const seaSurfaceTemperatures = getSeaSurfaceTemperatures(84);
  const maximumMonthlyMean = getMaximumMonthlyMean(1);
  const DHD = calculateDegreeHeatingDays(
    seaSurfaceTemperatures,
    maximumMonthlyMean,
  );
  expect(DHD).toBe(1512);
});
