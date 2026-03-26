import { AnimatePresence, motion } from 'motion/react';
import { memo, useMemo, useState } from 'react';
import { tokenise } from './tokeniser';

interface CodeLineProps {
  line: string;
  index: number;
  isActiveLine: boolean;
  isDoneLine: boolean;
  cursor: boolean;
  color: string;
}

const CodeLine = memo(function CodeLine({
  line,
  index,
  isActiveLine,
  isDoneLine,
  cursor,
  color,
}: CodeLineProps) {
  const [hovered, setHovered] = useState(false);

  // Tokenise once per unique line — skipped on re-renders with same line text
  const tokens = useMemo(() => tokenise(line), [line]);

  return (
    <motion.div
      initial={isActiveLine && line.length <= 1 ? { opacity: 0, x: -10 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.12 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative flex items-center"
      style={{ minHeight: '1.6rem' }}
    >
      {/* Hover highlight */}
      <AnimatePresence>
        {hovered && (isDoneLine || isActiveLine) && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none absolute inset-0"
            style={{
              background: `${color}0d`,
              borderLeft: `2px solid ${color}55`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Active-line ambient glow */}
      {isActiveLine && (
        <motion.span
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: `${color}08`,
            borderLeft: `2px solid ${color}44`,
          }}
        />
      )}

      {/* Line number */}
      <span
        className="relative w-10 shrink-0 pr-4 text-right text-[11px] leading-[1.6rem] transition-colors duration-150 select-none"
        style={{
          color: isActiveLine ? `${color}cc` : hovered ? `${color}88` : 'rgba(255,255,255,0.18)',
        }}
      >
        {index + 1}
      </span>

      {/* Tokenised code */}
      <span className="relative text-[12.5px] leading-[1.6rem] tracking-tight whitespace-pre">
        {tokens.map((tok, j) => (
          <span key={j} style={{ color: tok.color }}>
            {tok.text}
          </span>
        ))}

        {/* Blinking cursor — only on the active (typing) line */}
        {isActiveLine && (
          <span
            className="ml-[1px] inline-block h-[13px] w-[2px] align-middle"
            style={{
              background: color,
              opacity: cursor ? 1 : 0,
              transition: 'opacity 0.08s',
            }}
          />
        )}
      </span>
    </motion.div>
  );
});

export default CodeLine;
