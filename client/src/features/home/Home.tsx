import { motion } from 'motion/react';
import { sectionClassName, sections } from './Home.config';
import { useSnapScroll } from './useSnapScroll';

export default function Home() {
  const { activeIndex, sectionRefs } = useSnapScroll();

  return (
    <>
      {/* Background layers */}
      <div className="absolute top-0 left-0 -z-100 h-full w-full bg-[url(@/assets/images/bg-noise.png)] opacity-2.5" />
      <div className="absolute top-0 left-0 -z-90 h-full w-full bg-(--blue-3)/15" />

      <div
        id="home-scroll-container"
        className="mx-auto space-y-6"
        style={{ overscrollBehavior: 'none' }}
      >
        {sections.map((section, index) => {
          const SectionComponent = section.Component;
          return (
            <motion.section
              key={section.id}
              id={section.id}
              ref={(el) => {
                sectionRefs.current[index] = el;
              }}
              className={
                index === 0
                  ? 'mb-5 flex h-[calc(100dvh)] scroll-mt-24 flex-col justify-center'
                  : sectionClassName
              }
              animate={{
                opacity: activeIndex === index ? 1 : 0.35,
                y: activeIndex === index ? 0 : 16,
              }}
              transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <SectionComponent />
            </motion.section>
          );
        })}
      </div>
    </>
  );
}
