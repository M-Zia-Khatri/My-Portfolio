import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { loginSchema, type LoginFields } from '../auth.schema';
import { AUTH_CONFIG } from '../auth.config';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { useApiError } from '../hooks/useApiError';
import { DialogShell } from './DialogShell';
import { FieldError } from './ui/FieldError';
import { ApiErrorBanner } from './ui/ApiErrorBanner';
import { SubmitButton } from './ui/SubmitButton';

// ─── SHARED INPUT HELPERS ─────────────────────────────────────────────────────

function getInputStyle(hasError: boolean): React.CSSProperties {
  return {
    background: 'var(--gray-3)',
    borderColor: hasError ? 'var(--red-8, #b91c1c)' : 'var(--gray-6)',
    color: 'var(--gray-12)',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.25)',
  };
}

function onFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = 'var(--blue-8)';
  e.currentTarget.style.boxShadow =
    '0 0 0 3px var(--blue-a4), inset 0 1px 3px rgba(0,0,0,0.25)';
}

function onBlur(e: React.FocusEvent<HTMLInputElement>, hasError: boolean) {
  e.currentTarget.style.borderColor = hasError
    ? 'var(--red-8, #b91c1c)'
    : 'var(--gray-6)';
  e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.25)';
}

// ─── LABEL ────────────────────────────────────────────────────────────────────

function Label({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'block text-xs font-medium mb-1.5 tracking-wide select-none'
      )}
      style={{ color: 'var(--gray-11)' }}
    >
      {children}
    </label>
  );
}

// ─── PROPS ────────────────────────────────────────────────────────────────────

interface LoginFormProps {
  open: boolean;
  onSuccess: (email: string) => void;
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export function LoginForm({ open, onSuccess }: LoginFormProps) {
  // ── local refs
  const emailRef = useRef<HTMLInputElement | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── UI state
  const [showPassword, setShowPassword] = useState(false);

  // ── API
  const { mutateAsync: login, isPending } = useLogin();
  const { error, clearError, handleError } = useApiError();

  // ── Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
  });

  // ─── BUG FIX #1 ────────────────────────────────────────────────────────────
  // Destructure RHF's ref out of register() so we can merge it with our local
  // emailRef for auto-focus. Passing ref={emailRef} after spreading
  // {...register("email")} would silently OVERWRITE RHF's ref, making RHF
  // unable to read the uncontrolled input's value → Zod receives `undefined`
  // → "Invalid input: expected string, received undefined".
  const { ref: emailFormRef, ...emailRest } = register('email');
  const { ref: passwordFormRef, ...passwordRest } = register('password');

  // Auto-focus first field on open
  useEffect(() => {
    if (!open) return;
    clearError();
    reset();
    setShowPassword(false);
    const id = setTimeout(() => emailRef.current?.focus(), 80);
    return () => clearTimeout(id);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup auto-hide timer on unmount
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // ── Handlers
  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => {
      const next = !prev;
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (next) {
        hideTimerRef.current = setTimeout(() => setShowPassword(false), 5_000);
      }
      return next;
    });
  }, []);

  async function onSubmit(values: LoginFields) {
    clearError();
    try {
      await login(values);
      onSuccess(values.email);
    } catch (err) {
      handleError(err, 'Login failed. Please try again.');
    }
  }

  return (
    <DialogShell open={open} dialogKey="login" config={AUTH_CONFIG.login}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn('space-y-5')}
        noValidate
      >
        <ApiErrorBanner message={error} />

        {/* Email */}
        <div>
          <Label htmlFor="login-email">Email address</Label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="admin@example.com"
            {...emailRest}
            ref={(el) => {
              // Merge RHF ref + local ref
              emailFormRef(el);
              emailRef.current = el;
            }}
            className={cn(
              'w-full rounded-xl px-4 py-2.5 text-sm outline-none',
              'border font-mono placeholder:opacity-25 transition-none'
            )}
            style={getInputStyle(!!errors.email)}
            onFocus={onFocus}
            onBlur={(e) => onBlur(e, !!errors.email)}
          />
          <FieldError message={errors.email?.message} />
        </div>

        {/* Password */}
        <div>
          <Label htmlFor="login-password">Password</Label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              {...passwordRest}
              ref={passwordFormRef}
              className={cn(
                'w-full rounded-xl px-4 py-2.5 pr-11 text-sm outline-none',
                'border font-mono placeholder:opacity-40 transition-none'
              )}
              style={getInputStyle(!!errors.password)}
              onFocus={onFocus}
              onBlur={(e) => onBlur(e, !!errors.password)}
              onChange={(e) => {
                passwordRest.onChange(e);
                // Reset auto-hide timer on every keystroke when visible
                if (showPassword) {
                  if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
                  hideTimerRef.current = setTimeout(
                    () => setShowPassword(false),
                    5_000
                  );
                }
              }}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={handleTogglePassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                'transition-colors duration-150'
              )}
              style={{ color: 'var(--gray-9)' }}
            >
              {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>
          <FieldError message={errors.password?.message} />
        </div>

        {/* Divider */}
        <div
          className={cn('h-px w-full')}
          style={{ background: 'var(--gray-4)' }}
        />

        <SubmitButton isPending={isPending} label="Continue →" />
      </form>
    </DialogShell>
  );
}
