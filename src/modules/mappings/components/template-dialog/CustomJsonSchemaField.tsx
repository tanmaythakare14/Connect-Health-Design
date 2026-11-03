import type { JSX } from 'react';
import { useFormContext } from 'react-hook-form';
import { Braces, Info } from 'lucide-react';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import type {
  CustomJsonSchemaFieldProps,
  MappingTemplateFormValues,
} from '../../@types';

const SCHEMA_PLACEHOLDER = `{
  "patient": { "id": "", "name": "", "birthDate": "" },
  "visit": { "unit": "", "admittedAt": "" }
}`;

/** Custom JSON's representation schema, which shapes the input field tree. */
export function CustomJsonSchemaField({
  isEditing,
  disabled = false,
}: CustomJsonSchemaFieldProps): JSX.Element {
  const form = useFormContext<MappingTemplateFormValues>();

  return (
    <section
      aria-labelledby="template-schema-heading"
      className="space-y-4 rounded-xl border bg-muted/30 p-4"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-primary"
        >
          <Braces className="size-4" />
        </span>
        <div className="space-y-0.5">
          <h3
            id="template-schema-heading"
            className="text-sm font-semibold text-foreground"
          >
            Input shape
          </h3>
          <p className="text-xs text-muted-foreground">
            Custom JSON has no catalog, so describe what the incoming JSON looks
            like.
          </p>
        </div>
      </div>

      <div className="flex gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 text-xs text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200">
        <Info aria-hidden className="mt-px size-3.5 shrink-0" />
        <p>
          The representation schema is used only to build the input field tree;
          values are never saved. The sample payload is added later in the
          editor.
        </p>
      </div>

      <FormField
        control={form.control}
        name="inputSchema"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Representation schema
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder={SCHEMA_PLACEHOLDER}
                spellCheck={false}
                className="max-h-56 min-h-32 resize-y bg-background font-mono text-xs"
                {...field}
                disabled={disabled}
              />
            </FormControl>
            <FormDescription className="text-xs">
              {isEditing
                ? 'Leave empty to keep the current field tree.'
                : 'Paste a JSON object; leave empty to build the tree from a sample later.'}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  );
}
