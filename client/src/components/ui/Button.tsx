import * as React from "react";
import { Slot } from "@radix-ui/themes";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ─── Variants ────────────────────────────────────────────────────────────────

const buttonVariants = cva(
  // Base styles shared across ALL variants
  [
    "relative inline-flex items-center justify-center gap-2",
    "font-medium tracking-wide leading-none select-none",
    "rounded-md border border-transparent outline-none",
    "transition-all duration-200 ease-out",
    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[--color-background]",
    "disabled:pointer-events-none disabled:opacity-40",
    // Ripple / press feel
    "active:scale-[0.97]",
  ],
  {
    variants: {
      /**
       * Visual style of the button
       */
      variant: {
        /**
         * High-emphasis, filled action
         */
        solid: [
          "bg-[--color-accent-9] text-[--color-accent-contrast]",
          "border-[--color-accent-9]",
          "shadow-[0_1px_2px_rgba(0,0,0,.15),inset_0_1px_0_rgba(255,255,255,.08)]",
          "hover:bg-[--color-accent-10] hover:border-[--color-accent-10]",
          "hover:shadow-[0_2px_8px_rgba(0,0,0,.20),inset_0_1px_0_rgba(255,255,255,.10)]",
          "focus-visible:ring-[--color-accent-8]",
        ],

        /**
         * Medium-emphasis, outlined
         */
        outline: [
          "bg-transparent text-[--color-accent-11]",
          "border-[--color-accent-7]",
          "hover:bg-[--color-accent-2] hover:border-[--color-accent-8]",
          "focus-visible:ring-[--color-accent-8]",
        ],

        /**
         * Low-emphasis, ghost
         */
        ghost: [
          "bg-transparent text-[--color-accent-11]",
          "hover:bg-[--color-accent-3]",
          "focus-visible:ring-[--color-accent-8]",
        ],

        /**
         * Soft tinted surface
         */
        soft: [
          "bg-[--color-accent-3] text-[--color-accent-11]",
          "hover:bg-[--color-accent-4]",
          "focus-visible:ring-[--color-accent-7]",
        ],

        /**
         * Destructive / danger action
         */
        destructive: [
          "bg-red-600 text-white border-red-600",
          "shadow-[0_1px_2px_rgba(0,0,0,.15)]",
          "hover:bg-red-700 hover:border-red-700",
          "hover:shadow-[0_2px_8px_rgba(220,38,38,.35)]",
          "focus-visible:ring-red-500",
        ],

        /**
         * Plain link-like
         */
        link: [
          "bg-transparent text-[--color-accent-11] underline-offset-4",
          "hover:underline",
          "focus-visible:ring-[--color-accent-8]",
          "active:scale-100",
        ],
      },

      /**
       * Size of the button
       */
      size: {
        xs: "h-7 px-2.5 text-xs gap-1.5 rounded",
        sm: "h-8 px-3 text-sm gap-1.5",
        md: "h-9 px-4 text-sm gap-2",
        lg: "h-10 px-5 text-base gap-2",
        xl: "h-12 px-6 text-base gap-2.5 rounded-lg",
      },

      /**
       * Stretch to fill parent
       */
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },

      /**
       * Square icon-only button
       */
      iconOnly: {
        true: "px-0 aspect-square",
        false: "",
      },

      /**
       * Show a shimmer/loading animation
       */
      loading: {
        true: "cursor-wait",
        false: "",
      },
    },

    // Size × iconOnly overrides to keep aspect-ratio correct
    compoundVariants: [
      { iconOnly: true, size: "xs", class: "w-7" },
      { iconOnly: true, size: "sm", class: "w-8" },
      { iconOnly: true, size: "md", class: "w-9" },
      { iconOnly: true, size: "lg", class: "w-10" },
      { iconOnly: true, size: "xl", class: "w-12" },
    ],

    defaultVariants: {
      variant: "solid",
      size: "md",
      fullWidth: false,
      iconOnly: false,
      loading: false,
    },
  }
);

// ─── Spinner ─────────────────────────────────────────────────────────────────

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin shrink-0", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Render as a different element while keeping Button styles.
   * Uses Radix `Slot` under the hood.
   * @example <Button asChild><a href="/dashboard">Go</a></Button>
   */
  asChild?: boolean;

  /**
   * Show a loading spinner and disable interactions.
   */
  loading?: boolean;

  /**
   * Icon to render before the label.
   */
  leftIcon?: React.ReactNode;

  /**
   * Icon to render after the label.
   */
  rightIcon?: React.ReactNode;
}

// ─── Component ───────────────────────────────────────────────────────────────

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      iconOnly,
      loading,
      asChild = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const spinnerSize: Record<NonNullable<typeof size>, string> = {
      xs: "size-3",
      sm: "size-3.5",
      md: "size-4",
      lg: "size-4",
      xl: "size-5",
    };

    return (
      <Comp
        ref={ref}
        disabled={disabled || loading === true}
        aria-busy={loading ? "true" : undefined}
        className={cn(
          buttonVariants({ variant, size, fullWidth, iconOnly, loading }),
          className
        )}
        {...props}
      >
        {/* Loading spinner replaces leftIcon when loading */}
        {loading ? (
          <Spinner className={spinnerSize[size ?? "md"]} />
        ) : leftIcon ? (
          <span className="shrink-0 [&>svg]:size-[1em]" aria-hidden>
            {leftIcon}
          </span>
        ) : null}

        {/* Label — hidden accessibly when icon-only (pass aria-label on root) */}
        {!iconOnly && children && (
          <span className="truncate">{children}</span>
        )}

        {/* Icon-only children */}
        {iconOnly && (
          <span className="shrink-0 [&>svg]:size-[1.1em]" aria-hidden>
            {children}
          </span>
        )}

        {/* Right icon (hidden during loading) */}
        {!loading && rightIcon && (
          <span className="shrink-0 [&>svg]:size-[1em]" aria-hidden>
            {rightIcon}
          </span>
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

// ─── Exports ──────────────────────────────────────────────────────────────────

export { Button, buttonVariants };
