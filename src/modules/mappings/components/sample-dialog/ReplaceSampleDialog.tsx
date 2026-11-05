import { useEffect, useId, useState, type FormEvent, type JSX } from 'react';
import { FileInput, Info, Lock, TextQuote, WandSparkles } from 'lucide-react';
import { toast } from 'sonner';
import { FormDialog } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CatalogMode, ReplaceSampleDialogProps } from '../../@types';
import {
  CATALOG_MODE,
  SAMPLE_PAYLOAD_EXAMPLES,
  TEMPLATE_INPUT_TYPE,
  TEMPLATE_INPUT_TYPE_LABELS,
  TEMPLATE_MESSAGE_CATALOGS,
} from '../../constants';
import { formatHl7Payload, validateHl7Payload } from '../../utils';
import { CodeEditor } from '../shared';
import { CatalogCombobox, CatalogModeToggle } from '../template-dialog';

const SECTION_LABEL_CLASS_NAME = 'text-sm font-medium text-foreground';

/** Radix Select can't hold '', so "any version" travels as this inside it. */
const ANY_VERSION_ITEM = '__any__';

/**
 * Pastes a new sample message for the template: which message it is, which
 * versions it covers, and the payload itself. The input type is fixed by
 * the template, so it's shown but can't be changed here.
 */
