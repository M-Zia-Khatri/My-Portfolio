import { ICON_MAP } from '@/features/dashboard/pages/skills/iconMap';
import { useSkillsData } from '@/features/dashboard/pages/skills/useSkillActions';
import CodeEmptyState from '@/features/skills/components/CodeEmptyState';
import SkillChip from '@/features/skills/components/SkillChip';
import type { ApiSkill, Skill } from '@/features/skills/types';
import CodeCard from '@/shared/components/CodeCard';
import SecComponent from '@/shared/components/SecContainer';
import { HEADING, TEXT } from '@/shared/constants/style.constants';
import { useGsapTypingEffect } from '@/shared/hooks/gsap/useGsapTypingEffect';
import { useGsapReveal, useGsapStagger } from '@/shared/hooks/useGsapAnimations';
import { cn } from '@/shared/utils/cn';
import { Box, Flex, Heading, Spinner, Text } from '@radix-ui/themes';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useSectionActive } from '../hooks/useSectionActive';

export default function SkillsSection() {
  const isSectionActive = useSectionActive('skills');
  const { data, isLoading, isError } = useSkillsData();

  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);

  useGsapReveal(sectionRef, { y: 40, duration: 0.8, once: true });
  useGsapStagger(cardsRef, { y: 20, stagger: 0.1, duration: 0.5, once: true });

  const mappedSkills = useMemo<Skill[]>(() => {
    const apiSkills: ApiSkill[] = data ?? [];
    return apiSkills.map((apiSkill) => {
      const iconComponent = ICON_MAP[apiSkill.icon] ?? ICON_MAP.default;
      return { ...apiSkill, iconComponent };
    });
  }, [data]);

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
    return (
      mappedSkills.find((skill) => skill.name === activeName) ?? openTabs[0] ?? mappedSkills[0]
    );
  }, [activeName, mappedSkills, openTabs]);

  const handleChipClick = useCallback((skill: Skill) => {
    setOpenTabNames((prev) => (prev.includes(skill.name) ? prev : [...prev, skill.name]));
    setActiveName(skill.name);
  }, []);

  const handleTabClick = useCallback((skill: Skill) => setActiveName(skill.name), []);

  const handleTabClose = useCallback((skill: Skill) => {
    setOpenTabNames((prev) => {
      const next = prev.filter((name) => name !== skill.name);
      if (next.length === 0) setActiveName(null);
      else {
        setActiveName((currentName) => {
          if (currentName !== skill.name) return currentName;
          const idx = prev.findIndex((name) => name === skill.name);
          return next[Math.min(idx, next.length - 1)];
        });
      }
      return next;
    });
  }, []);

  const chipHandlers = useMemo(
    () => Object.fromEntries(mappedSkills.map((s) => [s.name, () => handleChipClick(s)])),
    [handleChipClick, mappedSkills],
  );

  const resolvedSkill = active ?? mappedSkills[0] ?? null;

  useGsapTypingEffect(codeRef, {
    speed: 0.05,
    replayKey: resolvedSkill?.name ?? 'none',
    lineSelector: '.code-line',
    cursorSelector: '[data-code-cursor="true"]',
  });

  return (
    <SecComponent>
      <Box
        ref={sectionRef}
        className="mx-auto flex w-full max-w-xs flex-col items-center gap-8 sm:max-w-xl md:gap-12"
      >
        <div className="text-center gap-1 md:gap-1.5 lg:gap-2 xl:gap-2.5">
          <Heading as="h2" size={HEADING.h2.size} className="font-bold">
            Tech Stack
          </Heading>
          <Text size={TEXT.base.size} color="blue" className="opacity-75">
            select a skill to explore
          </Text>
        </div>

        <div
          ref={cardsRef}
          className={cn('flex flex-wrap justify-center', 'gap-2 md:gap-2.5 lg:gap-3 2xl:gap-4')}
        >
          {mappedSkills.map((skill) => (
            <div key={skill.name}>
              <SkillChip
                skill={skill}
                active={active?.name === skill.name}
                onClick={chipHandlers[skill.name]}
              />
            </div>
          ))}
        </div>

        <div className="relative w-full" style={{ perspective: 800 }}>
          {isLoading ? (
            <Flex
              align="center"
              justify="center"
              className="min-h-[300px] rounded-xl border border-white/10"
            >
              <Spinner size="3" />
            </Flex>
          ) : isError ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              className="min-h-[300px] rounded-xl border border-white/10 p-4"
            >
              <CodeEmptyState />
              <Text size="2" color="red" className="text-center">
                Couldn&apos;t load skills right now.
              </Text>
            </Flex>
          ) : !resolvedSkill || mappedSkills.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              className="min-h-[300px] rounded-xl border border-white/10 p-4"
            >
              <CodeEmptyState />
              <Text size="2" color="gray" className="text-center">
                No skills available yet.
              </Text>
            </Flex>
          ) : (
            <CodeCard
              isActive={isSectionActive}
              skill={resolvedSkill}
              openTabs={openTabs}
              onTabClick={handleTabClick}
              onTabClose={handleTabClose}
              codeContainerRef={codeRef}
            />
          )}
        </div>
      </Box>
    </SecComponent>
  );
}
