import { motion } from 'framer-motion';
import { useSnapScroll } from './useSnapScroll';
import { sectionClassName, sections } from './Home.config';

export default function Home() {
  const { activeIndex, sectionRefs } = useSnapScroll();

  return (
  <>
    {/* Background layers */}
    <div className='bg-[url(@/assets/images/bg-noise.png)] opacity-2.5 -z-100 absolute top-0 w-full h-full left-0' />
    <div className='-z-90 absolute top-0 w-full h-full left-0 bg-(--blue-3)/15' />

    <div
      id='home-scroll-container'
      className='mx-auto space-y-6'
      style={{ overscrollBehavior: 'none' }}
    >

      {sections.map((section, index) => {
        const SectionComponent = section.Component;
        return (
          <motion.section
            key={section.id}
            id={section.id}
            ref={(el) => { sectionRefs.current[index] = el; }}
            className={
              index === 0
                ? 'flex h-[calc(100dvh-5rem)] scroll-mt-24 flex-col justify-center mb-5'
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