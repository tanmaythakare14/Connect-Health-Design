import type { JSX } from 'react';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { TemplateFormatFlowProps } from '../../@types';
import {
  TEMPLATE_INPUT_TYPE_LABELS,
  TEMPLATE_OUTPUT_TYPE_LABELS,
} from '../../constants';

const FORMAT_BADGE_CLASS_NAME =
  'rounded-md border-primary/30 bg-accent px-1.5 py-0 text-[11px] font-semibold tracking-wide text-primary';

/** "HL7 → FHIR / JSON  ADT_A01 · v2.5.1": what it reads, what it writes. */
export function TemplateFormatFlow({
  inputType,
  outputType,
  messageType,
  messageVersion,
}: TemplateFormatFlowProps): JSX.Element {
  const input = TEMPLATE_INPUT_TYPE_LABELS[inputType];
  const output = TEMPLATE_OUTPUT_TYPE_LABELS[outputType];
  const message = [messageType, messageVersion && `v${messageVersion}`]
    .filter(Boolean)
    .join(' · ');

  return (
    <div
      className="flex min-w-0 items-center gap-1.5"
      aria-label={`Maps ${input} to ${output}${message ? `, ${message}` : ''}`}
    >
      <Badge variant="outline" className={FORMAT_BADGE_CLASS_NAME}>
        {input}
      </Badge>
      <ArrowRight
        aria-hidden
        className="size-3.5 shrink-0 text-muted-foreground"
      />
      <Badge variant="outline" className={FORMAT_BADGE_CLASS_NAME}>
        {output}
      </Badge>
      {message && (
        <span
          aria-hidden
          title={message}
          className="ml-1 truncate font-mono text-xs text-muted-foreground"
        >
          {message}
        </span>
      )}
    </div>
  );
}
