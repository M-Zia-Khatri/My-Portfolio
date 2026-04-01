import { cn } from '@/shared/utils/cn';
import { memo, Suspense } from 'react';
import { sectionClassName, sections } from './Home.config';

// ─── Section shell ────────────────────────────────────────────────────────────
// Memoised: only re-renders when `id` or `children` change, never from
// parent state updates (e.g. scroll position tracked in Home ancestors).r
const SectionShell = memo(function SectionShell({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const className = cn(
    id === 'home'
      ? 'mb-5 flex h-[calc(100dvh)] scroll-mt-24 flex-col justify-center'
      : sectionClassName,
  );

  return (
    <section id={id} className={className}>
      {children}
    </section>
  );
});

// ─── Section fallback ─────────────────────────────────────────────────────────
/**
 * Transparent spacer that occupies a full viewport height while a lazy section
 * is downloading.  This keeps Lenis scroll positions and IntersectionObserver
 * thresholds correct — the browser sees the correct page height immediately.
 *
 * We intentionally do NOT show a spinner here because:
 *   a) The sections load in ~50–150 ms from cache; a spinner would flash.
 *   b) The hero is already visible above — showing a spinner below it is odd.
 */
const SECTION_FALLBACK = (
  <div aria-hidden="true" style={{ minHeight: '100dvh', background: 'transparent' }} />
);

// ─── Component ────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      {/* Background layers — rendered once, z-indexed below content */}
      <div className="absolute top-0 left-0 -z-100 h-full w-full bg-[url(@/assets/images/bg-noise.png)] opacity-2.5" />
      <div className="absolute top-0 left-0 -z-90 h-full w-full bg-(--blue-3)/15" />

      <div className="mx-auto space-y-6">
        {sections.map(({ id, Component }) => (
          <SectionShell key={id} id={id}>
            {/*
             * Hero and About have no lazy boundary (they're eager imports).
             * Suspense is a no-op for synchronous components, so it's safe
             * to wrap all sections uniformly here.
             */}
            <Suspense fallback={SECTION_FALLBACK}>
              <Component />
            </Suspense>
          </SectionShell>
        ))}
      </div>
    </>
  );
}
