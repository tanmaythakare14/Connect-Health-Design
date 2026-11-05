import { useState, type JSX } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  MOCK_LIQUID_BASE,
  MOCK_LIQUID_REPEAT_SECTIONS,
} from '../../mocks/liquidTemplate';
import { LiquidCodePanel } from './LiquidCodePanel';
import { LiquidFullScreenDialog } from './LiquidFullScreenDialog';

/** Which code is open full screen: the base, or a repeat section by index. */
type FullScreenTarget = { kind: 'base' } | { kind: 'repeat'; index: number };

/**
 * The Target panel's Liquid tab: the compiled base template (editable) and
 * each repeating mapping's own Liquid (read-only), which is merged with the
 * base at render.
 */
export function LiquidView(): JSX.Element {
  // MOCK: compiled from the mappings once the compiler exists; edits don't
  // flow back into the tree yet.
  const [baseCode, setBaseCode] = useState(MOCK_LIQUID_BASE);
  const repeatSections = MOCK_LIQUID_REPEAT_SECTIONS;
  const [fullScreen, setFullScreen] = useState<FullScreenTarget | null>(null);
  // Kept while the dialog closes, so its content doesn't vanish mid-animation.
  const [lastFullScreen, setLastFullScreen] = useState<FullScreenTarget>({
    kind: 'base',
  });

  const openFullScreen = (target: FullScreenTarget): void => {
    setLastFullScreen(target);
    setFullScreen(target);
  };

  const shownSection =
    lastFullScreen.kind === 'repeat'
      ? repeatSections[lastFullScreen.index]
      : undefined;

  return (
    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-3">
      <section aria-labelledby="liquid-base-heading" className="space-y-2">
        <p id="liquid-base-heading" className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Compiled Liquid</span> —
          updates live as you map fields. Edit it here and the Target tree,
          Table and wires update to match.
        </p>
        <LiquidCodePanel
          code={baseCode}
          onChange={setBaseCode}
          label="Compiled Liquid"
          onOpenFullScreen={() => openFullScreen({ kind: 'base' })}
        />
      </section>

      {repeatSections.map((section, index) => (
        <section
          key={`${section.sourceSegment}-${section.targetPath}`}
          aria-label={`Repeating mapping ${section.sourceSegment} to ${section.targetPath}`}
          className="space-y-2"
        >
          <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            Repeating mapping
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-px font-mono text-[11px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              {section.sourceSegment}
              <ArrowRight aria-hidden className="size-3" />
              {section.targetPath}[]
            </span>
            — compiled separately, merged with the base at render.
          </p>
          <LiquidCodePanel
            code={section.code}
            label={`Repeating mapping ${section.sourceSegment} to ${section.targetPath}`}
            onOpenFullScreen={() => openFullScreen({ kind: 'repeat', index })}
          />
        </section>
      ))}

      <LiquidFullScreenDialog
        open={fullScreen !== null}
        onOpenChange={(open) => {
          if (!open) setFullScreen(null);
        }}
        title={
          shownSection ? (
            <span className="flex items-center gap-1.5">
              Repeating mapping
              <span className="font-mono text-primary">
                {shownSection.sourceSegment} → {shownSection.targetPath}[]
              </span>
            </span>
          ) : (
            'Compiled Liquid'
          )
        }
        code={shownSection ? shownSection.code : baseCode}
        onChange={shownSection ? undefined : setBaseCode}
      />
    </div>
  );
}
