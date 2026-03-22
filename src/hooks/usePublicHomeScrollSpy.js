import { useEffect, useState } from 'react';
import { ROUTES } from '../utils/constants';

/** Section ids in DOM order (must match HomePage + hero `home-top`). */
export const HOME_SCROLL_SPY_IDS = ['home-top', 'services', 'products', 'about'];

const NAV_OFFSET = 96;

/**
 * Tracks which home marketing section is aligned under the navbar while the user scrolls
 * the public layout content area.
 *
 * @param {boolean} enabled — only when pathname is home and we have a scroll root
 * @param {HTMLElement | null} scrollRoot — the overflow:auto content element
 * @param {string} pathname
 * @param {string} hash — location.hash including #
 */
export function usePublicHomeScrollSpy(enabled, scrollRoot, pathname, hash) {
  const hashId = pathname === ROUTES.HOME && hash ? hash.replace(/^#/, '') : '';
  const [spyId, setSpyId] = useState(() =>
    HOME_SCROLL_SPY_IDS.includes(hashId) ? hashId : 'home-top'
  );

  useEffect(() => {
    if (!enabled || !scrollRoot) return undefined;

    const compute = () => {
      const rootRect = scrollRoot.getBoundingClientRect();
      const line = rootRect.top + NAV_OFFSET;
      let current = 'home-top';
      for (const id of HOME_SCROLL_SPY_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= line) {
          current = id;
        }
      }
      setSpyId((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      requestAnimationFrame(compute);
    };

    scrollRoot.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    const ro = new ResizeObserver(() => compute());
    ro.observe(scrollRoot);

    compute();
    const t = window.setTimeout(compute, 120);

    return () => {
      clearTimeout(t);
      scrollRoot.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      ro.disconnect();
    };
  }, [enabled, scrollRoot, pathname]);

  // When user navigates with hash (click), sync until scroll handler catches up
  useEffect(() => {
    if (pathname !== ROUTES.HOME) return;
    if (HOME_SCROLL_SPY_IDS.includes(hashId)) {
      setSpyId(hashId);
    }
  }, [hashId, pathname]);

  return pathname === ROUTES.HOME ? spyId : '';
}
