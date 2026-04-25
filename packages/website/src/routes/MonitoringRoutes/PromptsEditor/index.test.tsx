import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from 'store/configure';
import PromptsEditor from '.';

describe('PromptsEditor', () => {
  it('should render without crashing', () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <PromptsEditor />
        </BrowserRouter>
      </Provider>,
    );
    expect(container).toMatchSnapshot();
  });
});
