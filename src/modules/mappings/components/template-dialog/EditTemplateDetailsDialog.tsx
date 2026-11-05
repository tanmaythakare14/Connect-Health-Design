import { useEffect, useState, type JSX } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { FormDialog } from '@/components/common';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { logger } from '@/utils/logger';
import type { EditTemplateDetailsDialogProps } from '../../@types';
import {
  MAPPING_TEMPLATE_DESCRIPTION_MAX_LENGTH,
  MAPPING_TEMPLATE_NAME_MAX_LENGTH,
} from '../../constants';
import { CharacterCount } from '../shared';
import {
  templateDetailsSchema,
  type TemplateDetailsFormValues,
} from './schema';

const EMPTY_VALUES: TemplateDetailsFormValues = { name: '', description: '' };

/**
 * Rename a template or reword its description, from its card's Edit. What it
 * converts and which messages it handles aren't changed here.
 */
export function EditTemplateDetailsDialog({
  open,
  onOpenChange,
  template,
  onSubmit,
}: EditTemplateDetailsDialogProps): JSX.Element {
  const form = useForm<TemplateDetailsFormValues>({
    resolver: zodResolver(templateDetailsSchema),
    defaultValues: EMPTY_VALUES,
  });
  const { isSubmitting, isDirty } = form.formState;
  const [name, description] = useWatch({
    control: form.control,
    name: ['name', 'description'],
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Each open starts from the template as it is now.
  useEffect(() => {
    if (open && template) {
      form.reset({
        name: template.name,
        description: template.description ?? '',
      });
      setSubmitError(null);
    }
  }, [open, template, form]);

  const handleOpenChange = (nextOpen: boolean): void => {
    if (isSubmitting) return; // don't drop an in-flight save
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (
    values: TemplateDetailsFormValues,
  ): Promise<void> => {
    setSubmitError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      logger.error('Saving template details failed', {
        error,
        templateId: template?.id,
      });
      setSubmitError('We couldn’t save your changes. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <FormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Edit template"
        description="Rename it or update its description. Its format, message match and field mappings stay as they are."
        onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}
        submitLabel="Save changes"
        pendingLabel="Saving…"
        submitIcon={Save}
        isSubmitting={isSubmitting}
        canSubmit={name.trim().length > 0 && isDirty}
        error={submitError}
      >
        <div className="space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name
                  <span aria-hidden className="text-destructive">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Admission (ADT_A01)"
                    autoComplete="off"
                    autoFocus
                    maxLength={MAPPING_TEMPLATE_NAME_MAX_LENGTH}
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <div className="flex items-start justify-between gap-3">
                  <FormMessage />
                  <CharacterCount
                    length={name.length}
                    max={MAPPING_TEMPLATE_NAME_MAX_LENGTH}
                  />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Description
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </FormLabel>
                <FormControl>
                  {/* Several lines, so a longer description reads in full */}
                  <Textarea
                    placeholder="What does this template handle?"
                    rows={3}
                    {...field}
                    disabled={isSubmitting}
                    className="max-h-40 resize-none"
                  />
                </FormControl>
                <div className="flex items-start justify-between gap-3">
                  <FormMessage />
                  <CharacterCount
                    length={description.length}
                    max={MAPPING_TEMPLATE_DESCRIPTION_MAX_LENGTH}
                  />
                </div>
              </FormItem>
            )}
          />
        </div>
      </FormDialog>
    </Form>
  );
}
