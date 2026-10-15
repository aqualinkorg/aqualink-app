import React from 'react';
import { render } from '@testing-library/react';

import { useDrawerScrollGuard } from './useDrawerScrollGuard';

// The same shape react-swipeable-bottom-sheet renders: the swipe handler's
// root, the scrollable sheet body, and our content as the body's direct child.
function Sheet() {
  const contentRef = useDrawerScrollGuard();
  return (
    <div data-testid="swipe-root">
      <div data-testid="sheet-body">
        <div ref={contentRef} data-testid="content" />
      </div>
    </div>
  );
}

function touchMove(target: Element) {
  const event = new Event('touchmove', { bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
}

describe('useDrawerScrollGuard', () => {
  it('lets touch moves reach the swipe handler while the body is at the top', () => {
    const { getByTestId } = render(<Sheet />);
    const swipeHandler = vi.fn();
    getByTestId('swipe-root').addEventListener('touchmove', swipeHandler);

    touchMove(getByTestId('content'));

    expect(swipeHandler).toHaveBeenCalledTimes(1);
  });

  it('keeps touch moves away from the swipe handler while the body is scrolled', () => {
    const { getByTestId } = render(<Sheet />);
    const swipeHandler = vi.fn();
    getByTestId('swipe-root').addEventListener('touchmove', swipeHandler);
    getByTestId('sheet-body').scrollTop = 120;

    const event = touchMove(getByTestId('content'));

    expect(swipeHandler).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it('hands swipes back once the body is scrolled to the top again', () => {
    const { getByTestId } = render(<Sheet />);
    const swipeHandler = vi.fn();
    getByTestId('swipe-root').addEventListener('touchmove', swipeHandler);
    const body = getByTestId('sheet-body');

    body.scrollTop = 120;
    touchMove(getByTestId('content'));
    body.scrollTop = 0;
    touchMove(getByTestId('content'));

    expect(swipeHandler).toHaveBeenCalledTimes(1);
  });

  it('detaches its listener when the content unmounts', () => {
    const { getByTestId, unmount } = render(<Sheet />);
    const content = getByTestId('content');
    const removeListener = vi.spyOn(content, 'removeEventListener');

    unmount();

    expect(removeListener).toHaveBeenCalledWith(
      'touchmove',
      expect.any(Function),
    );
  });
});
