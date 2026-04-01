import { cn } from '@/shared/utils/cn';
import { Flex, Spinner } from '@radix-ui/themes';

interface SuspenseFallbackProps {
  fullPage?: boolean;
  minHeight?: string;
  className?: string;
}

export function SuspenseFallback({
  fullPage = false,
  minHeight,
  className,
}: SuspenseFallbackProps) {
  return (
    <Flex
      align="center"
      justify="center"
      className={cn(fullPage && 'min-h-dvh', className)}
      style={{
        background: 'var(--color-background)',
        minHeight: minHeight ?? undefined,
      }}
    >
      <Spinner size="3" />
    </Flex>
  );
}
