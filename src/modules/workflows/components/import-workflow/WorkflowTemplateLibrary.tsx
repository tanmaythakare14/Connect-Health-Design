import { useMemo, type JSX } from 'react';
import { CircleAlert, Search, SearchX } from 'lucide-react';
import { EmptyState } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import type { WorkflowTemplateLibraryProps } from '../../@types';
import { filterTemplatesByName } from '../../utils';
import { WorkflowTemplateOption } from './WorkflowTemplateOption';

const SKELETON_COUNT = 3;

export function WorkflowTemplateLibrary({
  listState,
  search,
  onSearchChange,
  selectedTemplateId,
  onSelectTemplate,
  onRetry,
  disabled = false,
}: WorkflowTemplateLibraryProps): JSX.Element {
  const templates = useMemo(
    () =>
      listState.status === 'success'
        ? filterTemplatesByName(listState.data, search)
        : [],
    [listState, search],
  );

  const renderList = (): JSX.Element => {
    if (listState.status === 'loading') {
      return (
        <div className="space-y-2" aria-busy>
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-xl border p-4"
            >
              <Skeleton className="size-10 bg-muted" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24 bg-muted" />
                <Skeleton className="h-4 w-2/3 bg-muted" />
                <Skeleton className="h-4 w-full bg-muted" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (listState.status === 'error') {
      return (
        <EmptyState
          tone="destructive"
          icon={CircleAlert}
          title="The library didn’t load"
          description="Please try again in a moment."
          action={
            <Button variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          }
        />
      );
    }

    if (templates.length === 0) {
      return (
        <EmptyState
          icon={SearchX}
          title="No templates match your search"
          description="Try a different name."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSearchChange('')}
            >
              Clear search
            </Button>
          }
        />
      );
    }

    return (
      <RadioGroup
        value={selectedTemplateId ?? ''}
        onValueChange={onSelectTemplate}
        aria-label="Workflow templates"
        disabled={disabled}
        className="gap-2"
      >
        {templates.map((template) => (
          <WorkflowTemplateOption
            key={template.id}
            template={template}
            isSelected={template.id === selectedTemplateId}
            disabled={disabled}
          />
        ))}
      </RadioGroup>
    );
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name"
          aria-label="Search templates by name"
          className="pl-9"
          disabled={disabled || listState.status !== 'success'}
        />
      </div>

      {/* Fixed-height scroll area keeps the dialog from jumping as results change */}
      <div className="h-80 overflow-y-auto pr-1">{renderList()}</div>
    </div>
  );
}
