import { AppNavigation } from '@/shared/constants/navigation.constants';
import { cn } from '@/shared/utils/cn';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { memo, useCallback, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useHasVisited } from './hooks/useHasVisited';

// ─── Animation variants (module-level — created once) ────────────────────────

/**
 * Container stagger: children animate in sequence with a short delay between
 * each one.  Total time from first to last item ≈ 0.9 s.
 */
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

/**
 * Individual item: fade up 24 px, spring-settle into place.
 * The spring keeps motion feeling organic rather than mechanical.
 */
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 220, damping: 28 },
  },
};

/** Thin accent line above the name — slides in from the left. */
const lineVariants: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
  },
};

/** Exit: whole page fades and slides up cleanly before route change. */
const pageExitVariants: Variants = {
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.4, ease: 'easeIn' },
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Background layer: scanline grid + radial glow.
 * Pure CSS — zero JS, zero layout cost.
 * memo: this component never re-renders (no props).
 */
const Background = memo(function Background() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Noise texture — reuses the existing bg-noise asset from Home */}
      <div className="absolute inset-0 bg-[url(@/assets/images/bg-noise.png)] opacity-[0.025]" />

      {/* Fine scanline grid — gives depth without motion cost */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            'linear-gradient(rgba(112,193,229,0.04) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(112,193,229,0.04) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '48px 48px',
        }}
      />

      {/* Radial glow centred slightly above — draws the eye upward */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 70% 55% at 50% 38%, color-mix(in srgb, var(--blue-4) 40%, transparent) 0%, transparent 100%)',
          ].join(', '),
        }}
      />

      {/* Bottom fade — grounds the composition */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48"
        style={{
          background: 'linear-gradient(to top, var(--color-background), transparent)',
        }}
      />
    </div>
  );
});

/**
 * Pulsing status badge — reads "PORTFOLIO // 2026" in a mono chip.
 * Signals "live" / "online" without adding network requests.
 */
const StatusBadge = memo(function StatusBadge() {
  return (
    <motion.div variants={itemVariants} className="flex items-center gap-2">
      {/* Breathing dot */}
      <motion.span
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: 'var(--blue-9)', boxShadow: '0 0 8px var(--blue-9)' }}
      />
      <span
        className={cn('font-mono text-[10px] tracking-[0.22em] uppercase', 'select-none')}
        style={{ color: 'var(--blue-11)', opacity: 0.7 }}
      >
        Portfolio&nbsp;
        <span style={{ color: 'var(--gray-8)' }}>//</span>
        &nbsp;2026
      </span>
    </motion.div>
  );
});

/** Thin horizontal rule that scales in from the left origin. */
const AccentLine = memo(function AccentLine() {
  return (
    <motion.div
      variants={lineVariants}
      className="h-px w-16 origin-left"
      style={{
        background: 'linear-gradient(90deg, var(--blue-9), transparent)',
        boxShadow: '0 0 8px var(--blue-a7)',
      }}
    />
  );
});

/** CTA button — bordered, glowing inner shadow on hover. */
interface EnterButtonProps {
  onClick: () => void;
  isExiting: boolean;
}

