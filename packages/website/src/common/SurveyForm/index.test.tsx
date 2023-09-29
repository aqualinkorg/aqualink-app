import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
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

  it('calls onSubmit with the form data on submit', async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <SurveyForm siteId={1} onSubmit={mockFunction} />
      </Provider>,
    );

    fireEvent.change(getByTestId('dive-date'), {
      value: '01/01/2022',
    });
    fireEvent.change(getByTestId('dive-time'), {
      value: '12:00',
    });
    fireEvent.change(getByTestId('weather'), {
      value: 'calm',
    });
    fireEvent.change(getByTestId('comments'), {
      value: 'Test comment',
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Next'));
    });

    expect(mockFunction).toHaveBeenCalled();

    expect(mockFunction).toHaveBeenCalledWith(
      '2022-01-01T12:00:00.000Z',
      null,
      'calm',
      'Test comment',
    );
  });
});
