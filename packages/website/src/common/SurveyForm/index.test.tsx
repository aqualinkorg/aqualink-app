import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import userEvent from '@testing-library/user-event';
import { advanceTo, clear } from 'jest-date-mock';
import { renderWithProviders } from 'utils/test-utils';
import SurveyForm from '.';

const mockStore = configureStore([]);

describe('SurveyForm', () => {
  const store = mockStore({
    survey: {
      surveyFormDraft: {
        diveLocation: {
          lat: 17.42,
          lng: 42.17,
        },
      },
    },
  });

  store.dispatch = jest.fn();

  const mockFunction = jest.fn(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (diveDateTime, diveLocation, weatherConditions, comments) => {},
  );

  beforeAll(() => {
    advanceTo(new Date('2023-10-20T12:00:00'));
  });

  afterAll(() => {
    clear();
  });

  // TODO: fix this test
  it.skip('calls onSubmit with the form data on submit', async () => {
    const { getByTestId, container } = renderWithProviders(
      <SurveyForm siteId={1} onSubmit={mockFunction} />,
      { store },
    );

    expect(container).toMatchSnapshot();

    const diveDate = getByTestId('dive-date');
    userEvent.type(diveDate, '01/01/2022');

    // TODO: figure out how to update the time also
    fireEvent.change(getByTestId('weather'), {
      target: {
        value: 'calm',
      },
    });
    fireEvent.change(getByTestId('comments'), {
      target: {
        value: 'Test comment',
      },
    });

    await userEvent.click(screen.getByText('Next'));
    // await act(async () => {
    //   fireEvent.click(screen.getByText('Next'));
    // });

    // expect(mockFunction).toHaveBeenCalled();

    expect(mockFunction).toHaveBeenCalledWith(
      '2022-01-01T00:00:00.000Z',
      { lat: 17.42, lng: 42.17 },
      'calm',
      'Test comment',
    );
  });
});
