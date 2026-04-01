import { cn } from '@/shared/utils/cn';
import { sectionClassName, sections } from './Home.config';
import { useSnapScroll } from './hooks/useSnapScroll';

export default function Home() {
  useSnapScroll();

  return (
    <>
      {/* Background: noise texture */}
      <div
        className={cn(
          'absolute top-0 left-0 -z-100 h-full w-full',
          'bg-[url(@/assets/images/bg-noise.png)] opacity-2.5',
        )}
      />

      {/* Background: blue tint */}
      <div className={cn('absolute top-0 left-0 -z-90 h-full w-full', 'bg-(--blue-3)/15')} />

      <div className={cn('mx-auto')}>
        {sections.map((section) => {
          const SectionComponent = section.Component;

          return (
            <section
              key={section.id}
              id={section.id}
              className={cn(
                'snap-start',
                section.id === 'home'
                  ? 'flex h-[calc(100dvh)] scroll-mt-24 flex-col justify-center'
                  : sectionClassName,
              )}
            >
              <SectionComponent />
            </section>
          );
        })}
      </div>
    </>
  );
}
