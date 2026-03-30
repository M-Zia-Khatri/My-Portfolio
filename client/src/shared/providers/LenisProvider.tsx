import Lenis from '@studio-freight/lenis';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type LenisContextType = {
  lenis: Lenis | null;
};

const LenisContext = createContext<LenisContextType>({
  lenis: null,
});

export const useLenis = () => useContext(LenisContext);

export const LenisProvider = ({ children }: { children: ReactNode }) => {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  useEffect(() => {
    const instance = new Lenis({ duration: 1.2, smoothWheel: true, smoothTouch: false });
    setLenis(instance);
    const raf = (time: number) => {
      instance.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    return () => instance.destroy();
  }, []);
  return <LenisContext.Provider value={{ lenis }}>{children}</LenisContext.Provider>;
};
