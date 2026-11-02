import type { JSX } from 'react';
import { PencilRuler } from 'lucide-react';
import { EmptyState } from '@/components/common';
import type { SettingsPlaceholderProps } from '../../@types';

/** Stands in for a settings screen's content until it's designed. */
export function SettingsPlaceholder({
  title,
  description,
}: SettingsPlaceholderProps): JSX.Element {
  return (
    <div className="rounded-xl border border-dashed bg-muted/30">
      <EmptyState icon={PencilRuler} title={title} description={description} />
    </div>
  );
}
