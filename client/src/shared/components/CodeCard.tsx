import CodeEmptyState from '@/features/skills/components/CodeEmptyState';
import CodeLine from '@/features/skills/components/CodeLine';
import CodeTabBar from '@/features/skills/components/CodeTabBar';
import TerminalView from '@/features/skills/components/TerminalView';
import type { Skill } from '@/features/skills/types';
import TabScrollbarStyle from '@/shared/components/TabScrollbarStyle';
import { useGsapTypingEffect as useGsapTimeline } from '@/shared/hooks/useGsapAnimations';
import type { RefObject } from 'react';
import { forwardRef, memo, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

const ContentScrollbarStyle = memo(function ContentScrollbarStyle({ color }: { color: string }) {
  return (
    <style>{`.content-scrollbar::-webkit-scrollbar { width: 3px; } .content-scrollbar::-webkit-scrollbar-thumb { background: ${color}44; } .content-scrollbar { scrollbar-width: thin; scrollbar-color: ${color}44 transparent; }`}</style>
  );
});

const CARD_STYLE = { transformStyle: 'preserve-3d' } as const;

export interface CodeCardHandle {
  pause: () => void;
  resume: () => void;
}
export interface CodeCardProps {
  skill: Skill;
  openTabs: Skill[];
  onTabClick: (skill: Skill) => void;
  onTabClose: (skill: Skill) => void;
  onTypingComplete?: () => void;
  started?: boolean;
  isActive?: boolean;
  codeContainerRef?: RefObject<HTMLDivElement | null>;
}

const CodeCardBase = forwardRef<CodeCardHandle, CodeCardProps>(function CodeCard(
  {
    skill,
    openTabs,
    onTabClick,
    onTabClose,
    onTypingComplete,
    started = true,
    isActive = true,
    codeContainerRef,
  },
  ref,
) {
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [cursor, setCursor] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const tlRef = useGsapTimeline(
    cardRef,
    [skill.name, started, skill.mode],
    (timeline: any) => {
      if (skill.mode !== 'code' || !started) return;
      setCompletedLines([]);
      setCurrentLine('');
      setIsTyping(true);

      skill.code.forEach((line, li) => {
        for (let ci = 1; ci <= line.length; ci++) {
          timeline.to(
            {},
            {
              duration: line[ci - 1] === ' ' ? 0.018 : 0.03,
              onComplete: () => {
                setCompletedLines(skill.code.slice(0, li));
                setCurrentLine(line.slice(0, ci));
              },
            },
          );
        }
        timeline.to({}, { duration: 0.05 });
      });

      timeline.call(() => {
        setCompletedLines(skill.code);
        setCurrentLine('');
        setIsTyping(false);
        onTypingComplete?.();
      });
    },
    !isActive,
  );

  useImperativeHandle(
    ref,
    () => ({
      pause: () => tlRef.current?.pause(),
      resume: () => tlRef.current?.resume(),
    }),
    [tlRef],
  );

  useEffect(() => {
    const id = setInterval(() => setCursor((c) => !c), 530);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const el = contentRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [completedLines, currentLine]);

  const allLines = useMemo(
    () => (isTyping ? [...completedLines, currentLine] : completedLines),
    [completedLines, currentLine, isTyping],
  );
  const activeLineI = isTyping ? allLines.length - 1 : -1;
  const isTerminal = skill.mode === 'terminal';

  return (
    <>
      <TabScrollbarStyle color={skill.color} />
      <ContentScrollbarStyle color={skill.color} />
      <div ref={cardRef} className="relative" style={CARD_STYLE}>
        <div
          className="relative z-10 flex w-full flex-col overflow-hidden rounded-xl"
          style={{
            background: isTerminal ? 'rgba(5, 10, 5, 0.97)' : 'rgba(10, 14, 20, 0.95)',
            border: `1px solid ${skill.color}30`,
            minHeight: 300,
          }}
        >
          <CodeTabBar
            skill={skill}
            openTabs={openTabs}
            onTabClick={onTabClick}
            onTabClose={onTabClose}
          />

          <div
            ref={contentRef}
            className="content-scrollbar flex-1 py-3"
            style={{ minHeight: 260, maxHeight: 320, overflowY: 'auto', overflowX: 'hidden' }}
          >
            {openTabs.length === 0 ? (
              <CodeEmptyState />
            ) : skill.mode === 'terminal' ? (
              <TerminalView
                key={skill.name}
                skillName={skill.name}
                commands={skill.commands}
                color={skill.color}
                isActive={isActive}
              />
            ) : (
              <div ref={codeContainerRef}>
                {allLines.map((line, i) => (
                  <CodeLine
                    key={`${skill.name}-${i}`}
                    line={line}
                    index={i}
                    isActiveLine={i === activeLineI}
                    isDoneLine={i < activeLineI || !isTyping}
                    cursor={cursor}
                    color={skill.color}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
});

CodeCardBase.displayName = 'CodeCard';

export default memo(CodeCardBase);
