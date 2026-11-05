import type { JSX } from 'react';
import { FileUp, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SampleEmptyStateProps } from '../../@types';

/** No sample yet: a field tree has nothing to show until one is uploaded. */
export function SampleEmptyState({
  title,
  description,
  actionLabel,
  onUpload,
}: SampleEmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 py-12 text-center">
      <span
        aria-hidden
        className="flex size-11 items-center justify-center rounded-xl bg-accent text-primary"
      >
        <FileUp className="size-5" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Button type="button" size="sm" onClick={onUpload}>
        <Upload aria-hidden />
        {actionLabel}
      </Button>
    </div>
  );
}
