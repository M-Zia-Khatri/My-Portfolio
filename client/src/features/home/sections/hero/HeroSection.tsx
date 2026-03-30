import { TextLoop } from '@/shared/components/motion-primitives/text-loop.tsx';
import { cn } from '@/shared/utils/cn.ts';
import BgScene from './BgScene';

const headingBaseStyling = cn(
  'font-black uppercase text-white w-full drop-shadow-[0_0_2.5px_color-mix(in_srgb,var(--blue-10)_80%,transparent),0_0_5px_color-mix(in_srgb,var(--blue-10)_90%,transparent)]',
  'text-5xl/14 sm:text-6xl/18 md:text-7xl/22 lg:text-8xl/26 2xl:text-9xl/32 ',
);

export default function HeroSection() {
  return (
    <div className="z-10 relative  flex h-full w-full flex-col items-center justify-center text-center">
      <div className="absolute inset-0 left-0 -z-100 h-dvh w-screen bg-linear-to-t from-transparent to-(--blue-4)/50" />
      <BgScene />

      <div className={cn('relative z-20 w-full mt-8 lg:mt-23', 'space-y-2')}>
        <h1 className={headingBaseStyling}>BUILDING</h1>
        <h1 className={headingBaseStyling}>MODERN WEB</h1>

        <TextLoop
          className="overflow-y-clip"
          transition={{
            type: 'spring',
            stiffness: 900,
            damping: 80,
            mass: 10,
          }}
          variants={{
            initial: {
              y: 20,
              rotateX: 90,
              opacity: 0,
              filter: 'blur(4px)',
            },
            animate: {
              y: 0,
              rotateX: 0,
              opacity: 1,
              filter: 'blur(0px)',
            },
            exit: {
              y: -20,
              rotateX: -90,
              opacity: 0,
              filter: 'blur(4px)',
            },
          }}
        >
          <h1 className={cn(headingBaseStyling, 'm-0')}>EXPERIENCES</h1>
          <h1 className={cn(headingBaseStyling, 'm-0')}>APPLICATIONS</h1>
          <h1 className={cn(headingBaseStyling, 'm-0')}>SOLUTIONS</h1>
          <h1 className={cn(headingBaseStyling, 'm-0')}>PRODUCTS</h1>
          <h1 className={cn(headingBaseStyling, 'm-0')}>PLATFORMS</h1>
        </TextLoop>
      </div>
    </div>
  );
}
