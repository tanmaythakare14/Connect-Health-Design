import { useState, type JSX } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { PasswordInput, ReadOnlyInput } from '@/components/common';
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
import { Label } from '@/components/ui/label';
import { logger } from '@/utils/logger';
import type {
  OpendentalSetupFormProps,
  SetupSavingMode,
  SetupStep,
} from '../../../../@types';
import {
  CONNECTION_STATUS,
  CONNECTION_TYPE_SETUP_LABELS,
  OPENDENTAL_API_DOCS_URL,
  OPENDENTAL_API_URL,
  OPENDENTAL_GUIDE_STEPS,
} from '../../../../constants';
import {
  opendentalFormToPayload,
  saveOpendentalConfig,
} from '../../../../service';
import {
  NotLiveYetNote,
  SetupActionBar,
  SetupChoice,
  SetupGuide,
  SetupSection,
} from '../../shared';
import {
  opendentalSetupSchema,
  type OpendentalSetupFormValues,
} from './schema';

const SECTION_IDS = {
  details: 'opendental-details',
  keys: 'opendental-keys',
  settings: 'opendental-settings',
} as const;

const PUBLISH_LABEL = 'Publish connection';

const scrollToSection = (sectionId: string): void => {
  document
    .getElementById(sectionId)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export function OpendentalSetupForm({
  config,
  connectionType,
  connectionStatus,
}: OpendentalSetupFormProps): JSX.Element {
  const form = useForm<OpendentalSetupFormValues>({
    resolver: zodResolver(opendentalSetupSchema),
    defaultValues: {
      name: config.name,
      keysStatus: config.keysStatus,
      developerKey: config.developerKey,
      customerKey: config.customerKey,
    },
  });
  const values = useWatch({ control: form.control });
  const { isDirty } = form.formState;
  const [savingMode, setSavingMode] = useState<SetupSavingMode>(null);
  // Flips once published, so the "isn't live yet" note goes away.
  const [isLive, setIsLive] = useState(
    connectionStatus !== CONNECTION_STATUS.DRAFT,
  );

  const hasKeys = values.keysStatus === 'yes';
  // Section 3 shows for either answer, so "Not yet" users can prepare.
  const hasAnsweredKeysQuestion = values.keysStatus != null;
  const isSaving = savingMode !== null;

  // Live completion drives the step badges and Publish.
  const steps: SetupStep[] = [
    {
      id: SECTION_IDS.details,
      step: 1,
      title: 'Connection details',
      isComplete: Boolean(values.name?.trim()),
      isLocked: false,
    },
    {
      id: SECTION_IDS.keys,
      step: 2,
      title: 'Open Dental keys',
      isComplete: hasKeys,
      isLocked: false,
    },
    {
      id: SECTION_IDS.settings,
      step: 3,
      title: 'Open Dental API settings',
      isComplete:
        hasAnsweredKeysQuestion &&
        Boolean(values.developerKey?.trim()) &&
        Boolean(values.customerKey?.trim()),
      isLocked: !hasAnsweredKeysQuestion,
    },
  ];
  const [detailsStep, keysStep, settingsStep] = steps;
  const missingSteps = steps.filter((step) => !step.isComplete);
  const canPublish = missingSteps.length === 0;

  const save = async (
    formValues: OpendentalSetupFormValues,
    isDraft: boolean,
  ): Promise<void> => {
    setSavingMode(isDraft ? 'draft' : 'continue');
    try {
      await saveOpendentalConfig(
        config.connectionId,
        opendentalFormToPayload(formValues, isDraft),
      );
      form.reset(formValues);
      if (isDraft) {
        toast.success('Draft saved', {
          description: 'Pick up where you left off any time.',
        });
      } else {
        setIsLive(true);
        toast.success('Connection published', {
          description: `“${formValues.name.trim()}” is live and can exchange data with the Open Dental office.`,
        });
      }
    } catch (error) {
      logger.error('Saving Open Dental setup failed', {
        connectionId: config.connectionId,
        error,
      });
      toast.error(
        isDraft
          ? 'Couldn’t save your changes'
          : 'Couldn’t publish the connection',
        { description: 'Please try again.' },
      );
    } finally {
      setSavingMode(null);
    }
  };

  const handleSaveDraft = (): void => {
    const formValues = form.getValues();
    if (!formValues.name.trim()) {
      form.setError('name', { message: 'Connection name is required' });
      scrollToSection(SECTION_IDS.details);
      return;
    }
    void save(formValues, true);
  };

  const handlePublish = form.handleSubmit(
    (formValues) => save(formValues, false),
    () => {
      const firstOpen = steps.find(
        (step) => !step.isComplete && !step.isLocked,
      );
      if (firstOpen) {
        scrollToSection(firstOpen.id);
      }
    },
  );

  // Back to the last saved values (the form is reset to them on every save).
  const handleDiscard = (): void => {
    form.reset();
    toast.info('Changes discarded', {
      description: 'The form is back to the last saved version.',
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(event) => void handlePublish(event)}
        noValidate
        className="flex flex-1 flex-col gap-6"
      >
        <div className="space-y-4">
          {/* 1 — Connection details */}
          <SetupSection
            id={SECTION_IDS.details}
            step={1}
            title="Connection details"
            isComplete={detailsStep.isComplete}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Connection name</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="off"
                        {...field}
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-2">
                <Label htmlFor="opendental-ehr-system">EHR system</Label>
                <ReadOnlyInput
                  id="opendental-ehr-system"
                  value={config.ehrSystem}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="opendental-connection-type">
                  Connection type
                </Label>
                <ReadOnlyInput
                  id="opendental-connection-type"
                  value={CONNECTION_TYPE_SETUP_LABELS[connectionType]}
                />
              </div>
            </div>
          </SetupSection>

          {/* 2 — Keys */}
          <SetupSection
            id={SECTION_IDS.keys}
            step={2}
            title="Open Dental keys"
            description="Do you already have a Developer Key and the Customer Key of the Open Dental office?"
            isComplete={keysStep.isComplete}
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="keysStatus"
                render={({ field }) => (
                  <SetupChoice
                    value={field.value}
                    onChange={field.onChange}
                    ariaLabel="Do you already have a Developer Key and the Customer Key of the Open Dental office?"
                    yesDescription="Enter both keys below."
                    notYetDescription="We’ll walk you through getting them."
                    disabled={isSaving}
                  />
                )}
              />
              {values.keysStatus === 'not_yet' && (
                <SetupGuide
                  title="Get Open Dental API keys"
                  steps={OPENDENTAL_GUIDE_STEPS}
                  primaryLink={{
                    label: 'Open Open Dental API',
                    href: OPENDENTAL_API_URL,
                  }}
                  docsHref={OPENDENTAL_API_DOCS_URL}
                />
              )}
            </div>
          </SetupSection>

          {hasAnsweredKeysQuestion && (
            /* 3 — API settings */
            <SetupSection
              id={SECTION_IDS.settings}
              step={3}
              title="Open Dental API settings"
              isComplete={settingsStep.isComplete}
            >
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="developerKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Developer key</FormLabel>
                        <FormControl>
                          <PasswordInput
                            autoComplete="new-password"
                            {...field}
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Shown in the Open Dental Developer Portal.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer key</FormLabel>
                        <FormControl>
                          <PasswordInput
                            autoComplete="new-password"
                            {...field}
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Generated for the Open Dental office in the Developer
                          Portal.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid content-start gap-2">
                    <Label htmlFor="opendental-api-base-url">
                      API base URL
                    </Label>
                    <ReadOnlyInput
                      id="opendental-api-base-url"
                      value={config.apiBaseUrl}
                      className="font-mono text-xs md:text-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      The Open Dental Remote API endpoint. It’s the same for
                      every Open Dental connection and can’t be changed.
                    </p>
                  </div>
                </div>

                {!isLive && <NotLiveYetNote publishLabel={PUBLISH_LABEL} />}
              </div>
            </SetupSection>
          )}
        </div>

        <SetupActionBar
          missingStepTitles={missingSteps.map((step) => step.title)}
          isDirty={isDirty}
          savingMode={savingMode}
          canContinue={canPublish}
          onSaveDraft={handleSaveDraft}
          onDiscard={handleDiscard}
          continueLabel={PUBLISH_LABEL}
        />
      </form>
    </Form>
  );
}
