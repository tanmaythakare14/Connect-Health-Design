import type { JSX } from 'react';
import { PencilRuler } from 'lucide-react';
import { EmptyState } from '@/components/common';
import type { LogsPlaceholderProps } from '../../@types';

/** Stands in for log views that haven't been designed yet. */
export function LogsPlaceholder({
  title,
  description,
}: LogsPlaceholderProps): JSX.Element {
  return (
    <div className="rounded-xl border bg-card">
      <EmptyState icon={PencilRuler} title={title} description={description} />
    </div>
  );
}
