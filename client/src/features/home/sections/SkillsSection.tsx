import SkillChip from '@/features/skills/components/SkillChip';
import CodeEmptyState from '@/features/skills/components/CodeEmptyState';
import type { ApiSkill, Skill } from '@/features/skills/types';
import { ICON_MAP } from '@/features/dashboard/pages/skills/iconMap';
import { useSkillsData } from '@/features/dashboard/pages/skills/useSkillActions';
import CodeCard from '@/shared/components/CodeCard';
import { BorderTrail } from '@/shared/components/motion-primitives/border-trail';
import SecComponent from '@/shared/components/SecContainer';
import { HEADING, TEXT } from '@/shared/constants/style.constants';
import { cn } from '@/shared/utils/cn';
import { Box, Flex, Heading, Spinner, Text } from '@radix-ui/themes';
import { motion } from 'motion/react';
import React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSectionActive } from '../hooks/useSectionActive';

export default function SkillsSection() {
  const isSectionActive = useSectionActive('skills');
  const { data, isLoading, isError, error } = useSkillsData();

  const mappedSkills = useMemo<Skill[]>(() => {
    const apiSkills: ApiSkill[] = data ?? [];
    return apiSkills.map((apiSkill) => {
      const iconComponent = ICON_MAP[apiSkill.icon] ?? ICON_MAP.default;
      return { ...apiSkill, iconComponent };
    });
  }, [data]);

  useEffect(() => {
    if (isError && error) {
      console.error('[SkillsSection] Failed to load skills data.', error);
    }
  }, [error, isError]);

  const [activeName, setActiveName] = useState<string | null>(null);
  const [openTabNames, setOpenTabNames] = useState<string[]>([]);

  const openTabs = useMemo<Skill[]>(() => {
    if (mappedSkills.length === 0) return [];

    const tabs = openTabNames
      .map((tabName) => mappedSkills.find((skill) => skill.name === tabName))
      .filter((skill): skill is Skill => Boolean(skill));

    return tabs.length > 0 ? tabs : [mappedSkills[0]];
  }, [mappedSkills, openTabNames]);

  const active = useMemo<Skill | null>(() => {
    if (mappedSkills.length === 0) return null;
    if (!activeName) return openTabs[0] ?? mappedSkills[0];
    return mappedSkills.find((skill) => skill.name === activeName) ?? openTabs[0] ?? mappedSkills[0];
  }, [activeName, mappedSkills, openTabs]);

  const handleChipClick = useCallback((skill: Skill) => {
    setOpenTabNames((prev) => (prev.includes(skill.name) ? prev : [...prev, skill.name]));
    setActiveName(skill.name);
  }, []);

  const handleTabClick = useCallback((skill: Skill) => setActiveName(skill.name), []);

  const handleTabClose = useCallback((skill: Skill) => {
    setOpenTabNames((prev) => {
      const next = prev.filter((name) => name !== skill.name);
      if (next.length === 0) {
        setActiveName(null);
      } else {
        setActiveName((currentName) => {
          if (currentName !== skill.name) return currentName;
          const idx = prev.findIndex((name) => name === skill.name);
          return next[Math.min(idx, next.length - 1)];
        });
      }
      return next;
    });
  }, []);

  // Stable per-chip callbacks — prevents SkillChip memo from breaking
  const chipHandlers = useMemo(
    () => Object.fromEntries(mappedSkills.map((s) => [s.name, () => handleChipClick(s)])),
    [handleChipClick, mappedSkills],
  );

  const resolvedSkill = useMemo<Skill | null>(() => {
    if (active) return active;
    return mappedSkills[0] ?? null;
  }, [active, mappedSkills]);

  const borderTrailStyle = useMemo(
    () =>
      resolvedSkill
        ? {
            background: `linear-gradient(to right, transparent, ${resolvedSkill.color}, transparent)`,
          }
        : undefined,
    [resolvedSkill],
  );

  return (
    <SecComponent>
      <Box className="mx-auto flex w-full max-w-xs sm:max-w-xl flex-col items-center gap-8 md:gap-12">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="text-center gap-1 md:gap-1.5 lg:gap-2 xl:gap-2.5"
        >
          <Heading as="h2" size={HEADING.h2.size} className="font-bold">
            Tech Stack
          </Heading>
          <Text size={TEXT.base.size} color="blue" className="opacity-75">
            select a skill to explore
          </Text>
        </motion.div>

        {/* Skill chips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={cn('flex flex-wrap justify-center', 'gap-2 md:gap-2.5 lg:gap-3 2xl:gap-4')}
        >
          {mappedSkills.map((skill) => (
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
          className="relative w-full"
          style={{ perspective: 800 }}
        >
          {isLoading ? (
            <Flex align="center" justify="center" className="min-h-[300px] rounded-xl border border-white/10">
              <Spinner size="3" />
            </Flex>
          ) : isError ? (
            <Flex direction="column" align="center" justify="center" className="min-h-[300px] rounded-xl border border-white/10 p-4">
              <CodeEmptyState />
              <Text size="2" color="red" className="text-center">
                Couldn&apos;t load skills right now. Please try again soon.
              </Text>
            </Flex>
          ) : !resolvedSkill || mappedSkills.length === 0 ? (
            <Flex direction="column" align="center" justify="center" className="min-h-[300px] rounded-xl border border-white/10 p-4">
              <CodeEmptyState />
              <Text size="2" color="gray" className="text-center">
                No skills available yet.
              </Text>
            </Flex>
          ) : (
            <>
              <CodeCard
                isActive={isSectionActive}
                skill={resolvedSkill}
                openTabs={openTabs}
                onTabClick={handleTabClick}
                onTabClose={handleTabClose}
              />
              <BorderTrail
                style={borderTrailStyle}
                size={80}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />
            </>
          )}
        </motion.div>
      </Box>
    </SecComponent>
  );
}
