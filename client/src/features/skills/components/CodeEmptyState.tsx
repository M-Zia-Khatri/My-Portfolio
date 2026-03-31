import { motion } from 'motion/react';

export default function CodeEmptyState() {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex h-full flex-col items-center justify-center gap-2 select-none"
      style={{ minHeight: 240 }}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        className="text-4xl opacity-20"
      >
        📂
      </motion.div>

      <p className="text-[12px] tracking-widest uppercase opacity-25">No file open</p>

      <p className="text-[11px] opacity-15">Click a skill to open a tab</p>
    </motion.div>
  );
}
