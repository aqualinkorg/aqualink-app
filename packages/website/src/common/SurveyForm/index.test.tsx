import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
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
    const { getByTestId, container } = render(
      <BrowserRouter>
        <Provider store={store}>
          <SurveyForm siteId={1} onSubmit={mockFunction} />
        </Provider>
      </BrowserRouter>,
    );

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

    expect(container).toMatchSnapshot();

    await act(async () => {
      fireEvent.click(screen.getByText('Next'));
    });

    expect(mockFunction).toHaveBeenCalled();

    expect(mockFunction).toHaveBeenCalledWith(
      '2022-01-01T00:00:00.000Z',
      { lat: 17.42, lng: 42.17 },
      'calm',
      'Test comment',
    );

  });
});
