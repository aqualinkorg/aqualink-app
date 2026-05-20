import configureStore from 'redux-mock-store';
import { mockUser } from 'mocks/mockUser';
import { mockSite } from 'mocks/mockSite';
import React from 'react';
import { mockCollection } from 'mocks/mockCollection';
import { renderWithProviders } from 'utils/test-utils';
import Uploads from '.';

vi.mock('services/siteServices', () => ({
  default: {
    getSiteSurveyPoints: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

const mockStore = configureStore([]);

describe('Multi Site Uploads', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: {
          ...mockUser,
          administeredSites: [{ ...mockSite, name: 'site name' }],
        },
      },
      uploads: {
        uploadInProgress: false,
        error: undefined,
        uploadResponse: undefined,
      },
      collection: {
        details: mockCollection,
      },
    });

    element = renderWithProviders(<Uploads />, { store }).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
