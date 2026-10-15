import React, { createRef } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { Link } from 'react-router-dom';
import { renderWithProviders } from 'utils/test-utils';
import Button from '.';

it('forwards a ref to the button and preserves disabled behavior', () => {
  const ref = createRef<HTMLButtonElement>();
  const onClick = vi.fn();
  renderWithProviders(
    <Button ref={ref} disabled onClick={onClick}>
      Register your site
    </Button>,
  );
  const button = screen.getByRole('button', { name: 'Register your site' });
  expect(ref.current).toBe(button);
  expect(button).toBeDisabled();
  fireEvent.click(button);
  expect(onClick).not.toHaveBeenCalled();
});

it('preserves router links and their forwarded refs', () => {
  const ref = createRef<HTMLAnchorElement>();
  renderWithProviders(
    <Button component={Link} to="/register" ref={ref}>
      Register your site
    </Button>,
  );
  const link = screen.getByRole('link', { name: 'Register your site' });
  expect(link).toHaveAttribute('href', '/register');
  expect(ref.current).toBe(link);
});