const EnterButton = memo(function EnterButton({ onClick, isExiting }: EnterButtonProps) {
  return (
    <motion.button
      variants={itemVariants}
      onClick={onClick}
      disabled={isExiting}
      whileHover={!isExiting ? { scale: 1.03 } : {}}
      whileTap={!isExiting ? { scale: 0.97 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'group relative mt-2 overflow-hidden',
        'rounded-sm border px-10 py-3.5',
        'font-mono text-xs tracking-[0.28em] uppercase',
        'cursor-pointer transition-colors duration-300',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'focus-visible:outline-none focus-visible:ring-2',
      )}
      style={
        {
          borderColor: 'var(--blue-8)',
          color: isExiting ? 'var(--blue-12)' : 'var(--blue-11)',
          background: 'transparent',
          boxShadow: 'none',
          // Focus ring colour
          '--tw-ring-color': 'var(--blue-8)',
        } as React.CSSProperties
      }
    >
      {/* Fill sweep on hover — GPU-composited translate */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-0"
        initial={{ x: '-101%' }}
        whileHover={!isExiting ? { x: '0%' } : {}}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ background: 'color-mix(in srgb, var(--blue-9) 12%, transparent)' }}
      />

      {/* Label */}
      <span className="relative flex items-center gap-3">
        {isExiting ? (
          // Spinner during exit animation
          <svg
            className="h-3 w-3 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          // Arrow icon — translates right on hover via group
          <motion.span
            aria-hidden
            className="inline-block"
            whileHover={{ x: 3 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            →
          </motion.span>
        )}
        {isExiting ? 'Loading…' : 'Enter Site'}
      </span>
    </motion.button>
  );
});

// ─── LandingPage ──────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate();
  const { hasVisited, markVisited } = useHasVisited();
  const [isExiting, setIsExiting] = useState(false);

  // ── Auto-redirect returning visitors ──────────────────────────────────────
  // Synchronous redirect — no flash of the landing screen.
  if (hasVisited) {
    return <Navigate to={AppNavigation.HOME_ROUTE} replace />;
  }

  // ── CTA handler ───────────────────────────────────────────────────────────
  const handleEnter = useCallback(() => {
    if (isExiting) return;

    setIsExiting(true);

    // Write flag *before* navigate so it survives even if navigation is
    // synchronous and the component unmounts before the callback fires.
    markVisited();

    // Delay matches the exit animation duration (0.4 s) so the user sees
    // the fade-out before the new route mounts.
    setTimeout(() => {
      navigate(AppNavigation.HOME_ROUTE, { replace: true });
    }, 420);
  }, [isExiting, markVisited, navigate]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence mode="wait">
      <motion.main
        key="landing"
        {...pageExitVariants}
        className={cn(
          'relative flex min-h-dvh w-full flex-col items-center justify-center',
          'overflow-hidden',
        )}
        style={{ background: 'var(--color-background)' }}
      >
        <Background />

        {/* ── Main content ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isExiting ? 'hidden' : 'visible'}
          className="relative z-10 flex flex-col items-center gap-5 px-6 text-center"
        >
          {/* Status badge */}
          <StatusBadge />

          {/* Accent line */}
          <AccentLine />

          {/* Name */}
          <motion.h1
            variants={itemVariants}
            className={cn(
              'font-black uppercase tracking-[0.08em]',
              'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
              'leading-none',
            )}
            style={{
              color: 'var(--gray-12)',
              textShadow: '0 0 40px color-mix(in srgb, var(--blue-9) 30%, transparent)',
            }}
          >
            Muhammad
            <br />
            <span
              className="inline-block"
              style={{
                color: 'var(--blue-11)',
                textShadow: '0 0 60px var(--blue-a8)',
              }}
            >
              Zia Khatri
            </span>
          </motion.h1>

          {/* Role */}
          <motion.p
            variants={itemVariants}
            className={cn('font-mono text-xs tracking-[0.3em] uppercase', 'select-none')}
            style={{ color: 'var(--gray-9)' }}
          >
            Full-Stack Developer
            <span className="mx-3 inline-block opacity-40" style={{ color: 'var(--blue-8)' }}>
              ·
            </span>
            Karachi, PK
          </motion.p>

          {/* Tagline */}
          <motion.p
            variants={itemVariants}
            className={cn('max-w-xs text-sm leading-relaxed', 'sm:max-w-sm md:max-w-md')}
            style={{ color: 'var(--gray-9)' }}
          >
            Building fast, scalable web applications — from clean architecture to polished
            interfaces.
          </motion.p>

          {/* CTA */}
          <EnterButton onClick={handleEnter} isExiting={isExiting} />

          {/* Subtle skip hint */}
          <motion.p
            variants={itemVariants}
            className="font-mono text-[10px] tracking-widest"
            style={{ color: 'var(--gray-7)', opacity: 0.6 }}
          >
            Press Enter or click above
          </motion.p>
        </motion.div>

        {/* ── Bottom corner meta ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isExiting ? 0 : 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-6 left-0 right-0 flex items-center justify-between px-8"
          aria-hidden="true"
        >
          <span
            className="font-mono text-[9px] tracking-[0.2em] uppercase"
            style={{ color: 'var(--gray-7)' }}
          >
            v1.0.0
          </span>
          <span
            className="font-mono text-[9px] tracking-[0.2em] uppercase"
            style={{ color: 'var(--gray-7)' }}
          >
            React · Node.js · TypeScript
          </span>
        </motion.div>
      </motion.main>
    </AnimatePresence>
  );
}
