import { useLenis } from "@/shared/providers/LenisProvider";

export const useScrollTo = () => {
  const { lenis } = useLenis();

  const scrollTo = (id: string) => {
    lenis?.scrollTo(`#${id}`, {
      duration: 1.2,
    });
  };

  return { scrollTo };
};