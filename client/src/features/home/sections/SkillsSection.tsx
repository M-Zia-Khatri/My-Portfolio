import { useCallback, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Box, Heading } from '@radix-ui/themes';
import { BorderTrail } from '@/shared/components/motion-primitives/border-trail';
import SecComponent from '@/shared/components/SecContainer';
import { HEADING } from '@/shared/constants/style.constants';
import type { Skill } from '@/features/skills/types';
import { skills } from '@/features/skills/skills.data';
import CodeCard from '@/shared/components/CodeCard';
import SkillChip from '@/features/skills/components/SkillChip';

export default function SkillsSection() {
  const [active, setActive] = useState<Skill | null>(skills[0]);
  const [openTabs, setOpenTabs] = useState<Skill[]>([skills[0]]);

  const handleChipClick = useCallback((skill: Skill) => {
    setOpenTabs((prev) =>
      prev.find((t) => t.name === skill.name) ? prev : [...prev, skill]
    );
    setActive(skill);
  }, []);

  const handleTabClick = useCallback((skill: Skill) => setActive(skill), []);

  const handleTabClose = useCallback((skill: Skill) => {
    setOpenTabs((prev) => {
      const next = prev.filter((t) => t.name !== skill.name);
      if (next.length === 0) {
        setActive(null);
      } else {
        setActive((cur) => {
          if (cur?.name !== skill.name) return cur;
          const idx = prev.findIndex((t) => t.name === skill.name);
          return next[Math.min(idx, next.length - 1)];
        });
      }
      return next;
    });
  }, []);

  // Stable per-chip callbacks — prevents SkillChip memo from breaking
  const chipHandlers = useMemo(
    () =>
      Object.fromEntries(skills.map((s) => [s.name, () => handleChipClick(s)])),
    [handleChipClick]
  );

  const resolvedSkill = active ?? skills[0];

  return (
    <SecComponent>
      <Box className="flex flex-col items-center gap-8 w-full max-w-xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="text-center"
        >
          <Heading as="h2" size={HEADING.h2.size}>
            Tech Stack
          </Heading>
          <p className="mt-1 text-sm opacity-40 tracking-wide">
            select a skill to explore
          </p>
        </motion.div>

        {/* Skill chips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {skills.map((skill) => (
            <SkillChip
              key={skill.name}
              skill={skill}
              active={active?.name === skill.name}
              onClick={chipHandlers[skill.name]}
            />
          ))}
        </motion.div>

        {/* Code card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full relative"
          style={{ perspective: 800 }}
        >
          <CodeCard
            skill={resolvedSkill}
            openTabs={openTabs}
            onTabClick={handleTabClick}
            onTabClose={handleTabClose}
          />
          <BorderTrail
            style={{
              background: `linear-gradient(to right, transparent, ${resolvedSkill.color}, transparent)`,
            }}
            size={80}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </Box>
    </SecComponent>
  );
}
