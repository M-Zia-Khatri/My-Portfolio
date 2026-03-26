import type { ComponentType } from 'react';

// ─── Terminal ────────────────────────────────────────────────────────────────
export type TerminalLine =
  | { kind: 'command'; text: string } // typed char-by-char, shows $ prompt
  | { kind: 'output'; text: string } // appears instantly after command runs
  | { kind: 'comment'; text: string } // dimmed # comment line
  | { kind: 'blank' }; // empty spacer row

// ─── Skill ───────────────────────────────────────────────────────────────────
interface SkillBase {
  name: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  fileName: string;
  lang: string;
  color: string;
}

interface CodeSkill extends SkillBase {
  mode: 'code';
  code: string[];
}

interface TerminalSkill extends SkillBase {
  mode: 'terminal';
  commands: TerminalLine[];
}

export type Skill = CodeSkill | TerminalSkill;
export type Token = { text: string; color: string };
