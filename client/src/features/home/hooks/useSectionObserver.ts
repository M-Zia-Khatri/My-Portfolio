import { useNavigationStore } from '@/shared/store/navigation.store';
import { useEffect } from 'react';

export const useSectionObserver = () => {
  const setActiveHash = useNavigationStore((s) => s.setActiveHash);

  useEffect(() => {
    const sections = document.querySelectorAll('section');

    const observer = new IntersectionObserver(
      (entries) => {
        let maxRatio = 0;
        let activeId = '';

        entries.forEach((entry) => {
          if (entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            activeId = entry.target.id;
          }
        });

        if (activeId) {
          setActiveHash(`#${activeId}`);
        }
      },
      {
        rootMargin: '-30% 0px -30% 0px',
      },
    );

    sections.forEach((sec) => observer.observe(sec));

    return () => observer.disconnect();
  }, []);
};
