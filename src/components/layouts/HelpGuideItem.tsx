import type { JSX } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { HelpGuideItemProps } from './types';

export function HelpGuideItem({
  guide,
  onSelect,
}: HelpGuideItemProps): JSX.Element {
  const Icon = guide.icon;

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => onSelect(guide.id)}
      className="group h-auto w-full items-start justify-start gap-3 rounded-lg border border-transparent px-2 py-2.5 text-left whitespace-normal transition-all duration-150 hover:border-primary/40 hover:bg-accent/60 focus-visible:border-primary"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary transition-transform duration-200 ease-out group-hover:scale-105">
        <Icon className="size-4" aria-hidden />
      </span>

      <span className="min-w-0 flex-1 space-y-0.5">
        <span className="block text-sm font-semibold text-foreground">
          {guide.title}
        </span>
        <span className="block text-xs font-normal text-muted-foreground">
          {guide.description}
        </span>
      </span>

      <span className="flex shrink-0 flex-col items-end gap-1 pt-0.5">
        {guide.isNew && <Badge className="rounded-full px-2">New</Badge>}
        <span className="text-xs font-normal whitespace-nowrap text-muted-foreground">
          {guide.steps} {guide.steps === 1 ? 'step' : 'steps'}
        </span>
      </span>
    </Button>
  );
}
