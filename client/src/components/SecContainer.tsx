import { Container } from "@radix-ui/themes";

import { type ReactNode } from "react";

export default function SecComponent({ children }: { children: ReactNode }) {
  return (
    <Container size={{ initial: '1', sm: '2', md: '3', lg: '4' }} width={{ xl: '84rem' }} my={{ lg: '6' }} className="justify-center" >
      {children}
    </Container>
  );
}
