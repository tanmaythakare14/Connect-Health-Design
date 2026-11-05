import type { JSX } from 'react';
import { Check, Loader2, Save, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TemplateEditorActionsProps } from '../../@types';
import { TemplateFormatFlow, TemplateStatusIndicator } from '../template-card';

/**
 * What the template converts and its status, then the editor's actions:
 * Auto-map and Save. Sits on the right of the Mappings | Filters strip.
 */
export function TemplateEditorActions({
  template,
  onAutoMap,
  onSave,
  hasUnsavedChanges,
  isSaving,
}: TemplateEditorActionsProps): JSX.Element {
  return (
    <div className="flex items-center gap-4">
      <div className="hidden items-center gap-4 text-xs lg:flex">
        <TemplateFormatFlow
          inputType={template.inputType}
          outputType={template.outputType}
          messageType={template.messageType}
          messageVersion={template.messageVersion}
        />
        <span aria-hidden className="h-4 w-px bg-border" />
        <TemplateStatusIndicator status={template.status} />
        <span aria-hidden className="h-5 w-px bg-border" />
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onAutoMap}>
          <Sparkles aria-hidden className="text-primary" />
          Auto-map fields
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onSave}
          disabled={!hasUnsavedChanges || isSaving}
          className="min-w-20"
        >
          {isSaving ? (
            <Loader2 aria-hidden className="animate-spin" />
          ) : hasUnsavedChanges ? (
            <Save aria-hidden />
          ) : (
            <Check aria-hidden />
          )}
          {isSaving ? 'Saving…' : hasUnsavedChanges ? 'Save' : 'Saved'}
        </Button>
      </div>
    </div>
  );
}
