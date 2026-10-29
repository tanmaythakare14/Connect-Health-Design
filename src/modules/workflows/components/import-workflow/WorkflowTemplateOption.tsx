import type { JSX } from 'react';
import { cva } from 'class-variance-authority';
import { RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import type { WorkflowTemplateOptionProps } from '../../@types';
import { WORKFLOW_TEMPLATE_CATEGORY_LABELS } from '../../constants';

// One calm tint per category label, so the list stays scannable without icons.
const categoryLabelVariants = cva(
  'text-xs font-semibold tracking-wide uppercase',
  {
    variants: {
      category: {
        hl7: 'text-blue-600 dark:text-blue-300',
        fhir: 'text-orange-600 dark:text-orange-300',
        insurance: 'text-emerald-600 dark:text-emerald-300',
        agentic: 'text-violet-600 dark:text-violet-300',
      },
    },
  },
);

export function WorkflowTemplateOption({
  template,
  isSelected,
  disabled = false,
}: WorkflowTemplateOptionProps): JSX.Element {
  const { id, name, description, category, nodeCount } = template;
  const radioId = `workflow-template-${id}`;

  return (
    // The whole card is the radio's label, so clicking anywhere selects it.
    <label
      htmlFor={radioId}
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-4 transition-all duration-150 ease-out',
        'hover:border-primary/40 hover:bg-accent/30 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/30',
        isSelected &&
          'border-primary bg-accent/40 shadow-sm hover:bg-accent/40',
        disabled && 'pointer-events-none opacity-60',
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className={categoryLabelVariants({ category })}>
            {WORKFLOW_TEMPLATE_CATEGORY_LABELS[category]}
          </span>
          <span aria-hidden className="text-xs text-muted-foreground">
            ·
          </span>
          <span className="text-xs text-muted-foreground">
            {nodeCount} nodes
          </span>
        </span>
        <span className="mt-1 block text-sm font-semibold text-foreground">
          {name}
        </span>
        <span className="mt-1 line-clamp-2 block text-sm text-muted-foreground">
          {description}
        </span>
      </span>

      <RadioGroupItem
        id={radioId}
        value={id}
        disabled={disabled}
        className="mt-0.5"
        aria-label={name}
      />
    </label>
  );
}
