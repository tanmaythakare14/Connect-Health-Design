import type { JSX } from 'react';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { EhrSystemCardProps } from '../../@types';
import { EHR_CAPABILITY_PREVIEW_COUNT } from '../../constants';
import { getEhrLogo } from '../../utils';
import { EhrLogo } from '../shared';

// Neutral chips: the logos carry the colour, the card stays quiet.
const CAPABILITY_CHIP_CLASS_NAME =
  'rounded-md border-transparent bg-muted px-2 font-normal text-muted-foreground';

/**
 * One EHR to pick. Minimal by design: logo, name, a line of description and
 * its capabilities. The whole card is the button; "Select" only takes the
 * brand colour on hover or focus.
 */
export function EhrSystemCard({
  ehrSystem,
  onSelect,
}: EhrSystemCardProps): JSX.Element {
  const { id, name, description, monogram, capabilities, isAvailable } =
    ehrSystem;
  const logo = getEhrLogo(id);
  const visibleCapabilities = capabilities.slice(
    0,
    EHR_CAPABILITY_PREVIEW_COUNT,
  );
  const hiddenCapabilities = capabilities.slice(EHR_CAPABILITY_PREVIEW_COUNT);

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col rounded-xl border bg-card p-5 transition-[border-color,box-shadow] duration-200',
        isAvailable
          ? 'hover:border-foreground/20 hover:shadow-sm has-[:focus-visible]:border-primary/50 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/30'
          : 'bg-muted/30',
      )}
    >
      {/* Logo and name share one line; the description runs full width
          below, so nothing leaves a gap under the logo. */}
      <div className="flex items-center gap-3">
        {logo ? (
          // The name is in the heading beside it, so the logo is decorative.
          <EhrLogo
            src={logo}
            alt=""
            className={cn(
              'h-9 w-20 px-1.5 py-1.5',
              !isAvailable && 'opacity-60 grayscale',
            )}
          />
        ) : (
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background text-xs font-semibold tracking-tight text-muted-foreground"
          >
            {monogram}
          </span>
        )}
        <h2
          title={name}
          className={cn(
            'min-w-0 truncate text-base font-semibold',
            isAvailable ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {name}
        </h2>
      </div>

      {/* Two lines' height even when shorter, so chips line up across a row */}
      <p
        title={description}
        className="mt-3 line-clamp-2 min-h-10 text-sm text-muted-foreground"
      >
        {description}
      </p>

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
          // Above the card-wide button, so its tooltip still opens.
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
        {/* A tertiary button: light tint, brand text. It's the look only;
            the card-wide button below does the selecting. */}
        {isAvailable ? (
          <span
            aria-hidden
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-accent/60 text-sm font-medium text-primary transition-colors group-hover:bg-accent group-has-[:focus-visible]:bg-accent"
          >
            Select {name}
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </span>
        ) : (
          <span className="flex h-9 w-full items-center justify-center rounded-md bg-muted text-sm font-medium text-muted-foreground">
            Coming soon
          </span>
        )}
      </div>

      {isAvailable && (
        // Covers the whole card, so anywhere on it selects the EHR.
        <button
          type="button"
          onClick={() => onSelect(ehrSystem)}
          aria-label={`Select ${name}`}
          className="absolute inset-0 cursor-pointer rounded-xl outline-none"
        />
      )}
    </article>
  );
}
