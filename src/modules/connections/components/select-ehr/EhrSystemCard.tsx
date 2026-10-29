import type { JSX } from 'react';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { EhrSystemCardProps } from '../../@types';
import { EHR_CAPABILITY_PREVIEW_COUNT } from '../../constants';

const CAPABILITY_CHIP_CLASS_NAME =
  'rounded-md border-transparent bg-muted font-normal text-muted-foreground';

export function EhrSystemCard({
  ehrSystem,
  onSelect,
}: EhrSystemCardProps): JSX.Element {
  const { name, description, monogram, capabilities, isAvailable } = ehrSystem;
  const visibleCapabilities = capabilities.slice(
    0,
    EHR_CAPABILITY_PREVIEW_COUNT,
  );
  const hiddenCapabilities = capabilities.slice(EHR_CAPABILITY_PREVIEW_COUNT);

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col rounded-xl border bg-card p-5 transition-all duration-200 ease-out',
        isAvailable
          ? 'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-within:border-primary/60 focus-within:ring-[3px] focus-within:ring-ring/20'
          : 'bg-muted/30',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-lg border bg-background text-sm font-semibold tracking-tight transition-colors duration-200',
            isAvailable
              ? 'text-primary group-hover:border-primary/30 group-hover:bg-accent'
              : 'text-muted-foreground',
          )}
        >
          {monogram}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2
              className={cn(
                'truncate text-base font-semibold',
                isAvailable ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {name}
            </h2>
            {!isAvailable && (
              <Badge
                variant="outline"
                className="shrink-0 rounded-full font-medium text-muted-foreground"
              >
                Coming soon
              </Badge>
            )}
          </div>
          <p
            title={description}
            className="mt-1 line-clamp-2 text-sm text-muted-foreground"
          >
            {description}
          </p>
        </div>
      </div>

      <ul
        aria-label={`${name} capabilities`}
        className={cn(
          'mt-4 flex flex-wrap gap-1.5',
          !isAvailable && 'opacity-60',
        )}
      >
        {visibleCapabilities.map((capability) => (
          <li key={capability}>
            <Badge variant="outline" className={CAPABILITY_CHIP_CLASS_NAME}>
              {capability}
            </Badge>
          </li>
        ))}
        {hiddenCapabilities.length > 0 && (
          <li className="relative z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  tabIndex={0}
                  className={cn(CAPABILITY_CHIP_CLASS_NAME, 'cursor-default')}
                  aria-label={`${hiddenCapabilities.length} more: ${hiddenCapabilities.join(', ')}`}
                >
                  +{hiddenCapabilities.length} more
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-64">
                {hiddenCapabilities.join(' · ')}
              </TooltipContent>
            </Tooltip>
          </li>
        )}
      </ul>

      {/* mt-auto pins the footer to the bottom so cards in a row line up */}
      <div className="mt-auto pt-5">
        <div className="flex items-center justify-end border-t pt-3">
          {isAvailable ? (
            // The ::after overlay stretches this button over the whole card,
            // so the card is one large click target with a single tab stop.
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelect(ehrSystem)}
              aria-label={`Select ${name}`}
              className="-mr-2 text-primary after:absolute after:inset-0 after:rounded-xl after:content-[''] hover:bg-accent hover:text-primary"
            >
              Select
              <ArrowRight
                aria-hidden
                className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
              />
            </Button>
          ) : (
            <span className="py-1.5 text-sm text-muted-foreground">
              Not available yet
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
