import { cn } from '@/shared/utils/cn';
import { sectionClassName, sections } from './Home.config';

export default function Home() {
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

      <div className={cn('mx-auto h-screen snap-y snap-mandatory overflow-y-scroll scroll-smooth')}>
        {sections.map((section) => {
          const SectionComponent = section.Component;

          return (
            <section
              key={section.id}
              id={section.id}
              data-snap-section="true"
              className={cn(
                'snap-start',
                section.id === 'home'
                  ? 'flex h-[calc(100dvh)] scroll-mt-24 flex-col justify-center'
                  : sectionClassName,
                'min-h-dvh',
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
