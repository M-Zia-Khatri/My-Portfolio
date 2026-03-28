import CodeEmptyState from '@/features/skills/components/CodeEmptyState';
import CodeLine from '@/features/skills/components/CodeLine';
import CodeTabBar from '@/features/skills/components/CodeTabBar';
import TerminalView from '@/features/skills/components/TerminalView';
import type { Skill } from '@/features/skills/types';
import TabScrollbarStyle from '@/shared/components/TabScrollbarStyle';
import gsap from 'gsap';
import { AnimatePresence, motion, useSpring, useTransform } from 'motion/react';
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

// Only re-renders when skill.color changes
const ContentScrollbarStyle = memo(function ContentScrollbarStyle({ color }: { color: string }) {
  return (
    <style>{`
      .content-scrollbar::-webkit-scrollbar { width: 3px; }
      .content-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
      .content-scrollbar::-webkit-scrollbar-thumb {
        background: ${color}44;
        border-radius: 99px;
      }
      .content-scrollbar::-webkit-scrollbar-thumb:hover { background: ${color}88; }
      .content-scrollbar { scrollbar-width: thin; scrollbar-color: ${color}44 transparent; }
    `}</style>
  );
});

export interface CodeCardHandle {
  pause: () => void;
  resume: () => void;
}

export interface CodeCardProps {
  skill: Skill;
  openTabs: Skill[];
  onTabClick: (skill: Skill) => void;
  onTabClose: (skill: Skill) => void;
  /** Called once when the code-mode typewriter finishes the last line */
  onTypingComplete?: () => void;
  /** When false the typewriter will not start (used for viewport-gated cards) */
  started?: boolean;
}

const CodeCard = forwardRef<CodeCardHandle, CodeCardProps>(function CodeCard(
  { skill, openTabs, onTabClick, onTabClose, onTypingComplete, started = true }: CodeCardProps,
  ref,
) {
  // Split animation state — only used in "code" mode
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [cursor, setCursor] = useState(true);

  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    pause: () => tlRef.current?.pause(),
    resume: () => tlRef.current?.resume(),
  }));

  // Auto-scroll code area to bottom as new lines appear
  useEffect(() => {
    const el = contentRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [completedLines, currentLine]);

  // 3-D tilt springs
  const mouseX = useSpring(0, { stiffness: 120, damping: 20 });
  const mouseY = useSpring(0, { stiffness: 120, damping: 20 });
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);
  const glowX = useTransform(mouseX, [-0.5, 0.5], ['20%', '80%']);
  const glowY = useTransform(mouseY, [-0.5, 0.5], ['20%', '80%']);

  const spotlightBg = useTransform(
    [glowX, glowY],
    ([x, y]) => `radial-gradient(circle at ${x} ${y}, ${skill.color}18 0%, transparent 65%)`,
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [mouseX, mouseY],
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  // Blink cursor (code mode only)
  useEffect(() => {
    if (skill.mode !== 'code') return;
    const id = setInterval(() => setCursor((c) => !c), 530);
    return () => clearInterval(id);
  }, [skill.mode]);

  // Character-by-character GSAP typewriter (code mode only)
  useEffect(() => {
    if (skill.mode !== 'code') return;
    if (!started) return;

    tlRef.current?.kill();
    setCompletedLines([]);
    setCurrentLine('');
    setIsTyping(true);

    const codeLines = skill.code;
    type Step = { li: number; ci: number };
    let t = 0;
    const steps: (Step & { time: number })[] = [];

    codeLines.forEach((line, li) => {
      for (let ci = 0; ci <= line.length; ci++) {
        steps.push({ li, ci, time: t });
        if (ci < line.length) {
          const ch = line[ci];
          t += ch === ' ' ? 0.018 : 0.022 + Math.random() * 0.025;
        }
      }
      t += 0.055;
    });

    const progress = { value: 0 };
    const tween = gsap.to(progress, {
      value: steps.length - 1,
      duration: t,
      ease: 'none',
      onUpdate() {
        const { li, ci } = steps[Math.round(progress.value)] ?? steps[steps.length - 1];
        setCompletedLines(codeLines.slice(0, li));
        setCurrentLine(codeLines[li].slice(0, ci));
      },
      onComplete() {
        setCompletedLines(codeLines);
        setCurrentLine('');
        setIsTyping(false);
        onTypingComplete?.();
      },
    });

    tlRef.current = gsap.timeline().add(tween);
    return () => {
      tlRef.current?.kill();
    };
  }, [skill, started]);

  // All lines to render (code mode)
  const allLines = useMemo(
    () => (isTyping ? [...completedLines, currentLine] : completedLines),
    [completedLines, currentLine, isTyping],
  );
  const activeLineI = isTyping ? allLines.length - 1 : -1;

  // Card background adapts to mode
  const isTerminal = skill.mode === 'terminal';
  const cardBg = isTerminal ? 'rgba(5, 10, 5, 0.97)' : 'rgba(10, 14, 20, 0.95)';

  return (
    <>
      <TabScrollbarStyle color={skill.color} />
      <ContentScrollbarStyle color={skill.color} />

      {/* Tilt wrapper */}
      <motion.div
        ref={cardRef}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          perspective: 800,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative"
      >
        {/* Mouse-tracking spotlight — driven by motion values, zero React re-renders */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-0 rounded-xl"
          style={{ background: spotlightBg }}
        />

        <div
          className="relative z-10 flex w-full flex-col overflow-hidden rounded-xl"
          style={{
            background: cardBg,
            border: `1px solid ${skill.color}30`,
            boxShadow: `0 0 0 1px ${skill.color}18, 0 16px 48px rgba(0,0,0,0.55)`,
            fontFamily: '"JetBrains Mono","Fira Code","Cascadia Code",ui-monospace,monospace',
            minHeight: 300,
          }}
        >
          <CodeTabBar
            skill={skill}
            openTabs={openTabs}
            onTabClick={onTabClick}
            onTabClose={onTabClose}
          />

          {/* Code / Terminal area */}
          <div
            ref={contentRef}
            className="content-scrollbar flex-1 py-3"
            style={{
              minHeight: 260,
              maxHeight: 320,
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            <AnimatePresence mode="wait">
              {openTabs.length === 0 ? (
                <CodeEmptyState key="empty" />
              ) : skill.mode === 'terminal' ? (
                /* ── Terminal mode ── */
                <TerminalView
                  key={skill.name}
                  skillName={skill.name}
                  commands={skill.commands}
                  color={skill.color}
                />
              ) : (
                /* ── Code editor mode ── */
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom fade */}
          <div
            className="pointer-events-none absolute right-0 bottom-0 left-0 h-12"
            style={{
              background: 'linear-gradient(to top, rgba(10,14,20,0.95) 0%, transparent 100%)',
            }}
          />
        </div>
      </motion.div>
    </>
  );
});

export default CodeCard;
