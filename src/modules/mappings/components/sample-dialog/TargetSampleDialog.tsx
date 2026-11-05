import { useEffect, useId, useState, type FormEvent, type JSX } from 'react';
import { FileInput, Info, Layers, TextQuote } from 'lucide-react';
import { FormDialog } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { TargetSampleDialogProps } from '../../@types';
import {
  FHIR_BUNDLE_STARTER,
  FHIR_BUNDLE_STARTER_RESOURCE,
  FHIR_RESOURCE_TYPES,
} from '../../constants';
import { formatJsonPayload, validateJsonPayload } from '../../utils';
import { CodeEditor } from '../shared';
import { FhirResourcePicker } from './FhirResourcePicker';

const SECTION_LABEL_CLASS_NAME = 'text-sm font-medium text-foreground';

/**
 * Pastes (or starts from FHIR resources) a JSON example of the output. Its
 * fields become the target tree; it can also be kept with the template and,
 * once marked synthetic, used as the output template itself.
 */
export function TargetSampleDialog({
  open,
  onOpenChange,
  hasSample,
  messageType,
  canUseAsOutputTemplate,
  initialPayload,
  initialSaveWithTemplate,
  initialUseAsOutputTemplate,
  onLoad,
}: TargetSampleDialogProps): JSX.Element {
  const ids = useId();
  const [payload, setPayload] = useState('');
  const [resources, setResources] = useState<string[]>([]);
  const [saveWithTemplate, setSaveWithTemplate] = useState(false);
  const [useAsOutputTemplate, setUseAsOutputTemplate] = useState(false);

  // Each open starts from the current target sample.
  useEffect(() => {
    if (!open) return;
    setPayload(initialPayload);
    setResources([]);
    setSaveWithTemplate(initialSaveWithTemplate);
    setUseAsOutputTemplate(initialUseAsOutputTemplate);
  }, [
    open,
    initialPayload,
    initialSaveWithTemplate,
    initialUseAsOutputTemplate,
  ]);

  const payloadError = validateJsonPayload(payload);
  const canSubmit = payload.trim() !== '' && !payloadError;
  // The sample's values are stored when it's the output template, so that's
  // only offered once it's marked synthetic.
  const isTemplateOptionOn = useAsOutputTemplate && saveWithTemplate;

  const toggleResource = (resource: string): void => {
    setResources((current) =>
      current.includes(resource)
        ? current.filter((item) => item !== resource)
        : [...current, resource],
    );
  };

  /** Starts the sample over as a Bundle around a Patient, and picks Patient. */
  const handleStartBundle = (): void => {
    setPayload(FHIR_BUNDLE_STARTER);
    setResources((current) =>
      current.includes(FHIR_BUNDLE_STARTER_RESOURCE)
        ? current
        : [FHIR_BUNDLE_STARTER_RESOURCE, ...current],
    );
  };

  const handleSaveWithTemplateChange = (checked: boolean): void => {
    setSaveWithTemplate(checked);
    if (!checked) setUseAsOutputTemplate(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!canSubmit) return;
    onLoad({
      payload: formatJsonPayload(payload),
      resources,
      saveWithTemplate,
      useAsOutputTemplate: isTemplateOptionOn,
    });
    onOpenChange(false);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={hasSample ? 'Replace the target sample' : 'Add a target sample'}
      onSubmit={handleSubmit}
      submitLabel="Load target fields"
      submitIcon={FileInput}
      isSubmitting={false}
      canSubmit={canSubmit}
      className="sm:max-w-2xl"
    >
      {/* The fields scroll on short screens; the buttons stay in view. */}
      <div className="-mx-6 max-h-[min(64vh,640px)] space-y-5 overflow-y-auto px-6 py-1">
        <div className="flex gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 text-xs text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200">
          <Info aria-hidden className="mt-px size-3.5 shrink-0" />
          <p>
            Fills the target tree. By default only the field structure and names
            are saved — tick the box below to also save this sample with the
            template.
          </p>
        </div>

        <div className="space-y-2.5">
          <div className="space-y-0.5">
            <p className={SECTION_LABEL_CLASS_NAME}>
              Start from FHIR resources
            </p>
            <p className="text-xs text-muted-foreground">
              {messageType ? (
                <>
                  Suggested for{' '}
                  <span className="font-mono text-foreground">
                    {messageType}
                  </span>
                  : start from the sample below, or pick resources — pick more
                  than one to build a Bundle.
                </>
              ) : (
                'Start from the sample below, or pick resources — pick more than one to build a Bundle.'
              )}
            </p>
          </div>
          <FhirResourcePicker
            options={FHIR_RESOURCE_TYPES}
            selected={resources}
            onToggle={toggleResource}
          />
          {resources.length > 0 && (
            <p className="text-xs text-muted-foreground" aria-live="polite">
              <span className="font-medium text-foreground">
                {resources.length}
              </span>{' '}
              {resources.length === 1 ? 'resource' : 'resources'} picked
              {resources.length > 1 &&
                ' — they’ll be combined into a Bundle'}.{' '}
              <button
                type="button"
                onClick={() => setResources([])}
                className="font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:underline"
              >
                Clear
              </button>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label
              htmlFor={`${ids}-payload`}
              className={SECTION_LABEL_CLASS_NAME}
            >
              Sample JSON
              <span aria-hidden className="text-destructive">
                *
              </span>
            </Label>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleStartBundle}
                className="h-7 px-2.5 text-xs"
              >
                <Layers aria-hidden className="size-3.5" />
                Start a FHIR Bundle
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPayload(formatJsonPayload(payload))}
                disabled={payload.trim() === '' || Boolean(payloadError)}
                className="h-7 px-2.5 text-xs"
              >
                <TextQuote aria-hidden className="size-3.5" />
                Format
              </Button>
            </div>
          </div>
          <CodeEditor
            id={`${ids}-payload`}
            value={payload}
            onChange={setPayload}
            language="json"
            placeholder="Paste a JSON example of the output"
            invalid={Boolean(payloadError)}
            describedBy={`${ids}-payload-hint`}
          />
          <p
            id={`${ids}-payload-hint`}
            role={payloadError ? 'alert' : undefined}
            className={
              payloadError
                ? 'text-xs text-destructive'
                : 'text-xs text-muted-foreground'
            }
          >
            {payloadError ?? 'A JSON object. Format indents it neatly.'}
          </p>
        </div>

        <div className="space-y-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
            <Checkbox
              checked={saveWithTemplate}
              onCheckedChange={(checked) =>
                handleSaveWithTemplateChange(checked === true)
              }
              className="mt-0.5"
            />
            <span className="text-sm text-foreground">
              This is synthetic test data (no PHI).{' '}
              <span className="text-muted-foreground">
                Save it with the template so the preview works on reopen without
                a re-paste.
              </span>
            </span>
          </label>

          {canUseAsOutputTemplate && (
            <label
              className={cn(
                'flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-opacity',
                saveWithTemplate
                  ? 'cursor-pointer bg-muted/30'
                  : 'cursor-not-allowed opacity-60',
              )}
            >
              <Checkbox
                checked={isTemplateOptionOn}
                onCheckedChange={(checked) =>
                  setUseAsOutputTemplate(checked === true)
                }
                disabled={!saveWithTemplate}
                className="mt-0.5"
              />
              <span className="space-y-0.5">
                <span className="block text-sm text-foreground">
                  Use this sample as the output template
                </span>
                <span className="block text-xs text-muted-foreground">
                  {saveWithTemplate
                    ? 'Every field you don’t map keeps the value from your sample. Use the edit button on a field to keep it or type your own.'
                    : 'Tick the synthetic-data box first — the sample’s values are saved with the template.'}
                </span>
              </span>
            </label>
          )}
        </div>
      </div>
    </FormDialog>
  );
}
