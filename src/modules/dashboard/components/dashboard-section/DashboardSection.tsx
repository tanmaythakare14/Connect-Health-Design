import type { JSX } from 'react';
import { cva } from 'class-variance-authority';
import type { DashboardSectionProps } from '../../@types';

const sectionVariants = cva('space-y-4', {
  variants: {
    variant: {
      contained: 'rounded-2xl border bg-muted/40 p-5',
      plain: '',
    },
  },
});

/**
 * One dashboard block: heading and subheading on the left, an optional
 * action on the right, then the block's content — optionally in a light panel.
 */
export function DashboardSection({
  id,
  title,
  description,
  icon: Icon,
  action,
  variant = 'contained',
  children,
}: DashboardSectionProps): JSX.Element {
  const headingId = `${id}-heading`;

  return (
    <section
      aria-labelledby={headingId}
      className={sectionVariants({ variant })}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border bg-card text-primary">
            <Icon aria-hidden className="size-4" />
          </span>
          <div className="min-w-0 space-y-0.5">
            <h2
              id={headingId}
              className="text-base font-semibold text-foreground"
            >
              {title}
            </h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {action}
      </div>

      {children}
    </section>
  );
}
