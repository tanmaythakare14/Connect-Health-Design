import { useCallback, useEffect, useState, type JSX } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleCheck, LoaderCircle, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { CopyField, PasswordInput, ReadOnlyInput } from '@/components/common';
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
import { cn } from '@/lib/utils';
import { logger } from '@/utils/logger';
import type {
  ClientIdCheckState,
  EmbedSetupFormProps,
  SetupSavingMode,
  SetupStep,
  WorkflowOptionsState,
} from '../../../../@types';
import {
  CONNECTION_TYPE_SETUP_LABELS,
  EPIC_EMBED_GUIDE_STEPS,
  EPIC_FHIR_DOCS_URL,
  EPIC_FHIR_URL,
} from '../../../../constants';
import {
  apiDtoToWorkflowOption,
  checkEmbedClientId,
  embedFormToPayload,
  listWorkflowOptions,
  saveEmbedConfig,
} from '../../../../service';
import { isHttpsUrl } from '../../../../utils';
import {
  SetupChoice,
  SetupGuide,
  SetupActionBar,
  SetupSection,
} from '../../shared';
import { embedSetupSchema, type EmbedSetupFormValues } from './schema';
import { WorkflowCombobox } from './WorkflowCombobox';

const SECTION_IDS = {
  details: 'embed-details',
  epicApp: 'embed-epic-app',
  credentials: 'embed-credentials',
  urls: 'embed-urls',
  linkedSystem: 'embed-linked-system',
  appUrl: 'embed-app-url',
} as const;

