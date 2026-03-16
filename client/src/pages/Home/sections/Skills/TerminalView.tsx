import { memo, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import type { TerminalLine as TLine } from "./types";
import TerminalLine from "./TerminalLine";

interface TerminalViewProps {
  skillName: string;
  commands: TLine[];
  color: string;
}

interface Block {
  command: TLine & { kind: "command" };
  outputs: TLine[];
}

interface DisplayState {
  doneBlocks:    Block[];
  activeCommand: string;
  activeOutputs: TLine[];
  activeBlock:   Block | null;
  done:          boolean;
}

const INIT_STATE: DisplayState = {
  doneBlocks: [], activeCommand: "", activeOutputs: [], activeBlock: null, done: false,
};

function buildBlocks(commands: TLine[]): Block[] {
  const blocks: Block[] = [];
  let i = 0;
  while (i < commands.length) {
    const line = commands[i];
    if (line.kind === "command") {
      const outputs: TLine[] = [];
      i++;
      while (i < commands.length && commands[i].kind !== "command") {
        outputs.push(commands[i]);
        i++;
      }
      blocks.push({ command: line as TLine & { kind: "command" }, outputs });
    } else {
      i++;
    }
  }
  return blocks;
}

// ─── Memoized done-block row (never re-renders once committed) ────────────────
const DoneBlock = memo(function DoneBlock({
  block, bi, color,
}: { block: Block; bi: number; color: string }) {
  return (
    <div>
      <TerminalLine line={block.command} isActive={false} cursor={false} color={color} index={bi} />
      {block.outputs.map((out, oi) => (
        <TerminalLine key={oi} line={out} isActive={false} cursor={false} color={color} index={oi} />
      ))}
    </div>
  );
});

// ─── TerminalView ─────────────────────────────────────────────────────────────
export default function TerminalView({ skillName, commands, color }: TerminalViewProps) {
  const [state,  setState]  = useState<DisplayState>(INIT_STATE);
  const [cursor, setCursor] = useState(true);
  const tlRef    = useRef<gsap.core.Timeline | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Blink cursor
  useEffect(() => {
    const id = setInterval(() => setCursor((c) => !c), 530);
    return () => clearInterval(id);
  }, []);

  const blocks = useMemo(() => buildBlocks(commands), [commands]);

  // Auto-scroll to bottom as content is revealed.
  // scrollRef points to the content div; the scrollable container is its
  // .content-scrollbar ancestor in CodeCard.
  useEffect(() => {
    const el = scrollRef.current?.closest(".content-scrollbar") as HTMLElement | null;
    if (el) el.scrollTop = el.scrollHeight;
  }, [state.doneBlocks.length, state.activeOutputs.length, state.activeCommand]);

  // ── Single-tween GSAP typewriter (O(1) tweens instead of O(N chars)) ────────
  useEffect(() => {
    tlRef.current?.kill();
    setState(INIT_STATE);

    // Build a flat event table: { time, fn } — one entry per state transition
    type Event = { time: number; fn: () => void };
    const events: Event[] = [];
    let t = 0;

    blocks.forEach((block, bi) => {
      const cmdText = block.command.text;

      // Activate block
      events.push({ time: t, fn: () => setState((p) => ({ ...p, activeBlock: block, activeCommand: "", activeOutputs: [] })) });

      // Type each character — accumulate timing, record ONE event per char
      for (let ci = 1; ci <= cmdText.length; ci++) {
        const ch = cmdText[ci - 1];
        t += ch === " " ? 0.022 : 0.032 + Math.random() * 0.028;
        const snap = cmdText.slice(0, ci);
        events.push({ time: t, fn: () => setState((p) => ({ ...p, activeCommand: snap })) });
      }

      // Enter pause, then reveal outputs
      t += 0.18;
      block.outputs.forEach((outLine, oi) => {
        const snapOi = oi + 1;
        events.push({
          time: t,
          fn: () => setState((p) => ({ ...p, activeOutputs: block.outputs.slice(0, snapOi) })),
        });
        t += outLine.kind === "blank" ? 0.06 : 0.055;
      });

      // Commit block to done
      t += 0.22;
      events.push({
        time: t,
        fn: () => setState((p) => ({
          ...p,
          doneBlocks:    [...p.doneBlocks, block],
          activeBlock:   null,
          activeCommand: "",
          activeOutputs: [],
        })),
      });

      if (bi < blocks.length - 1) t += 0.35;
    });

    events.push({ time: t, fn: () => setState((p) => ({ ...p, done: true })) });

    const totalDuration = t + 0.05;

    // ── Key optimisation: one progress tween drives all callbacks ────────────
    // Instead of registering hundreds of tl.call() entries (one per character),
    // we store events in a sorted array and dispatch them from onUpdate.
    // This cuts the GSAP timeline node count from O(N chars) → O(1).
    const progress = { value: 0 };
    let nextEvent = 0;

    const tl = gsap.timeline();
    tlRef.current = tl;

    tl.to(progress, {
      value: totalDuration,
      duration: totalDuration,
      ease: "none",
      onUpdate() {
        const now = progress.value;
        while (nextEvent < events.length && events[nextEvent].time <= now) {
          events[nextEvent].fn();
          nextEvent++;
        }
      },
      onComplete() {
        // Flush any remaining events (handles floating-point drift)
        while (nextEvent < events.length) {
          events[nextEvent].fn();
          nextEvent++;
        }
      },
    });

    return () => { tl.kill(); };
  }, [skillName, blocks]);

  const { doneBlocks, activeBlock, activeCommand, activeOutputs, done } = state;

  return (
    <motion.div
      key={skillName}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
      ref={scrollRef}
      className="px-4 py-2"
    >
      {/* Stable done blocks — never re-render after committed */}
      {doneBlocks.map((block, bi) => (
        <DoneBlock key={`done-${bi}`} block={block} bi={bi} color={color} />
      ))}

      {/* Active block — only this subtree re-renders during typing */}
      {activeBlock && (
        <div>
          <TerminalLine
            line={activeBlock.command}
            partial={activeCommand}
            isActive={true}
            cursor={cursor}
            color={color}
            index={doneBlocks.length}
          />
          {activeOutputs.map((out, oi) => (
            <TerminalLine key={oi} line={out} isActive={false} cursor={false} color={color} index={oi} />
          ))}
        </div>
      )}

      {/* Idle cursor after animation completes */}
      {done && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center"
          style={{ minHeight: "1.6rem" }}
        >
          <span style={{ color }} className="text-[12.5px] font-bold mr-1.5 select-none">$</span>
          <span
            className="inline-block w-[2px] h-[13px] align-middle"
            style={{ background: color, opacity: cursor ? 1 : 0, transition: "opacity 0.08s" }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}