export function ReplaceSampleDialog({
  open,
  onOpenChange,
  inputType,
  initialMessageType,
  initialMessageVersion,
  initialPayload,
  initialSaveWithTemplate,
  onLoad,
}: ReplaceSampleDialogProps): JSX.Element {
  const ids = useId();
  const catalog =
    inputType === TEMPLATE_INPUT_TYPE.CUSTOM_JSON
      ? null
      : TEMPLATE_MESSAGE_CATALOGS[inputType];
  const isHl7 = inputType === TEMPLATE_INPUT_TYPE.HL7;

  const [mode, setMode] = useState<CatalogMode>(CATALOG_MODE.CATALOG);
  const [messageType, setMessageType] = useState('');
  const [messageVersion, setMessageVersion] = useState('');
  const [payload, setPayload] = useState('');
  const [saveWithTemplate, setSaveWithTemplate] = useState(false);

  // Each open starts from the template's message and the current sample.
  useEffect(() => {
    if (!open) return;
    const type = initialMessageType ?? '';
    const isKnown = catalog?.types.some((option) => option.value === type);
    setMode(type && !isKnown ? CATALOG_MODE.CUSTOM : CATALOG_MODE.CATALOG);
    setMessageType(type);
    setMessageVersion(initialMessageVersion ?? '');
    setPayload(initialPayload);
    setSaveWithTemplate(initialSaveWithTemplate);
  }, [
    open,
    catalog,
    initialMessageType,
    initialMessageVersion,
    initialPayload,
    initialSaveWithTemplate,
  ]);

  // The catalog's versions, plus the template's own if it's one the catalog
  // doesn't list, so it can still be shown and kept.
  const versionOptions =
    catalog && messageVersion && !catalog.versions.includes(messageVersion)
      ? [...catalog.versions, messageVersion]
      : (catalog?.versions ?? []);

  const payloadError = isHl7 ? validateHl7Payload(payload) : null;
  const segmentCount = payload.split('\n').filter((line) => line.trim()).length;
  const canSubmit =
    payload.trim() !== '' &&
    !payloadError &&
    (!catalog || messageType.trim() !== '');

  const example = SAMPLE_PAYLOAD_EXAMPLES[inputType];

  const handleLoadExample = (): void => {
    if (!example) return;
    setPayload(example);
    toast.success('Starter example loaded. Edit it as needed.');
  };

  /** Catalog → Custom keeps the pick; back to the catalog only if it knows it. */
  const handleModeChange = (next: CatalogMode): void => {
    setMode(next);
    const isKnown = catalog?.types.some(
      (option) => option.value === messageType.trim(),
    );
    if (next === CATALOG_MODE.CATALOG && !isKnown) setMessageType('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!canSubmit) return;
    onLoad({
      messageType: messageType.trim(),
      messageVersion: messageVersion.trim(),
      payload: isHl7 ? formatHl7Payload(payload) : payload.trim(),
      saveWithTemplate,
    });
    onOpenChange(false);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Replace the sample message"
      onSubmit={handleSubmit}
      submitLabel="Load source fields"
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
            The payload fills the source tree and the live preview. Nothing is
            saved unless you tick the box at the bottom.
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor={`${ids}-input-type`}
            className={SECTION_LABEL_CLASS_NAME}
          >
            Input type
          </Label>
          <div className="relative">
            <Input
              id={`${ids}-input-type`}
              value={TEMPLATE_INPUT_TYPE_LABELS[inputType]}
              disabled
              aria-describedby={`${ids}-input-type-hint`}
              className="pr-9 font-mono"
            />
            <Lock
              aria-hidden
              className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-muted-foreground"
            />
          </div>
          <p
            id={`${ids}-input-type-hint`}
            className="text-xs text-muted-foreground"
          >
            Set by the template. Edit the template to change it.
          </p>
        </div>

        {catalog && (
          <>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label
                  htmlFor={`${ids}-message-type`}
                  className={SECTION_LABEL_CLASS_NAME}
                >
                  {catalog.question}
                  <span aria-hidden className="text-destructive">
                    *
                  </span>
                </Label>
                <CatalogModeToggle
                  label="Where the message type comes from"
                  value={mode}
                  onChange={handleModeChange}
                />
              </div>
              {mode === CATALOG_MODE.CATALOG ? (
                <CatalogCombobox
                  id={`${ids}-message-type`}
                  options={catalog.types}
                  value={messageType}
                  onChange={setMessageType}
                  placeholder={catalog.selectPlaceholder}
                  searchPlaceholder={catalog.searchPlaceholder}
                />
              ) : (
                <>
                  <Input
                    id={`${ids}-message-type`}
                    value={messageType}
                    onChange={(event) => setMessageType(event.target.value)}
                    placeholder={catalog.customPlaceholder}
                    autoComplete="off"
                    spellCheck={false}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    {catalog.customHint}
                  </p>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor={`${ids}-version`}
                className={SECTION_LABEL_CLASS_NAME}
              >
                Message version
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Select
                value={
                  messageVersion === '' ? ANY_VERSION_ITEM : messageVersion
                }
                onValueChange={(value) =>
                  setMessageVersion(value === ANY_VERSION_ITEM ? '' : value)
                }
              >
                <SelectTrigger
                  id={`${ids}-version`}
                  aria-describedby={`${ids}-version-hint`}
                  className="w-full font-mono"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value={ANY_VERSION_ITEM}>Any version</SelectItem>
                  <SelectSeparator />
                  {versionOptions.map((version) => (
                    <SelectItem
                      key={version}
                      value={version}
                      className="font-mono"
                    >
                      {version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p
                id={`${ids}-version-hint`}
                className="text-xs text-muted-foreground"
              >
                Which versions this template accepts. It only routes messages;
                your field mappings stay as they are.
              </p>
            </div>
          </>
        )}

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label
              htmlFor={`${ids}-payload`}
              className={SECTION_LABEL_CLASS_NAME}
            >
              Sample payload
              <span aria-hidden className="text-destructive">
                *
              </span>
            </Label>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLoadExample}
                disabled={!example}
                className="h-7 px-2.5 text-xs"
              >
                <WandSparkles aria-hidden className="size-3.5" />
                Load example
              </Button>
              {isHl7 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPayload(formatHl7Payload(payload))}
                  disabled={payload.trim() === ''}
                  className="h-7 px-2.5 text-xs"
                >
                  <TextQuote aria-hidden className="size-3.5" />
                  Format
                </Button>
              )}
            </div>
          </div>
          <CodeEditor
            id={`${ids}-payload`}
            value={payload}
            onChange={setPayload}
            language={isHl7 ? 'hl7' : 'plain'}
            placeholder={
              isHl7
                ? 'Paste the full message, starting with its MSH segment'
                : 'Paste the full message'
            }
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
            {payloadError ??
              (segmentCount > 0
                ? `${segmentCount} ${segmentCount === 1 ? 'segment' : 'segments'} · one per line. Format tidies line endings and blank lines.`
                : 'One segment per line.')}
          </p>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
          <Checkbox
            checked={saveWithTemplate}
            onCheckedChange={(checked) => setSaveWithTemplate(checked === true)}
            className="mt-0.5"
          />
          <span className="text-sm text-foreground">
            This is synthetic test data (no PHI).{' '}
            <span className="text-muted-foreground">
              Save it with the template so the preview works on reopen without a
              re-paste.
            </span>
          </span>
        </label>
      </div>
    </FormDialog>
  );
}