const scrollToSection = (sectionId: string): void => {
  document
    .getElementById(sectionId)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export function EmbedSetupForm({
  config,
  connectionType,
}: EmbedSetupFormProps): JSX.Element {
  const form = useForm<EmbedSetupFormValues>({
    resolver: zodResolver(embedSetupSchema),
    defaultValues: {
      name: config.name,
      appStatus: config.appStatus,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      scopes: config.scopes,
      workflowId: config.workflowId,
      embeddedAppUrl: config.embeddedAppUrl,
    },
  });
  const values = useWatch({ control: form.control });
  const { isDirty } = form.formState;

  const [savingMode, setSavingMode] = useState<SetupSavingMode>(null);
  const [copiedUrls, setCopiedUrls] = useState({
    launch: false,
    callback: false,
  });
  const [clientIdCheck, setClientIdCheck] = useState<ClientIdCheckState>({
    status: 'idle',
  });
  const [workflowOptions, setWorkflowOptions] = useState<WorkflowOptionsState>({
    status: 'loading',
  });

  const hasApp = values.appStatus === 'yes';
  // Steps 3–6 show for either answer, so "Not yet" users can prepare.
  const hasAnsweredAppQuestion = values.appStatus != null;
  const isSaving = savingMode !== null;
  const isClientIdTaken = clientIdCheck.status === 'taken';

  const loadWorkflowOptions = useCallback(async (): Promise<void> => {
    setWorkflowOptions({ status: 'loading' });
    try {
      const dtos = await listWorkflowOptions();
      setWorkflowOptions({
        status: 'success',
        data: dtos.map(apiDtoToWorkflowOption),
      });
    } catch (error) {
      logger.error('Loading workflow options failed', { error });
      setWorkflowOptions({ status: 'error' });
    }
  }, []);

  useEffect(() => {
    void loadWorkflowOptions();
  }, [loadWorkflowOptions]);

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
      id: SECTION_IDS.epicApp,
      step: 2,
      title: 'Epic app',
      isComplete: hasApp,
      isLocked: false,
    },
    {
      id: SECTION_IDS.credentials,
      step: 3,
      title: 'Epic app credentials',
      isComplete:
        hasAnsweredAppQuestion &&
        Boolean(values.clientId?.trim()) &&
        !isClientIdTaken,
      isLocked: !hasAnsweredAppQuestion,
    },
    {
      id: SECTION_IDS.urls,
      step: 4,
      title: 'Register ConnectHealth URLs',
      isComplete:
        hasAnsweredAppQuestion && copiedUrls.launch && copiedUrls.callback,
      isLocked: !hasAnsweredAppQuestion,
    },
    {
      id: SECTION_IDS.linkedSystem,
      step: 5,
      title: 'Linked system and workflow',
      isComplete: hasAnsweredAppQuestion && Boolean(values.workflowId),
      isLocked: !hasAnsweredAppQuestion,
    },
    {
      id: SECTION_IDS.appUrl,
      step: 6,
      title: 'Embedded application URL',
      isComplete:
        hasAnsweredAppQuestion && isHttpsUrl(values.embeddedAppUrl ?? ''),
      isLocked: !hasAnsweredAppQuestion,
    },
  ];
  const [
    detailsStep,
    epicAppStep,
    credentialsStep,
    urlsStep,
    linkedStep,
    appUrlStep,
  ] = steps;
  // URL copying and the workflow are nudges / optional — not required.
  const missingSteps = [
    detailsStep,
    epicAppStep,
    credentialsStep,
    appUrlStep,
  ].filter((step) => !step.isComplete);
  const canContinue = missingSteps.length === 0;

  const runClientIdCheck = async (clientId: string): Promise<void> => {
    const trimmed = clientId.trim();
    if (!trimmed) {
      setClientIdCheck({ status: 'idle' });
      return;
    }
    setClientIdCheck({ status: 'checking' });
    try {
      const result = await checkEmbedClientId(config.connectionId, trimmed);
      if (result.isAvailable) {
        setClientIdCheck({ status: 'available' });
        form.clearErrors('clientId');
      } else {
        const usedBy = result.usedBy ?? 'another embedded connection';
        setClientIdCheck({ status: 'taken', usedBy });
        form.setError('clientId', {
          message: `Already used by “${usedBy}”. Each embedded connection needs its own Client ID.`,
        });
      }
    } catch (error) {
      logger.warn('Checking Client ID availability failed', { error });
      setClientIdCheck({ status: 'error' });
    }
  };

  const save = async (
    formValues: EmbedSetupFormValues,
    isDraft: boolean,
  ): Promise<void> => {
    setSavingMode(isDraft ? 'draft' : 'continue');
    try {
      await saveEmbedConfig(
        config.connectionId,
        embedFormToPayload(formValues, isDraft),
      );
      form.reset(formValues);
      if (isDraft) {
        toast.success('Draft saved', {
          description: 'Pick up where you left off any time.',
        });
      } else {
        toast.success('Connection set up', {
          description: `“${formValues.name.trim()}” is configured. Launch it from Epic to link the organization.`,
        });
      }
    } catch (error) {
      logger.error('Saving embed setup failed', {
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
    setClientIdCheck({ status: 'idle' });
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
                <Label htmlFor="embed-ehr-system">EHR system</Label>
                <ReadOnlyInput id="embed-ehr-system" value={config.ehrSystem} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="embed-connection-type">Connection type</Label>
                <ReadOnlyInput
                  id="embed-connection-type"
                  value={CONNECTION_TYPE_SETUP_LABELS[connectionType]}
                />
              </div>
            </div>
          </SetupSection>

          {/* 2 — Epic app */}
          <SetupSection
            id={SECTION_IDS.epicApp}
            step={2}
            title="Epic app"
            description="Have you already created an app on Epic on FHIR for this embedded connection?"
            isComplete={epicAppStep.isComplete}
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="appStatus"
                render={({ field }) => (
                  <SetupChoice
                    value={field.value}
                    onChange={field.onChange}
                    ariaLabel="Have you already created an app on Epic on FHIR for this embedded connection?"
                    yesDescription="Enter the app’s credentials and URLs."
                    notYetDescription="We’ll walk you through creating one."
                    disabled={isSaving}
                  />
                )}
              />
              {values.appStatus === 'not_yet' && (
                <SetupGuide
                  title="Create an app on Epic on FHIR"
                  steps={EPIC_EMBED_GUIDE_STEPS}
                  primaryLink={{
                    label: 'Open Epic on FHIR',
                    href: EPIC_FHIR_URL,
                  }}
                  docsHref={EPIC_FHIR_DOCS_URL}
                />
              )}
            </div>
          </SetupSection>

          {hasAnsweredAppQuestion && (
            <>
              {/* 3 — Credentials */}
              <SetupSection
                id={SECTION_IDS.credentials}
                step={3}
                title="Epic app credentials"
                description="ConnectHealth checks that no other embedded connection already uses this Client ID."
                isComplete={credentialsStep.isComplete}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client ID</FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="off"
                            className="font-mono text-xs md:text-xs"
                            {...field}
                            onChange={(event) => {
                              field.onChange(event);
                              setClientIdCheck({ status: 'idle' });
                            }}
                            onBlur={() => {
                              field.onBlur();
                              void runClientIdCheck(field.value);
                            }}
                            disabled={isSaving}
                          />
                        </FormControl>
                        {clientIdCheck.status === 'checking' && (
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <LoaderCircle
                              className="size-3.5 animate-spin"
                              aria-hidden
                            />
                            Checking availability…
                          </p>
                        )}
                        {clientIdCheck.status === 'available' && (
                          <p className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
                            <CircleCheck className="size-3.5" aria-hidden />
                            Available — no other embedded connection uses it.
                          </p>
                        )}
                        {clientIdCheck.status === 'error' && (
                          <p className="text-xs text-muted-foreground">
                            Couldn’t check availability right now. It’ll be
                            checked again when you save.
                          </p>
                        )}
                        <FormDescription className="text-xs">
                          Epic issues two: Non-Production for the sandbox and
                          Production for live organizations.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clientSecret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Client secret
                          <span className="font-normal text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            autoComplete="new-password"
                            {...field}
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Only for confidential clients. Leave blank for public
                          clients.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </SetupSection>

              {/* 4 — ConnectHealth URLs */}
              <SetupSection
                id={SECTION_IDS.urls}
                step={4}
                title="Register ConnectHealth URLs"
                description="Add these URLs to the Epic app, then choose the scopes to request."
                isComplete={urlsStep.isComplete}
              >
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="embed-launch-url">EHR launch URL</Label>
                      <CopyField
                        id="embed-launch-url"
                        value={config.launchUrl}
                        label="EHR launch URL"
                        onCopied={() =>
                          setCopiedUrls((current) => ({
                            ...current,
                            launch: true,
                          }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Add this as the “Launch URL” of the Epic app. Epic opens
                        it to start an embedded launch.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="embed-callback-url">
                        OAuth callback URL
                      </Label>
                      <CopyField
                        id="embed-callback-url"
                        value={config.callbackUrl}
                        label="OAuth callback URL"
                        onCopied={() =>
                          setCopiedUrls((current) => ({
                            ...current,
                            callback: true,
                          }))
                        }
                      />
                      <p className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                        <TriangleAlert
                          className="mt-px size-3.5 shrink-0"
                          aria-hidden
                        />
                        Add this exact URL to the “Redirect URIs” of the Epic
                        app. Epic returns users here after sign-in.
                      </p>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="scopes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          OAuth scopes
                          <span className="font-normal text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="off"
                            placeholder="launch openid fhirUser patient/Patient.read"
                            className="font-mono text-xs md:text-xs"
                            {...field}
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Requested at launch. ConnectHealth adds the{' '}
                          <code className="font-mono">launch</code> scope if
                          it’s missing.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </SetupSection>

              {/* 5 — Linked system & workflow */}
              <SetupSection
                id={SECTION_IDS.linkedSystem}
                step={5}
                title="Linked system and workflow"
                isComplete={linkedStep.isComplete}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="embed-linked-system-value">
                      Linked system
                    </Label>
                    <ReadOnlyInput
                      id="embed-linked-system-value"
                      value={
                        config.linkedSystem ??
                        'Not yet configured — set on the first EHR launch'
                      }
                      className={cn(
                        config.linkedSystem
                          ? 'font-mono text-xs md:text-xs'
                          : 'italic',
                      )}
                    />
                    <p className="text-xs text-muted-foreground">
                      Set automatically on the first launch from Epic. Each
                      connection is bound to the FHIR base URL of one Epic
                      organization.
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="workflowId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Workflow
                          <span className="font-normal text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <WorkflowCombobox
                            optionsState={workflowOptions}
                            value={field.value}
                            onChange={field.onChange}
                            onRetry={() => void loadWorkflowOptions()}
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          The workflow the embedded application can run with
                          this connection.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </SetupSection>

              {/* 6 — Embedded application URL */}
              <SetupSection
                id={SECTION_IDS.appUrl}
                step={6}
                title="Embedded application URL"
                isComplete={appUrlStep.isComplete}
              >
                <FormField
                  control={form.control}
                  name="embeddedAppUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Embedded application URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          autoComplete="off"
                          placeholder="https://yourembeddedapp.example.com"
                          className="font-mono text-xs md:text-xs"
                          {...field}
                          disabled={isSaving}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Where the embedded application is hosted. ConnectHealth
                        opens it inside Epic after the launch completes.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </SetupSection>
            </>
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
