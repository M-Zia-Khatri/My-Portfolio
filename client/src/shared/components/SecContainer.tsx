import { cn } from '@/shared/utils/cn';
import { Container } from '@radix-ui/themes';
import { type ComponentPropsWithoutRef, type ReactNode } from 'react';

type SecComponentProps = ComponentPropsWithoutRef<typeof Container> & {
  children: ReactNode;
};

export default function SecComponent({
  className,
  children,
  ...props
}: SecComponentProps) {
  return (
    <Container
      size={{ initial: '1', sm: '2', md: '3', lg: '4' }}
      width={{ xl: '84rem' }}
      // my={{ lg: '6' }}
      // py={{ lg: '6' }}
      className={cn('justify-center', className)}
      {...props}
    >
      {children}
    </Container>
  );
}
