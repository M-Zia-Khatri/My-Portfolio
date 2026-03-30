/**
 * ContactCodeCard
 *
 * Wraps the existing <CodeCard> with contact-section-specific behaviour:
 *
 *  1. Auto-cycles through CONTACT_SKILLS one at a time (code mode only).
 *     When a skill finishes typing, a brief "next →" beat plays before the
 *     next tab opens automatically and typing begins.
 *
 *  2. Clicking a DIFFERENT tab pauses the GSAP timeline for a random
 *     10–20 s window.  A live countdown badge and a subtle hatch overlay
 *     signal the paused state.
 *
 *  3. After the timer expires (or if the user clicks the auto-typing tab
 *     again while paused) the timeline resumes exactly where it stopped.
 *
 * Only the ContactSection uses this component; the original CodeCard and
 * SkillsSection are completely unchanged (except for the two additions to
 * CodeCard: `onTypingComplete` prop and the imperative `pause/resume` ref).
 */

import { skills } from '@/features/skills/skills.data';
import type { Skill } from '@/features/skills/types';
import type { CodeCardHandle } from '@/shared/components/CodeCard';
import CodeCard from '@/shared/components/CodeCard';
import { BorderTrail } from '@/shared/components/motion-primitives/border-trail';
import TabScrollbarStyle from '@/shared/components/TabScrollbarStyle';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

// ── Curated list: code-only skills so the typewriter always fires ─────────────
const CONTACT_SKILLS = skills.filter(
  (s): s is Skill & { mode: 'code' } =>
    s.mode === 'code' && ['TypeScript', 'React', 'Node.js', 'CSS', 'Express'].includes(s.name),
);

// ── Status shown in the top-right badge ──────────────────────────────────────
type CardStatus = 'idle' | 'typing' | 'paused' | 'advancing' | 'done';

// ── Tiny animated status badge (typing dots / paused countdown / next →) ─────
function StatusBadge({
  status,
  color,
  secondsLeft,
  nextName,
}: {
  status: CardStatus;
  color: string;
  secondsLeft: number;
  nextName: string;
}) {
  return (
    <AnimatePresence mode="wait">
      {status === 'typing' && (
        <motion.span
          key="typing"
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 3 }}
          className="flex items-center gap-1 text-[10px] tracking-widest select-none"
          style={{ color: `${color}bb` }}
        >
          <span>typing</span>
          {/* Three bouncing dots */}
          <span className="flex items-end gap-0.75 pb-0.5">
            {[0, 0.18, 0.36].map((delay, i) => (
              <motion.span
                key={i}
                className="inline-block h-0.75 w-0.75 rounded-full"
                style={{ background: color }}
                animate={{ opacity: [0.2, 1, 0.2], y: [0, -2, 0] }}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  delay,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </span>
        </motion.span>
      )}

      {status === 'paused' && (
        <motion.span
          key="paused"
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 3 }}
          className="flex items-center gap-1.5 text-[10px] tracking-widest select-none"
          style={{ color: 'rgba(255,200,80,0.9)' }}
        >
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            ⏸
          </motion.span>
          <span>
            resuming in <span className="font-bold tabular-nums">{secondsLeft}s</span>
          </span>
        </motion.span>
      )}

      {status === 'advancing' && (
        <motion.span
          key="advancing"
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 3 }}
          className="flex items-center gap-1 text-[10px] tracking-widest select-none"
          style={{ color: `${color}bb` }}
        >
          <span>next</span>
          <span style={{ color }}>→</span>
          <span className="font-semibold">{nextName}</span>
        </motion.span>
      )}

      {status === 'done' && (
        <motion.span
          key="done"
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 3 }}
          className="flex items-center gap-1.5 text-[10px] tracking-widest select-none"
          style={{ color: `${color}99` }}
        >
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            ✓
          </motion.span>
          <span>all done</span>
        </motion.span>
      )}
    </AnimatePresence>
  );
}

