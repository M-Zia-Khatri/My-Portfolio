import { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/shared/utils/cn';

interface FieldErrorProps {
  message?: string;
}

export const FieldError = memo(({ message }: FieldErrorProps) => (
  <AnimatePresence>
    {message && (
      <motion.p
        key={message}
        initial={{ opacity: 0, y: -4, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.16 }}
        role="alert"
        className={cn('text-xs mt-1.5 font-mono')}
        style={{ color: 'var(--red-11, #fca5a5)' }}
      >
        {message}
      </motion.p>
    )}
  </AnimatePresence>
));

FieldError.displayName = 'FieldError';
