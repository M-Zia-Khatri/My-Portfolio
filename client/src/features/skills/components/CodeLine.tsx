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
  const tokens = useMemo(() => tokenise(line), [line]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="code-line relative flex items-center"
      style={{ minHeight: '1.6rem' }}
    >
      {hovered && (isDoneLine || isActiveLine) && (
        <span
          className="pointer-events-none absolute inset-0"
          style={{ background: `${color}0d`, borderLeft: `2px solid ${color}55` }}
        />
      )}
      {isActiveLine && (
        <span
          className="pointer-events-none absolute inset-0"
          style={{ background: `${color}08`, borderLeft: `2px solid ${color}44` }}
        />
      )}
      <span
        className="relative w-10 shrink-0 pr-4 text-right text-[11px] leading-[1.6rem] transition-colors duration-150 select-none"
        style={{
          color: isActiveLine ? `${color}cc` : hovered ? `${color}88` : 'rgba(255,255,255,0.18)',
        }}
      >
        {index + 1}
      </span>
      <span className="relative text-[12.5px] leading-[1.6rem] tracking-tight whitespace-pre">
        {tokens.map((tok, j) => (
          <span key={j} style={{ color: tok.color }}>
            {tok.text}
          </span>
        ))}
        {isActiveLine && (
          <span
            data-code-cursor="true"
            className="ml-[1px] inline-block h-[13px] w-[2px] align-middle"
            style={{ background: color, opacity: cursor ? 1 : 0, transition: 'opacity 0.08s' }}
          />
        )}
      </span>
    </div>
  );
});

export default CodeLine;
