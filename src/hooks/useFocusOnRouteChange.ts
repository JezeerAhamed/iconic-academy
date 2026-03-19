'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useFocusOnRouteChange() {
  const pathname = usePathname();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const main = document.getElementById('main-content');
      const heading = main?.querySelector('h1');

      if (!(heading instanceof HTMLElement)) {
        return;
      }

      const previousTabIndex = heading.getAttribute('tabindex');

      if (heading.tabIndex < 0) {
        heading.tabIndex = -1;
      }

      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ block: 'start', behavior: 'smooth' });

      if (previousTabIndex === null) {
        window.setTimeout(() => {
          heading.removeAttribute('tabindex');
        }, 0);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);
}
