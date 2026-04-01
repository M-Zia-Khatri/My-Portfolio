import { skills } from '@/features/skills/skills.data';
import type { Skill } from '@/features/skills/types';
import type { CodeCardHandle } from '@/shared/components/CodeCard';
import CodeCard from '@/shared/components/CodeCard';
import { useGsapReveal } from '@/shared/hooks/useGsapAnimations';
import { useCallback, useEffect, useRef, useState } from 'react';

const CONTACT_SKILLS = skills.filter((s): s is Skill & { mode: 'code' } => s.mode === 'code' && ['TypeScript', 'React', 'Node.js', 'CSS', 'Express'].includes(s.name));
type CardStatus = 'idle' | 'typing' | 'paused' | 'advancing' | 'done';

function StatusBadge({ status, color, secondsLeft, nextName }: { status: CardStatus; color: string; secondsLeft: number; nextName: string }) {
  if (status === 'typing') return <span className="text-[10px] tracking-widest" style={{ color: `${color}bb` }}>typing…</span>;
  if (status === 'paused') return <span className="text-[10px] tracking-widest text-amber-300">resuming in {secondsLeft}s</span>;
  if (status === 'advancing') return <span className="text-[10px] tracking-widest" style={{ color: `${color}bb` }}>next → {nextName}</span>;
  if (status === 'done') return <span className="text-[10px] tracking-widest" style={{ color: `${color}99` }}>✓ all done</span>;
  return null;
}

function ProgressRail({ autoIndex, isDone }: { autoIndex: number; isDone: boolean }) {
  return <div className="flex items-center justify-center gap-1.5 py-2.5">{CONTACT_SKILLS.map((s, i) => <div key={s.name} title={s.name} className="h-1 rounded-full transition-all duration-300" style={{ width: i === autoIndex && !isDone ? 20 : 5, opacity: i <= autoIndex ? 1 : 0.2, background: isDone ? `${s.color}60` : i === autoIndex ? s.color : i < autoIndex ? `${s.color}60` : 'rgba(255,255,255,0.18)' }} />)}</div>;
}

export default function ContactCodeCard({ isActive }: { isActive: boolean }) {
  const [autoIndex, setAutoIndex] = useState(0);
  const autoIndexRef = useRef(0);
  const [activeSkill, setActiveSkill] = useState<Skill>(CONTACT_SKILLS[0]);
  const [openTabs, setOpenTabs] = useState<Skill[]>([CONTACT_SKILLS[0]]);
  const [cardStatus, setCardStatus] = useState<CardStatus>('idle');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const codeCardRef = useRef<CodeCardHandle>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useGsapReveal(wrapRef, '[data-contact-card]', { y: 16, duration: 0.45 });

  const nextName = CONTACT_SKILLS[(autoIndex + 1) % CONTACT_SKILLS.length].name;

  const advanceToNext = useCallback(() => {
    const currentIndex = autoIndexRef.current;
    if (currentIndex === CONTACT_SKILLS.length - 1) return setCardStatus('done');
    setCardStatus('advancing');
    setTimeout(() => {
      const nextIdx = currentIndex + 1;
      const nextSkill = CONTACT_SKILLS[nextIdx];
      autoIndexRef.current = nextIdx;
      setAutoIndex(nextIdx);
      setOpenTabs((prev) => (prev.find((t) => t.name === nextSkill.name) ? prev : [...prev, nextSkill]));
      setActiveSkill(nextSkill);
      setCardStatus('typing');
    }, 700);
  }, []);

  useEffect(() => {
    if (isActive && cardStatus === 'idle') setCardStatus('typing');
    if (!isActive) codeCardRef.current?.pause();
    if (isActive && cardStatus !== 'paused') codeCardRef.current?.resume();
  }, [isActive, cardStatus]);

  const handleTabClick = useCallback((skill: Skill) => {
    if (cardStatus === 'done' || cardStatus === 'idle') return;
    const liveSkill = CONTACT_SKILLS[autoIndexRef.current];
    if (skill.name === liveSkill.name) {
      codeCardRef.current?.resume();
      setCardStatus('typing');
      setActiveSkill(liveSkill);
      return;
    }

    setActiveSkill(skill);
    codeCardRef.current?.pause();
    const delaySecs = Math.ceil((10_000 + Math.random() * 10_000) / 1000);
    setCardStatus('paused');
    setSecondsLeft(delaySecs);
    const interval = setInterval(() => setSecondsLeft((v) => Math.max(0, v - 1)), 1000);
    setTimeout(() => {
      clearInterval(interval);
      const live = CONTACT_SKILLS[autoIndexRef.current];
      setActiveSkill(live);
      codeCardRef.current?.resume();
      setCardStatus('typing');
    }, delaySecs * 1000);
  }, [cardStatus]);

  return (
    <div ref={wrapRef} className="flex flex-col gap-2">
      <div className="flex h-5 justify-end pr-1"><StatusBadge status={cardStatus} color={CONTACT_SKILLS[autoIndex].color} secondsLeft={secondsLeft} nextName={nextName} /></div>
      <div data-contact-card className="relative" style={{ perspective: 800 }}>
        <CodeCard ref={codeCardRef} skill={activeSkill} openTabs={cardStatus !== 'idle' ? openTabs : []} started={cardStatus !== 'idle'} isActive={isActive && cardStatus !== 'advancing'} onTabClick={handleTabClick} onTabClose={() => undefined} onTypingComplete={cardStatus !== 'done' ? advanceToNext : undefined} />
      </div>
      <ProgressRail autoIndex={autoIndex} isDone={cardStatus === 'done'} />
    </div>
  );
}
