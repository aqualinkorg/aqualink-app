import React from 'react';
import { render } from '@testing-library/react';
import CardWithTitle from '.';

test('renders as expected', () => {
  const { container } = render(
    <CardWithTitle
      titleItems={[
        {
          text: 'Some value',
          variant: 'h6',
          marginRight: '1rem',
        },
      ]}
      loading={false}
      gridProps={{ xs: 12 }}
    />,
  );
  expect(container).toMatchSnapshot();
});