// ── Progress rail (pill dots at the bottom of the card) ──────────────────────
function ProgressRail({ autoIndex, isDone }: { autoIndex: number; isDone: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-2.5">
      {CONTACT_SKILLS.map((s, i) => (
        <motion.div
          key={s.name}
          title={s.name}
          animate={{
            width: i === autoIndex && !isDone ? 20 : 5,
            opacity: i <= autoIndex ? 1 : 0.2,
            background: isDone
              ? `${s.color}60`
              : i === autoIndex
                ? s.color
                : i < autoIndex
                  ? `${s.color}60`
                  : 'rgba(255,255,255,0.18)',
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="h-1 cursor-default rounded-full"
        />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface ContactCodeCardProps {
  isActive: boolean;
}

export default function ContactCodeCard({ isActive }: ContactCodeCardProps) {
  // Which skill is currently auto-typing
  const [autoIndex, setAutoIndex] = useState(0);
  const autoIndexRef = useRef(0);
  const autoSkill = CONTACT_SKILLS[autoIndex];

  // What CodeCard sees as its `skill` and `openTabs`
  const [activeSkill, setActiveSkill] = useState<Skill>(autoSkill);
  const [openTabs, setOpenTabs] = useState<Skill[]>([autoSkill]);

  // Status badge
  const [cardStatus, setCardStatus] = useState<CardStatus>('idle');
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Section activity + one-shot start guard
  const hasStartedRef = useRef(false);

  // Pause / resume refs
  const codeCardRef = useRef<CodeCardHandle>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // const isLast = autoIndex === CONTACT_SKILLS.length - 1;
  const nextName = CONTACT_SKILLS[(autoIndex + 1) % CONTACT_SKILLS.length].name;

  // ── advance to next, or stop if this was the last skill ───────────────────
  const advanceToNext = useCallback(() => {
    const currentIndex = autoIndexRef.current;
    const isLastSkill = currentIndex === CONTACT_SKILLS.length - 1;

    if (isLastSkill) {
      // All tabs finished — stop entirely
      setCardStatus('done');
      return;
    }

    setCardStatus('advancing');

    setTimeout(() => {
      const nextIdx = currentIndex + 1;
      const nextSkill = CONTACT_SKILLS[nextIdx];

      autoIndexRef.current = nextIdx;
      setAutoIndex(nextIdx);
      setOpenTabs((prev) =>
        prev.find((t) => t.name === nextSkill.name) ? prev : [...prev, nextSkill],
      );
      setActiveSkill(nextSkill);
      setCardStatus('typing');
    }, 900);
  }, []);

  // ── section activation controls start / pause / resume deterministically ───
  const prevIsActiveRef = useRef(isActive);

  useEffect(() => {
    const wasActive = prevIsActiveRef.current;
    prevIsActiveRef.current = isActive;

    const started = hasStartedRef.current;

    if (isActive && !started) {
      hasStartedRef.current = true;
      setCardStatus('typing');
      return;
    }

    if (!started || cardStatus === 'idle' || cardStatus === 'done' || wasActive === isActive) return;

    if (!isActive) {
      codeCardRef.current?.pause();
      if (cardStatus === 'typing' || cardStatus === 'advancing') {
        setCardStatus('paused');
      }
      return;
    }

    codeCardRef.current?.resume();
    if (cardStatus === 'paused' && !secondsLeft) {
      setCardStatus('typing');
    }
  }, [isActive, cardStatus, secondsLeft]);

  // ── tab click: either resume (if clicking the live tab) or pause ──────────
  const handleTabClick = useCallback(
    (skill: Skill) => {
      // Ignore clicks once everything is done
      if (cardStatus === 'done' || cardStatus === 'idle') return;

      const liveSkill = CONTACT_SKILLS[autoIndexRef.current];

      if (skill.name === liveSkill.name) {
        // Clicking the live tab while paused → immediate resume
        if (cardStatus === 'paused') {
          clearTimeout(pauseTimerRef.current!);
          clearInterval(countdownRef.current!);
          pauseTimerRef.current = null;
          countdownRef.current = null;
          codeCardRef.current?.resume();
          setCardStatus('typing');
          setActiveSkill(liveSkill);
        }
        return;
      }

      // Clicking any other tab → pause + show that tab's static content
      setActiveSkill(skill);
      codeCardRef.current?.pause();

      const delayMs = 10_000 + Math.random() * 10_000;
      const delaySecs = Math.ceil(delayMs / 1000);
      setCardStatus('paused');
      setSecondsLeft(delaySecs);

      clearTimeout(pauseTimerRef.current!);
      clearInterval(countdownRef.current!);

      countdownRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      pauseTimerRef.current = setTimeout(() => {
        clearInterval(countdownRef.current!);
        pauseTimerRef.current = null;
        const live = CONTACT_SKILLS[autoIndexRef.current];
        setActiveSkill(live);
        codeCardRef.current?.resume();
        setCardStatus('typing');
      }, delayMs);
    },
    [cardStatus],
  );

  // No close buttons in the contact card — tabs only accumulate
  const handleTabClose = useCallback(() => {
    /* intentionally no-op */
  }, []);

  // Cleanup on unmount
  useEffect(
    () => () => {
      clearTimeout(pauseTimerRef.current!);
      clearInterval(countdownRef.current!);
    },
    [],
  );

  // While idle CodeCard shows the empty state naturally (openTabs=[])
  // Once started we keep the real openTabs forever.
  const isStarted = cardStatus !== 'idle';

  return (
    <div className="flex flex-col gap-2">
      {/* Status badge floats above the card */}
      <div className="flex h-5 justify-end pr-1">
        <StatusBadge
          status={cardStatus}
          color={autoSkill.color}
          secondsLeft={secondsLeft}
          nextName={nextName}
        />
      </div>

      {/* Pause hatch overlay + CodeCard wrapper */}
      <div className="relative" style={{ perspective: 800 }}>
        {/* Subtle diagonal hatch when paused */}
        <AnimatePresence>
          {cardStatus === 'paused' && (
            <motion.div
              key="hatch"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 z-20 rounded-xl"
              style={{
                background:
                  'repeating-linear-gradient(45deg,transparent,transparent 4px,rgba(255,200,80,0.018) 4px,rgba(255,200,80,0.018) 8px)',
              }}
            />
          )}
        </AnimatePresence>

        {/* The actual card */}
        <CodeCard
          ref={codeCardRef}
          skill={activeSkill}
          openTabs={isStarted ? openTabs : []}
          started={isStarted}
          isActive={isActive && cardStatus !== 'advancing'}
          onTabClick={handleTabClick}
          onTabClose={handleTabClose}
          onTypingComplete={cardStatus !== 'done' ? advanceToNext : undefined}
        />

        {/* Border trail only while active */}
        <TabScrollbarStyle color={autoSkill.color} />
        {isStarted && cardStatus !== 'done' && (
          <BorderTrail
            style={{
              background: `linear-gradient(to right, transparent, ${autoSkill.color}, transparent)`,
            }}
            size={80}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>

      {/* Skill progress pills */}
      <ProgressRail autoIndex={autoIndex} isDone={cardStatus === 'done'} />
    </div>
  );
}
