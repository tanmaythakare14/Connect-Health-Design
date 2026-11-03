import type { JSX } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Route } from 'lucide-react';
import {
  FormControl,
  FormDescription,
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
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  CatalogMode,
  MappingTemplateFormValues,
  MessageMatchFieldsProps,
} from '../../@types';
import {
  ANY_VERSION,
  CATALOG_MODE,
  TEMPLATE_MESSAGE_CATALOGS,
} from '../../constants';
import { CatalogCombobox } from './CatalogCombobox';
import { CatalogModeToggle } from './CatalogModeToggle';

/** Radix Select can't hold '', so "any version" travels as this inside it. */
const ANY_VERSION_ITEM = '__any__';

const RequiredMark = (): JSX.Element => (
  <span aria-hidden className="text-destructive">
    *
  </span>
);

/**
 * Which messages the template handles: a message type (required) and the
 * versions it accepts. Each can come from the catalog or be typed in.
 */
export function MessageMatchFields({
  inputType,
  disabled = false,
}: MessageMatchFieldsProps): JSX.Element {
  const form = useFormContext<MappingTemplateFormValues>();
  const catalog = TEMPLATE_MESSAGE_CATALOGS[inputType];
  const [messageTypeMode, versionMode] = useWatch({
    control: form.control,
    name: ['messageTypeMode', 'versionMode'],
  });

  /**
   * Catalog → Custom keeps the picked code so it can be tweaked; Custom →
   * Catalog keeps it only when the catalog knows it.
   */
  const switchMode = (
    modeField: 'messageTypeMode' | 'versionMode',
    valueField: 'messageType' | 'messageVersion',
    known: string[],
    mode: CatalogMode,
  ): void => {
    const current = form.getValues(valueField).trim();
    form.setValue(modeField, mode, { shouldDirty: true });
    if (mode === CATALOG_MODE.CATALOG && !known.includes(current)) {
      form.setValue(valueField, '', { shouldDirty: true });
    }
    form.clearErrors(valueField);
  };

  return (
    <section
      aria-labelledby="template-matching-heading"
      className="space-y-5 rounded-xl border bg-muted/30 p-4"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-primary"
        >
          <Route className="size-4" />
        </span>
        <div className="space-y-0.5">
          <h3
            id="template-matching-heading"
            className="text-sm font-semibold text-foreground"
          >
            Message matching
          </h3>
          <p className="text-xs text-muted-foreground">
            The Mapper node sends an incoming message to this template when it
            matches. You map the fields in the editor.
          </p>
        </div>
      </div>

      <FormField
        control={form.control}
        name="messageType"
        render={({ field, fieldState }) => (
          <FormItem>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <FormLabel>
                {catalog.question}
                <RequiredMark />
              </FormLabel>
              <CatalogModeToggle
                label="Where the message type comes from"
                value={messageTypeMode}
                onChange={(mode) =>
                  switchMode(
                    'messageTypeMode',
                    'messageType',
                    catalog.types.map((option) => option.value),
                    mode,
                  )
                }
                disabled={disabled}
              />
            </div>
            <FormControl>
              {messageTypeMode === CATALOG_MODE.CATALOG ? (
                <CatalogCombobox
                  options={catalog.types}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    form.clearErrors('messageType');
                  }}
                  placeholder={catalog.selectPlaceholder}
                  searchPlaceholder={catalog.searchPlaceholder}
                  invalid={fieldState.invalid}
                  disabled={disabled}
                />
              ) : (
                <Input
                  placeholder={catalog.customPlaceholder}
                  autoComplete="off"
                  className="font-mono"
                  {...field}
                  disabled={disabled}
                />
              )}
            </FormControl>
            {messageTypeMode === CATALOG_MODE.CUSTOM && (
              <FormDescription className="text-xs">
                {catalog.customHint}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="messageVersion"
        render={({ field }) => (
          <FormItem>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <FormLabel>
                Message version
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </FormLabel>
              <CatalogModeToggle
                label="Where the message version comes from"
                value={versionMode}
                onChange={(mode) =>
                  switchMode(
                    'versionMode',
                    'messageVersion',
                    catalog.versions,
                    mode,
                  )
                }
                disabled={disabled}
              />
            </div>
            {versionMode === CATALOG_MODE.CATALOG ? (
              <Select
                value={
                  field.value === ANY_VERSION ? ANY_VERSION_ITEM : field.value
                }
                onValueChange={(value) =>
                  field.onChange(
                    value === ANY_VERSION_ITEM ? ANY_VERSION : value,
                  )
                }
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-64">
                  <SelectItem value={ANY_VERSION_ITEM}>Any version</SelectItem>
                  <SelectSeparator />
                  {catalog.versions.map((version) => (
                    <SelectItem key={version} value={version}>
                      {version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <FormControl>
                <Input
                  placeholder={catalog.versionCustomPlaceholder}
                  autoComplete="off"
                  className="font-mono"
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
            )}
            <FormDescription className="text-xs">
              Only used to pick this template. Leave it on Any version to accept
              every version.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  );
}
