import type { JSX } from 'react';
import { cva } from 'class-variance-authority';
import {
  Activity,
  Clock,
  Shield,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { LogTab, LogTabBadgesProps } from '../../@types';

const badgeVariants = cva('h-7 gap-1.5 rounded-md px-2.5 font-medium', {
  variants: {
    tone: {
      success:
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
      accent: 'border-primary/25 bg-accent text-accent-foreground',
    },
  },
});

const BADGES_BY_TAB: Record<
  LogTab,
  Array<{
    label: string;
    icon: LucideIcon;
    tone: 'success' | 'accent';
    tooltip: string;
  }>
> = {
  application: [
    {
      label: 'Live',
      icon: Activity,
      tone: 'success',
      tooltip: 'New runs and events appear as they happen',
    },
    {
      label: 'Metadata only — no PHI',
      icon: ShieldCheck,
      tone: 'accent',
      tooltip:
        'Logs record IDs, timings and statuses only. Patient health information is never stored here.',
    },
  ],
  audit: [
    {
      label: 'HIPAA Compliant',
      icon: Shield,
      tone: 'success',
      tooltip:
        'Every access and change is recorded with who, what and when, as HIPAA audit controls require',
    },
    {
      label: 'Real-time',
      icon: Clock,
      tone: 'accent',
      tooltip: 'Actions are recorded the moment they happen',
    },
  ],
};

/** Trust and freshness badges for the active primary tab, on the tab row. */
export function LogTabBadges({ tab }: LogTabBadgesProps): JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {BADGES_BY_TAB[tab].map(({ label, icon: Icon, tone, tooltip }) => (
        <Tooltip key={label}>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              tabIndex={0}
              className={badgeVariants({ tone })}
            >
              <Icon aria-hidden className="size-3.5" />
              {label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-64">{tooltip}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
