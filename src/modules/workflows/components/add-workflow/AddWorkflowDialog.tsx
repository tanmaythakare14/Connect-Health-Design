import { useCallback, useEffect, useState, type JSX } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { logger } from '@/utils/logger';
import type {
  AddWorkflowDialogProps,
  ConnectionOptionsState,
} from '../../@types';
import { WORKFLOW_DESCRIPTION_MAX_LENGTH } from '../../constants';
import {
  apiDtoToConnectionSummary,
  listConnectionOptions,
} from '../../service';
import { ConnectionMultiSelect } from './ConnectionMultiSelect';
import { addWorkflowSchema, type AddWorkflowFormValues } from './schema';

const DEFAULT_VALUES: AddWorkflowFormValues = {
  name: '',
  description: '',
  connectionIds: [],
};

export function AddWorkflowDialog({
  open,
  onOpenChange,
  onCreate,
}: AddWorkflowDialogProps): JSX.Element {
  const form = useForm<AddWorkflowFormValues>({
    resolver: zodResolver(addWorkflowSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const { isSubmitting } = form.formState;
  const name = useWatch({ control: form.control, name: 'name' });
  const description = useWatch({ control: form.control, name: 'description' });
  // The only mandatory field is the name.
  const canSubmit = name.trim().length > 0 && !isSubmitting;

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [optionsState, setOptionsState] = useState<ConnectionOptionsState>({
    status: 'loading',
  });

  const loadOptions = useCallback(async (): Promise<void> => {
    setOptionsState({ status: 'loading' });
    try {
      const dtos = await listConnectionOptions();
      setOptionsState({
        status: 'success',
        data: dtos.map(apiDtoToConnectionSummary),
      });
    } catch (error) {
      logger.error('Loading connection options failed', { error });
      setOptionsState({ status: 'error' });
    }
  }, []);

  // Fetch the options the first time the dialog opens (and after a failure).
  useEffect(() => {
    if (open && optionsState.status !== 'success') {
      void loadOptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to opening
  }, [open]);

  const handleOpenChange = (nextOpen: boolean): void => {
    if (isSubmitting) {
      return; // don't drop an in-flight create
    }
    if (!nextOpen) {
      form.reset(DEFAULT_VALUES);
      setSubmitError(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (values: AddWorkflowFormValues): Promise<void> => {
    setSubmitError(null);
    try {
      await onCreate(values);
      form.reset(DEFAULT_VALUES);
    } catch (error) {
      logger.error('Creating workflow failed', { error });
      setSubmitError('We couldn’t create the workflow. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-6 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add workflow</DialogTitle>
          <DialogDescription>
            Name your workflow and choose which connections it can use. You can
            change these later.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            noValidate
            className="space-y-5"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workflow name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Lab results to FHIR"
                      autoComplete="off"
                      autoFocus
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
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
                    <Textarea
                      placeholder="What does this workflow do?"
                      className="max-h-48 min-h-28 resize-none"
                      maxLength={WORKFLOW_DESCRIPTION_MAX_LENGTH}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <div className="flex items-start justify-between gap-3">
                    <FormMessage />
                    <span
                      aria-hidden
                      className="ml-auto text-xs text-muted-foreground tabular-nums"
                    >
                      {description.length}/{WORKFLOW_DESCRIPTION_MAX_LENGTH}
                    </span>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="connectionIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Allowed connections
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <ConnectionMultiSelect
                      options={
                        optionsState.status === 'success'
                          ? optionsState.data
                          : []
                      }
                      value={field.value}
                      onChange={field.onChange}
                      isLoading={optionsState.status === 'loading'}
                      hasError={optionsState.status === 'error'}
                      onRetry={() => void loadOptions()}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Only these connections can be used in the workflow. Leave
                    empty to add them later.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError && (
              <p role="alert" className="text-sm text-destructive">
                {submitError}
              </p>
            )}

            <DialogFooter className="pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="animate-spin" aria-hidden />
                    Creating…
                  </>
                ) : (
                  'Create and open'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
