import { useEffect } from "react";
import { useNavigationStore } from "@/shared/store/navigation.store";

export const useSectionObserver = () => {
  const setActiveHash = useNavigationStore((s) => s.setActiveHash);

  useEffect(() => {
    const sections = document.querySelectorAll("section");

    const observer = new IntersectionObserver(
      (entries) => {
        let maxRatio = 0;
        let activeId = "";

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
        threshold: [0.3, 0.6, 0.8],
      }
    );

    sections.forEach((sec) => observer.observe(sec));

    return () => observer.disconnect();
  }, []);
};