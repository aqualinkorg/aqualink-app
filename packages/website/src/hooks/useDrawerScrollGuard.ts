import { useCallback, useRef } from 'react';

/**
 * Keeps touch moves inside a scrolled bottom-sheet body away from the sheet's
 * swipe handler.
 *
 * react-swipeable-views cancels the first touchmove of a downward gesture
 * before it checks whether a nested element can still scroll up, and a touch
 * sequence whose first move is cancelled never scrolls natively. So the
 * drawer could only be scrolled back up after a small downward scroll first
 * (https://github.com/manufont/react-swipeable-bottom-sheet/issues/21).
 *
 * While the body is scrolled, a vertical gesture is a scroll and never reaches
 * the swipe handler; once the body is back at the top the sheet handles
 * swipes again, so a pull past the top still closes it.
 *
 * Attach the returned ref to the sheet's direct child.
 */
export function useDrawerScrollGuard() {
  const detach = useRef<() => void>();

  return useCallback((content: HTMLElement | null) => {
    detach.current?.();
    detach.current = undefined;

    const sheetBody = content?.parentElement;
    if (!content || !sheetBody) return;

    const keepScrollNative = (event: TouchEvent) => {
      if (sheetBody.scrollTop > 0) {
        event.stopPropagation();
      }
    };
    content.addEventListener('touchmove', keepScrollNative, { passive: true });
    detach.current = () =>
      content.removeEventListener('touchmove', keepScrollNative);
  }, []);
}
