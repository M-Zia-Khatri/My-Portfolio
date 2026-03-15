import { cn } from "@/lib/utils";
import { Container } from "@radix-ui/themes";

import { type ReactNode } from "react";

export default function SecComponent({ className, children }: { className?: string, children: ReactNode }) {
  return (
    <Container size={{ initial: '1', sm: '2', md: '3', lg: '4' }} width={{ xl: '84rem' }} my={{ lg: '6' }} className={cn("justify-center", className)} >
      {children}
    </Container>
  );
}
