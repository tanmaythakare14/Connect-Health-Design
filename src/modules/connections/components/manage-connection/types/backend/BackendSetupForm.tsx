import { useState, type JSX } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { CopyField, CopyTextBlock, ReadOnlyInput } from '@/components/common';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { logger } from '@/utils/logger';
import type {
  BackendSetupFormProps,
  SetupSavingMode,
  SetupStep,
} from '../../../../@types';
import {
  CONNECTION_TYPE_SETUP_LABELS,
  ORACLE_HEALTH_BACKEND_DOCS_URL,
  ORACLE_HEALTH_CODE_CONSOLE_URL,
  ORACLE_HEALTH_GUIDE_STEPS,
} from '../../../../constants';
import { backendFormToPayload, saveBackendConfig } from '../../../../service';
import {
  SetupActionBar,
  SetupChoice,
  SetupGuide,
  SetupSection,
} from '../../shared';
import { AdvancedKeySettings } from './AdvancedKeySettings';
import { backendSetupSchema, type BackendSetupFormValues } from './schema';

const SECTION_IDS = {
  details: 'backend-details',
  app: 'backend-app',
  keys: 'backend-keys',
} as const;

const scrollToSection = (sectionId: string): void => {
  document
    .getElementById(sectionId)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export function BackendSetupForm({
  config,
  connectionType,
}: BackendSetupFormProps): JSX.Element {
  const form = useForm<BackendSetupFormValues>({
    resolver: zodResolver(backendSetupSchema),
    defaultValues: {
      name: config.name,
      appStatus: config.appStatus,
    },
  });
  const values = useWatch({ control: form.control });
  const { isDirty } = form.formState;
  const [savingMode, setSavingMode] = useState<SetupSavingMode>(null);
  const [hasCopiedKey, setHasCopiedKey] = useState(false);
  // Generating keys is saved server-side straight away, so the current pair
  // lives outside the form and isn't touched by Discard.
  const [signingKeys, setSigningKeys] = useState(config.signingKeys);

  const hasApp = values.appStatus === 'yes';
  // Section 3 shows for either answer: "Not yet" users need the JWKS URL
  // while they register the system app.
  const hasAnsweredAppQuestion = values.appStatus != null;
  const isSaving = savingMode !== null;
  const markKeyCopied = (): void => setHasCopiedKey(true);

  // Live completion drives the step badges and Continue.
  const steps: SetupStep[] = [
    {
      id: SECTION_IDS.details,
      step: 1,
      title: 'Connection details',
      isComplete: Boolean(values.name?.trim()),
      isLocked: false,
    },
    {
      id: SECTION_IDS.app,
      step: 2,
      title: 'Oracle Health app',
      isComplete: hasApp,
      isLocked: false,
    },
    {
      id: SECTION_IDS.keys,
      step: 3,
      title: 'Register ConnectHealth keys',
      isComplete: hasAnsweredAppQuestion && hasCopiedKey,
      isLocked: !hasAnsweredAppQuestion,
    },
  ];
  const [detailsStep, appStep, keysStep] = steps;
  // Registering the keys happens in Oracle Health, so copying them is a
  // nudge — it can't be verified here and doesn't block Continue.
  const missingSteps = [detailsStep, appStep].filter(
    (step) => !step.isComplete,
  );
  const canContinue = missingSteps.length === 0;

  const save = async (
    formValues: BackendSetupFormValues,
    isDraft: boolean,
  ): Promise<void> => {
    setSavingMode(isDraft ? 'draft' : 'continue');
    try {
      await saveBackendConfig(
        config.connectionId,
        backendFormToPayload(formValues, isDraft),
      );
      form.reset(formValues);
      if (isDraft) {
        toast.success('Draft saved', {
          description: 'Pick up where you left off any time.',
        });
      } else {
        toast.success('Connection set up', {
          description: `“${formValues.name.trim()}” is configured. Run a test to confirm Oracle Health accepts its keys.`,
        });
      }
    } catch (error) {
      logger.error('Saving backend setup failed', {
        connectionId: config.connectionId,
        error,
      });
      toast.error('Couldn’t save your changes', {
        description: 'Please try again.',
      });
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

  const handleContinue = form.handleSubmit(
    (formValues) => save(formValues, false),
    () => scrollToSection(SECTION_IDS.details),
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
        onSubmit={(event) => void handleContinue(event)}
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
                <Label htmlFor="backend-ehr-system">EHR system</Label>
                <ReadOnlyInput
                  id="backend-ehr-system"
                  value={config.ehrSystem}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="backend-connection-type">Connection type</Label>
                <ReadOnlyInput
                  id="backend-connection-type"
                  value={CONNECTION_TYPE_SETUP_LABELS[connectionType]}
                />
              </div>
            </div>
          </SetupSection>

          {/* 2 — Oracle Health system app */}
          <SetupSection
            id={SECTION_IDS.app}
            step={2}
            title="Oracle Health app"
            description="Have you already created a System app in Oracle Health code Console?"
            isComplete={appStep.isComplete}
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="appStatus"
                render={({ field }) => (
                  <SetupChoice
                    value={field.value}
                    onChange={field.onChange}
                    ariaLabel="Have you already created a System app in Oracle Health code Console?"
                    yesDescription="Register ConnectHealth’s keys with it below."
                    notYetDescription="We’ll walk you through registering one."
                    disabled={isSaving}
                  />
                )}
              />
              {values.appStatus === 'not_yet' && (
                <SetupGuide
                  title="Register a System app with Oracle Health"
                  steps={ORACLE_HEALTH_GUIDE_STEPS}
                  primaryLink={{
                    label: 'Open Oracle Health code Console',
                    href: ORACLE_HEALTH_CODE_CONSOLE_URL,
                  }}
                  docsHref={ORACLE_HEALTH_BACKEND_DOCS_URL}
                />
              )}
            </div>
          </SetupSection>

          {hasAnsweredAppQuestion && (
            /* 3 — ConnectHealth keys */
            <SetupSection
              id={SECTION_IDS.keys}
              step={3}
              title="Register ConnectHealth keys"
              description="Oracle Health uses these keys to verify token requests signed by ConnectHealth."
              isComplete={keysStep.isComplete}
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="backend-jwks-url">JWKS URL</Label>
                  <CopyField
                    id="backend-jwks-url"
                    value={config.jwksUrl}
                    label="JWKS URL"
                    onCopied={markKeyCopied}
                  />
                  <p className="text-xs text-muted-foreground">
                    Register this URL for the system account in Cerner Central,
                    under “System Account Management” — not in code Console.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backend-public-key-certificate">
                    Public key certificate (X.509)
                  </Label>
                  <CopyTextBlock
                    id="backend-public-key-certificate"
                    value={signingKeys.publicKeyCertificate}
                    label="Public key certificate"
                    onCopied={markKeyCopied}
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload this certificate to the Oracle Health app only when
                    you’re not using the JWKS URL.
                  </p>
                </div>

                <AdvancedKeySettings
                  connectionId={config.connectionId}
                  signingKeys={signingKeys}
                  onKeysGenerated={setSigningKeys}
                  disabled={isSaving}
                />
              </div>
            </SetupSection>
          )}
        </div>

        <SetupActionBar
          missingStepTitles={missingSteps.map((step) => step.title)}
          isDirty={isDirty}
          savingMode={savingMode}
          canContinue={canContinue}
          onSaveDraft={handleSaveDraft}
          onDiscard={handleDiscard}
        />
      </form>
    </Form>
  );
}
