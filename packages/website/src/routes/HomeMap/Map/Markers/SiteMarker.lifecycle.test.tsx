import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MapContainer } from 'react-leaflet';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { mockSite } from 'mocks/mockSite';
import { CircleSiteMarker, SensorSiteMarker } from './SiteMarker';

const selection = vi.hoisted(() => ({ selected: false }));
vi.mock('react-redux', () => ({ useSelector: () => selection.selected }));
beforeEach(() => {
  selection.selected = false;
});
vi.mock('store/hooks', () => ({ useAppDispatch: () => vi.fn() }));
vi.mock('../Popup', () => ({ default: () => null }));

function Sequence() {
  const [value, setValue] = React.useState<number | undefined>(3);
  const navigate = useNavigate();
  const site = {
    ...mockSite,
    hasHobo: true,
    collectionData: value === undefined ? {} : { tempWeeklyAlert: value },
  };
  return (
    <>
      <button type="button" onClick={() => setValue(undefined)}>
        Absent
      </button>
      <button type="button" onClick={() => setValue(0)}>
        Zero
      </button>
      <button
        type="button"
        onClick={() => {
          setValue(undefined);
          navigate('/');
        }}
      >
        Live
      </button>
      <MapContainer center={[0, 0]} zoom={3}>
        <CircleSiteMarker site={site} />
        <SensorSiteMarker site={site} />
      </MapContainer>
    </>
  );
}

it('updates real Leaflet markers through historical value, absence, zero and live', () => {
  const { container } = render(
    <MemoryRouter initialEntries={['/?asOf=2020-03-01']}>
      <Sequence />
    </MemoryRouter>,
  );
  const expectColor = (color: string) => {
    const circles = container.querySelectorAll('.leaflet-overlay-pane path');
    const sensors = container.querySelectorAll('.leaflet-marker-pane svg path');
    expect(circles).toHaveLength(3);
    expect(sensors).toHaveLength(3);
    [...circles, ...sensors].forEach((path) =>
      expect(path).toHaveAttribute('fill', color),
    );
  };
  expectColor('#EF0000');
  fireEvent.click(screen.getByRole('button', { name: 'Absent' }));
  expectColor('#767676');
  fireEvent.click(screen.getByRole('button', { name: 'Zero' }));
  expectColor('#C6E5FA');
  fireEvent.click(screen.getByRole('button', { name: 'Live' }));
  expectColor('#C6E5FA');
});

it('updates a selected Spotter from historical absence to zero without losing selection styling', () => {
  selection.selected = true;
  const site = {
    ...mockSite,
    sensorId: 'synthetic-spotter',
    status: 'deployed' as const,
    hasHobo: false,
    collectionData: {},
  };
  const view = (collectionData: typeof mockSite.collectionData) => (
    <MemoryRouter initialEntries={['/?asOf=2020-03-01']}>
      <MapContainer center={[0, 0]} zoom={3}>
        <SensorSiteMarker site={{ ...site, collectionData }} />
      </MapContainer>
    </MemoryRouter>
  );
  const { container, rerender } = render(view({}));
  const expectSelectedColor = (color: string) => {
    const selectedPaths = container.querySelectorAll(
      '.leaflet-marker-pane svg path[stroke="white"]',
    );
    expect(selectedPaths).toHaveLength(3);
    selectedPaths.forEach((path) =>
      expect(path).toHaveAttribute('fill', color),
    );
  };
  expectSelectedColor('#767676');
  rerender(view({ tempWeeklyAlert: 0 }));
  expectSelectedColor('#C6E5FA');
});
