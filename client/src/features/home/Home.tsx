import { Spinner } from '@radix-ui/themes';
import { Suspense } from 'react';
import { cn } from '@/shared/utils/cn';
import { sectionClassName, sections } from './Home.config';

export default function Home() {
  return (
    <>
      <div className="absolute top-0 left-0 -z-100 h-full w-full bg-[url(@/assets/images/bg-noise.png)] opacity-2.5" />
      <div className="absolute top-0 left-0 -z-90 h-full w-full bg-(--blue-3)/15" />

      <div className="mx-auto space-y-6">
        {sections.map((section) => {
          const SectionComponent = section.Component;

          return (
            <section
              key={section.id}
              id={section.id}
              className={cn(
                section.id === 'home'
                  ? 'mb-5 flex h-[calc(100dvh)] scroll-mt-24 flex-col justify-center'
                  : sectionClassName,
              )}
            >
              <Suspense fallback={<Spinner />}>
                <SectionComponent />
              </Suspense>
            </section>
          );
        })}
      </div>
    </>
  );
}
