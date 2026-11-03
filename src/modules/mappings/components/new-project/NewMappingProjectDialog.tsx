import { useState, type JSX } from 'react';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { logger } from '@/utils/logger';
import type { NewMappingProjectDialogProps } from '../../@types';
import {
  MAPPING_PROJECT_DESCRIPTION_MAX_LENGTH,
  MAPPING_PROJECT_NAME_MAX_LENGTH,
} from '../../constants';
import { CharacterCount } from '../shared';
import {
  newMappingProjectSchema,
  type NewMappingProjectFormValues,
} from './schema';

const DEFAULT_VALUES: NewMappingProjectFormValues = {
  name: '',
  description: '',
};

export function NewMappingProjectDialog({
  open,
  onOpenChange,
  onCreate,
}: NewMappingProjectDialogProps): JSX.Element {
  const form = useForm<NewMappingProjectFormValues>({
    resolver: zodResolver(newMappingProjectSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const { isSubmitting } = form.formState;
  const name = useWatch({ control: form.control, name: 'name' });
  const description = useWatch({ control: form.control, name: 'description' });
  // The only mandatory field is the name.
  const canSubmit = name.trim().length > 0 && !isSubmitting;
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const handleSubmit = async (
    values: NewMappingProjectFormValues,
  ): Promise<void> => {
    setSubmitError(null);
    try {
      await onCreate(values);
      form.reset(DEFAULT_VALUES);
    } catch (error) {
      logger.error('Creating mapping project failed', { error });
      setSubmitError('We couldn’t create the project. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New mapping project</DialogTitle>
          <DialogDescription>
            Name your project, then add templates to map fields between formats.
            You can change these later.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}
            noValidate
            className="space-y-5"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. ADT to MilkTracker"
                      autoComplete="off"
                      autoFocus
                      maxLength={MAPPING_PROJECT_NAME_MAX_LENGTH}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <div className="flex items-start justify-between gap-3">
                    <FormMessage />
                    <CharacterCount
                      length={name.length}
                      max={MAPPING_PROJECT_NAME_MAX_LENGTH}
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
                    <Textarea
                      placeholder="What does this project map?"
                      className="max-h-40 min-h-24 resize-none"
                      maxLength={MAPPING_PROJECT_DESCRIPTION_MAX_LENGTH}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <div className="flex items-start justify-between gap-3">
                    <FormMessage />
                    <CharacterCount
                      length={description.length}
                      max={MAPPING_PROJECT_DESCRIPTION_MAX_LENGTH}
                    />
                  </div>
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
                  'Create'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
