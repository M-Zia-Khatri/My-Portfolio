import { useEffect } from 'react';

export type SnapType = 'mandatory' | 'proximity';
export type ScrollBehaviorValue = 'smooth' | 'auto';

export interface UseSnapScrollOptions {
  snapType?: SnapType;
  behavior?: ScrollBehaviorValue;
}

export function useSnapScroll({
  snapType = 'proximity',
  behavior = 'smooth',
}: UseSnapScrollOptions = {}) {
  useEffect(() => {
    const html = document.documentElement;

    const prev = {
      scrollSnapType: html.style.scrollSnapType,
      scrollBehavior: html.style.scrollBehavior,
    };

    html.style.scrollSnapType = `y ${snapType}`;
    html.style.scrollBehavior = behavior;

    return () => {
      html.style.scrollSnapType = prev.scrollSnapType;
      html.style.scrollBehavior = prev.scrollBehavior;
    };
  }, [snapType, behavior]);
}
