import type { JSX } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { TemplateEditorHeaderProps } from '../../@types';

const CRUMB_BUTTON_CLASS_NAME =
  'rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

/** Where you are: Mappings / project / template. The crumbs are the way back. */
export function TemplateEditorHeader({
  project,
  template,
  onBack,
  onBackToProjects,
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
    </header>
  );
}
