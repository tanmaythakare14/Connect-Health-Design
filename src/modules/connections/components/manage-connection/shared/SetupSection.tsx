import type { JSX } from 'react';
import { cn } from '@/lib/utils';
import type { SetupSectionProps } from '../../../@types';

/**
 * A numbered setup step card. The number always shows; the circle fills in
 * with the primary colour once the step is complete.
 */
export function SetupSection({
  id,
  step,
  title,
  description,
  isComplete,
  children,
}: SetupSectionProps): JSX.Element {
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-6 rounded-xl border bg-card animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
    >
      <div className="flex items-start gap-3 border-b px-5 py-4">
        <span
          aria-hidden
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors duration-200',
            isComplete
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-primary/40 bg-accent text-accent-foreground',
          )}
        >
          {step}
        </span>
        <div className="min-w-0 space-y-0.5 pt-0.5">
          <h2 id={headingId} className="text-sm font-semibold text-foreground">
            <span className="sr-only">
              Step {step}
              {isComplete ? ', complete' : ''}:{' '}
            </span>
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
