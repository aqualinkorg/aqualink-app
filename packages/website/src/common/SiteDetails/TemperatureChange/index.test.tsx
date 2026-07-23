import React from 'react';

import { getMockDailyData } from 'mocks/mockDailyData';
import { renderWithProviders } from 'utils/test-utils';
import { TemperatureChange } from '.';

describe('TemperatureChange card', () => {
  const mockDailyData = getMockDailyData(14);

  function renderTemperatureChange(dailyData = mockDailyData) {
    return renderWithProviders(<TemperatureChange dailyData={dailyData} />);
  }

  it('should render with given state from Redux store', () => {
    const { container } = renderTemperatureChange();
    expect(container).toMatchSnapshot();
  });

  it('should render the right temperature change', () => {
    const satelliteTemp = [
      22, 23, 23, 25, 26, 25, 22, 24, 20, 19, 22, 26, 24, 23,
    ];
    const dailyData = getMockDailyData(14).map((data, i) => ({
      ...data,
      satelliteTemperature: satelliteTemp[i],
    }));
    const { container } = renderTemperatureChange(dailyData);

    const temperatureChange = container.querySelector('h1');

    expect(temperatureChange).toHaveTextContent('+1.1°C');
  });

  it('should render -- when there is no data', () => {
    const { container } = renderTemperatureChange([]);
    const temperatureChange = container.querySelector('h1');

    expect(temperatureChange).toHaveTextContent('--°C');
  });

  it('should render -- when there is no data for both weeks', () => {
    const { container } = renderTemperatureChange(mockDailyData.slice(0, 7));
    const temperatureChange = container.querySelector('h1');

    expect(temperatureChange).toHaveTextContent('--°C');
  });
});
