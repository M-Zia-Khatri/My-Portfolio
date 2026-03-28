import { cn } from '@/shared/utils/cn';
import { AnimatePresence, motion } from 'motion/react';
import { memo, useState } from 'react';
import type { Skill } from '../types';

interface SkillChipProps {
  skill: Skill;
  active: boolean;
  onClick: () => void;
}

const SkillChip = memo(function SkillChip({ skill, active, onClick }: SkillChipProps) {
  const Icon = skill.iconComponent;
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples((r) => r.filter((r) => r.id !== id)), 600);
    onClick();
  };

  return (
    <motion.button
      whileHover={{ scale: 1.07, y: -2 }}
      whileTap={{ scale: 0.93 }}
      onClick={handleClick}
      className={cn(
        'relative flex items-center gap-2 overflow-hidden rounded-lg px-3 py-[7px]',
        'cursor-pointer border text-[13px] font-medium transition-colors',
      )}
      style={{
        background: active ? `${skill.color}16` : 'rgba(255,255,255,0.03)',
        borderColor: active ? `${skill.color}55` : 'rgba(255,255,255,0.08)',
        color: active ? skill.color : 'rgba(255,255,255,0.45)',
        boxShadow: active ? `0 0 14px ${skill.color}28` : 'none',
      }}
    >
      {/* Click ripple */}
      <AnimatePresence>
        {ripples.map(({ id, x, y }) => (
          <motion.span
            key={id}
            className="pointer-events-none absolute rounded-full"
            style={{ left: x, top: y, background: `${skill.color}30` }}
            initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 1 }}
            animate={{ width: 120, height: 120, x: -60, y: -60, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Icon spins on activate */}
      <motion.span
        animate={active ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <Icon size={15} />
      </motion.span>

      <span>{skill.name}</span>

      {/* Active ring slides between chips via layoutId */}
      {active && (
        <motion.span
          layoutId="skill-active-ring"
          className="pointer-events-none absolute inset-0 rounded-lg"
          style={{ border: `1px solid ${skill.color}50` }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        />
      )}
    </motion.button>
  );
});

export default SkillChip;
