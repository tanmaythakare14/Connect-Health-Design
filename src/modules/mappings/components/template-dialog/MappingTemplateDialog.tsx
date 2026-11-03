import { useEffect, useState, type JSX } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Save } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { logger } from '@/utils/logger';
import type { MappingTemplateDialogProps } from '../../@types';
import {
  ANY_VERSION,
  CATALOG_MODE,
  MAPPING_TEMPLATE_DESCRIPTION_MAX_LENGTH,
  MAPPING_TEMPLATE_NAME_MAX_LENGTH,
  TEMPLATE_INPUT_TYPE,
  TEMPLATE_INPUT_TYPE_OPTIONS,
  TEMPLATE_OUTPUT_TYPE,
} from '../../constants';
import { mappingTemplateToFormValues } from '../../service';
import { CharacterCount } from '../shared';
import { CustomJsonSchemaField } from './CustomJsonSchemaField';
import { MessageMatchFields } from './MessageMatchFields';
import { OutputTypePicker } from './OutputTypePicker';
import {
  mappingTemplateSchema,
  type MappingTemplateFormValues,
} from './schema';

const DEFAULT_VALUES: MappingTemplateFormValues = {
  name: '',
  description: '',
  inputType: TEMPLATE_INPUT_TYPE.HL7,
  outputType: TEMPLATE_OUTPUT_TYPE.FHIR_JSON,
  messageTypeMode: CATALOG_MODE.CATALOG,
  messageType: '',
  versionMode: CATALOG_MODE.CATALOG,
  messageVersion: ANY_VERSION,
  inputSchema: '',
};

const RequiredMark = (): JSX.Element => (
  <span aria-hidden className="text-destructive">
    *
  </span>
);

/** Add a template to a project, or edit one's details (`template` set). */
export function MappingTemplateDialog({
  open,
  onOpenChange,
  template,
  onSubmit,
}: MappingTemplateDialogProps): JSX.Element {
  const isEditing = template !== null;
  const form = useForm<MappingTemplateFormValues>({
    resolver: zodResolver(mappingTemplateSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const { isSubmitting, isDirty } = form.formState;
  const [name, description, inputType, messageType] = useWatch({
    control: form.control,
    name: ['name', 'description', 'inputType', 'messageType'],
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isCustomJson = inputType === TEMPLATE_INPUT_TYPE.CUSTOM_JSON;
  // Adding needs a name and (except Custom JSON) a message type; editing
  // needs any change on top.
  const hasRequired =
    name.trim().length > 0 && (isCustomJson || messageType.trim().length > 0);
  const canSubmit = hasRequired && (!isEditing || isDirty);

  // Each open starts from the template being edited, or a blank form.
  useEffect(() => {
    if (open) {
      form.reset(
        template ? mappingTemplateToFormValues(template) : DEFAULT_VALUES,
      );
      setSubmitError(null);
    }
  }, [open, template, form]);

  const handleOpenChange = (nextOpen: boolean): void => {
    if (isSubmitting) {
      return; // don't drop an in-flight save
    }
    onOpenChange(nextOpen);
  };

  // A different input type has a different catalog, so its picks start over.
  const handleInputTypeChange = (
    next: MappingTemplateFormValues['inputType'],
  ): void => {
    form.setValue('inputType', next, { shouldDirty: true });
    form.setValue('messageTypeMode', CATALOG_MODE.CATALOG);
    form.setValue('messageType', '');
    form.setValue('versionMode', CATALOG_MODE.CATALOG);
    form.setValue('messageVersion', ANY_VERSION);
    form.clearErrors(['messageType', 'messageVersion', 'inputSchema']);
  };

  const handleSubmit = async (
    values: MappingTemplateFormValues,
  ): Promise<void> => {
    setSubmitError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      logger.error('Saving mapping template failed', { error });
      setSubmitError(
        isEditing
          ? 'We couldn’t save your changes. Please try again.'
          : 'We couldn’t create the template. Please try again.',
      );
    }
  };

  return (
    <Form {...form}>
      <FormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={isEditing ? 'Edit template' : 'Add template'}
        description={
          isEditing
            ? 'Change what this template converts or which messages it handles. Its field mappings stay as they are.'
            : 'Tell the Mapper what this template reads and what it produces. You’ll map the fields in the editor next.'
        }
        onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}
        submitLabel={isEditing ? 'Save changes' : 'Create template'}
        pendingLabel={isEditing ? 'Saving…' : 'Creating…'}
        submitIcon={isEditing ? Save : Plus}
        isSubmitting={isSubmitting}
        canSubmit={canSubmit}
        error={submitError}
        className="sm:max-w-2xl"
      >
        {/* The fields scroll on short screens; the buttons stay in view. */}
        <div className="-mx-6 max-h-[min(60vh,560px)] space-y-5 overflow-y-auto px-6 py-1">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name
                  <RequiredMark />
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
                  <Input
                    placeholder="What does this template handle?"
                    autoComplete="off"
                    maxLength={MAPPING_TEMPLATE_DESCRIPTION_MAX_LENGTH}
                    {...field}
                    disabled={isSubmitting}
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

          <FormField
            control={form.control}
            name="inputType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Input type
                  <RequiredMark />
                </FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    const option = TEMPLATE_INPUT_TYPE_OPTIONS.find(
                      (item) => item.value === value,
                    );
                    if (option && option.value !== field.value) {
                      handleInputTypeChange(option.value);
                    }
                  }}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TEMPLATE_INPUT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex items-baseline gap-2">
                          {option.label}
                          <span className="text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="outputType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Output type
                  <RequiredMark />
                </FormLabel>
                <OutputTypePicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormItem>
            )}
          />

          {/* key replays the entrance when the input type changes */}
          <div
            key={inputType}
            className="animate-in fade-in-0 slide-in-from-top-1 duration-200"
          >
            {inputType === TEMPLATE_INPUT_TYPE.CUSTOM_JSON ? (
              <CustomJsonSchemaField
                isEditing={isEditing}
                disabled={isSubmitting}
              />
            ) : (
              <MessageMatchFields
                inputType={inputType}
                disabled={isSubmitting}
              />
            )}
          </div>
        </div>
      </FormDialog>
    </Form>
  );
}
