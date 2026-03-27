import { useNavigationStore } from '@/shared/store/navigation.store';
import { motion } from 'motion/react';
import { sectionClassName, sections } from './Home.config';
import { useLenisSnap } from './hooks/useLenisSnap';
import { useSectionObserver } from './hooks/useSectionObserver';

export default function Home() {
  useSectionObserver();
  useLenisSnap(); // just initialize

  const { activeHash } = useNavigationStore();

  return (
    <>
      {/* Background */}
      <div className="absolute top-0 left-0 -z-100 h-full w-full bg-[url(@/assets/images/bg-noise.png)] opacity-2.5" />
      <div className="absolute top-0 left-0 -z-90 h-full w-full bg-(--blue-3)/15" />

      <div className="mx-auto space-y-6">
        {sections.map((section) => {
          const SectionComponent = section.Component;
          const isActive = activeHash === `#${section.id}`;

          return (
            <motion.section
              key={section.id}
              id={section.id}
              className={
                section.id === 'home'
                  ? 'mb-5 flex h-[calc(100dvh)] scroll-mt-24 flex-col justify-center'
                  : sectionClassName
              }
              animate={{
                opacity: isActive ? 1 : 0.35,
                y: isActive ? 0 : 16,
              }}
              transition={{
                duration: 0.45,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <SectionComponent />
            </motion.section>
          );
        })}
      </div>
    </>
  );
}
