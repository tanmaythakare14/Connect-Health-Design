import type { JSX } from 'react';
import { Check, Loader2, Save, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { TemplateEditorHeaderProps } from '../../@types';
import { TemplateFormatFlow, TemplateStatusIndicator } from '../template-card';

const CRUMB_BUTTON_CLASS_NAME =
  'rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

/**
 * Where you are (Mappings / project / template), what the template converts,
 * and the editor's actions: Auto-map and Save.
 */
export function TemplateEditorHeader({
  project,
  template,
  onBack,
  onBackToProjects,
  onAutoMap,
  onSave,
  hasUnsavedChanges,
  isSaving,
}: TemplateEditorHeaderProps): JSX.Element {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
      {/* One line: Mappings / project / template — the template is the title.
          The crumbs are the way back. */}
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-nowrap gap-1.5 sm:gap-2">
          <BreadcrumbItem className="shrink-0">
            <BreadcrumbLink asChild>
              <button
                type="button"
                onClick={onBackToProjects}
                className={CRUMB_BUTTON_CLASS_NAME}
              >
                Mappings
              </button>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {/* The project name gives way first when space runs short. */}
          <BreadcrumbItem className="min-w-0 shrink-[3]">
            <BreadcrumbLink asChild>
              <button
                type="button"
                onClick={onBack}
                title={project.name}
                className={`${CRUMB_BUTTON_CLASS_NAME} max-w-56 truncate`}
              >
                {project.name}
              </button>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem className="min-w-0">
            {/* The current crumb doubles as the page heading. */}
            <BreadcrumbPage
              role="heading"
              aria-level={1}
              title={template.name}
              className="block truncate font-semibold"
            >
              {template.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="hidden shrink-0 items-center gap-4 text-xs md:flex">
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

      <div className="flex shrink-0 items-center gap-2">
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
    </header>
  );
}
