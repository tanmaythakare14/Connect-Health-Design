import { useState, type JSX } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle, TriangleAlert, WandSparkles } from 'lucide-react';
import { toast } from 'sonner';
import { CopyField, PasswordInput, ReadOnlyInput } from '@/components/common';
import { Button } from '@/components/ui/button';
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
  SetupSavingMode,
  SetupStep,
  StandaloneSetupFormProps,
} from '../../../../@types';
import {
  CONNECTION_TYPE_SETUP_LABELS,
  EPIC_FHIR_DOCS_URL,
  EPIC_FHIR_URL,
  EPIC_STANDALONE_GUIDE_STEPS,
} from '../../../../constants';
import {
  detectOAuthEndpoints,
  saveStandaloneConfig,
  standaloneFormToPayload,
} from '../../../../service';
import { isHttpsUrl } from '../../../../utils';
import {
  SetupChoice,
  SetupGuide,
  OAuthScopesField,
  SetupActionBar,
  SetupSection,
} from '../../shared';
import {
  standaloneSetupSchema,
  type StandaloneSetupFormValues,
} from './schema';

const SECTION_IDS = {
  details: 'setup-details',
  epicApp: 'setup-epic-app',
  callback: 'setup-callback',
  credentials: 'setup-credentials',
  endpoints: 'setup-endpoints',
} as const;

const scrollToSection = (sectionId: string): void => {
  document
    .getElementById(sectionId)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export function StandaloneSetupForm({
  config,
  connectionType,
}: StandaloneSetupFormProps): JSX.Element {
  const form = useForm<StandaloneSetupFormValues>({
    resolver: zodResolver(standaloneSetupSchema),
    defaultValues: {
      name: config.name,
      appStatus: config.appStatus,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      fhirBaseUrl: config.fhirBaseUrl,
      authorizationUrl: config.authorizationUrl,
      tokenUrl: config.tokenUrl,
      scopes: config.scopes,
    },
  });
  const values = useWatch({ control: form.control });
  const [isCallbackCopied, setIsCallbackCopied] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [savingMode, setSavingMode] = useState<SetupSavingMode>(null);
  const { isDirty } = form.formState;

  const hasApp = values.appStatus === 'yes';
  // Steps 3–5 show for either answer: "Not yet" users can register the
  // callback URL and fill credentials while they create the Epic app.
  const hasAnsweredAppQuestion = values.appStatus != null;
  const isSaving = savingMode !== null;

  // Back to the last saved values (the form is reset to them on every save).
  const handleDiscard = (): void => {
    form.reset();
    toast.info('Changes discarded', {
      description: 'The form is back to the last saved version.',
    });
  };

  // Live completion drives the step badges, the progress card and Continue.
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
      id: SECTION_IDS.callback,
      step: 3,
      title: 'Register callback URL',
      isComplete: hasAnsweredAppQuestion && isCallbackCopied,
      isLocked: !hasAnsweredAppQuestion,
    },
    {
      id: SECTION_IDS.credentials,
      step: 4,
      title: 'App credentials',
      isComplete: hasAnsweredAppQuestion && Boolean(values.clientId?.trim()),
      isLocked: !hasAnsweredAppQuestion,
    },
    {
      id: SECTION_IDS.endpoints,
      step: 5,
      title: 'FHIR and OAuth settings',
      isComplete:
        hasAnsweredAppQuestion &&
        isHttpsUrl(values.fhirBaseUrl ?? '') &&
        isHttpsUrl(values.authorizationUrl ?? '') &&
        isHttpsUrl(values.tokenUrl ?? '') &&
        Boolean(values.scopes?.trim()),
      isLocked: !hasAnsweredAppQuestion,
    },
  ];
  const [detailsStep, epicAppStep, , credentialsStep, endpointsStep] = steps;
  // Copying the callback URL is a nudge, not a requirement we can verify.
  const missingSteps = [
    detailsStep,
    epicAppStep,
    credentialsStep,
    endpointsStep,
  ].filter((step) => !step.isComplete);
  const canContinue = missingSteps.length === 0 && !isSaving;

  const save = async (
    formValues: StandaloneSetupFormValues,
    isDraft: boolean,
  ): Promise<void> => {
    setSavingMode(isDraft ? 'draft' : 'continue');
    try {
      await saveStandaloneConfig(
        config.connectionId,
        standaloneFormToPayload(formValues, isDraft),
      );
      form.reset(formValues);
      if (isDraft) {
        toast.success('Draft saved', {
          description: 'Pick up where you left off any time.',
        });
      } else {
        toast.success('Connection set up', {
          description: `“${formValues.name.trim()}” is configured. Run a test to confirm it works.`,
        });
      }
    } catch (error) {
      logger.error('Saving standalone setup failed', {
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

  const handleDetectEndpoints = async (): Promise<void> => {
    const fhirBaseUrl = form.getValues('fhirBaseUrl');
    if (!isHttpsUrl(fhirBaseUrl)) {
      form.setError('fhirBaseUrl', {
        message: 'Enter a valid FHIR base URL starting with https://',
      });
      return;
    }
    setIsDetecting(true);
    try {
      const endpoints = await detectOAuthEndpoints(fhirBaseUrl);
      const options = { shouldDirty: true, shouldValidate: true };
      form.setValue('authorizationUrl', endpoints.authorizationUrl, options);
      form.setValue('tokenUrl', endpoints.tokenUrl, options);
      toast.success('OAuth endpoints detected', {
        description:
          'Authorization and token URLs were filled in from the FHIR base URL.',
      });
    } catch (error) {
      logger.warn('Detecting OAuth endpoints failed', { error });
      toast.error('Couldn’t detect the endpoints', {
        description: 'Check the FHIR base URL, or enter the URLs manually.',
      });
    } finally {
      setIsDetecting(false);
    }
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
                <Label htmlFor="setup-ehr-system">EHR system</Label>
                <ReadOnlyInput id="setup-ehr-system" value={config.ehrSystem} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="setup-connection-type">Connection type</Label>
                <ReadOnlyInput
                  id="setup-connection-type"
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
            description="Have you already created an app on Epic on FHIR for this connection?"
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
                    ariaLabel="Have you already created an app on Epic on FHIR for this connection?"
                    yesDescription="Enter the app’s credentials and endpoints."
                    notYetDescription="We’ll walk you through creating one."
                    disabled={isSaving}
                  />
                )}
              />
              {values.appStatus === 'not_yet' && (
                <SetupGuide
                  title="Create an app on Epic on FHIR"
                  steps={EPIC_STANDALONE_GUIDE_STEPS}
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
              {/* 3 — Callback URL */}
              <SetupSection
                id={SECTION_IDS.callback}
                step={3}
                title="Register OAuth callback URL"
                description="Add this URL to the Epic app before continuing."
                isComplete={steps[2].isComplete}
              >
                <div className="space-y-2">
                  <Label htmlFor="setup-callback-url">OAuth callback URL</Label>
                  <CopyField
                    id="setup-callback-url"
                    value={config.callbackUrl}
                    label="OAuth callback URL"
                    onCopied={() => setIsCallbackCopied(true)}
                  />
                  <p className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                    <TriangleAlert
                      className="mt-px size-3.5 shrink-0"
                      aria-hidden
                    />
                    Add this exact URL to the “Redirect URIs” of the Epic app.
                    Epic returns users to ConnectHealth at this URL after
                    sign-in.
                  </p>
                </div>
              </SetupSection>

              {/* 4 — Credentials */}
              <SetupSection
                id={SECTION_IDS.credentials}
                step={4}
                title="Epic app credentials"
                description="Copy these values from the app on Epic on FHIR."
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
                            disabled={isSaving}
                          />
                        </FormControl>
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

              {/* 5 — Endpoints */}
              <SetupSection
                id={SECTION_IDS.endpoints}
                step={5}
                title="FHIR and OAuth settings"
                description="Enter the FHIR base URL — ConnectHealth can detect the OAuth endpoints from it."
                isComplete={endpointsStep.isComplete}
              >
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="fhirBaseUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>FHIR base URL</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              type="url"
                              autoComplete="off"
                              className="min-w-0 flex-1 font-mono text-xs md:text-xs"
                              {...field}
                              disabled={isSaving}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => void handleDetectEndpoints()}
                            disabled={isDetecting || isSaving}
                            className="shrink-0 border-primary text-primary hover:bg-accent hover:text-primary"
                          >
                            {isDetecting ? (
                              <LoaderCircle
                                className="animate-spin"
                                aria-hidden
                              />
                            ) : (
                              <WandSparkles aria-hidden />
                            )}
                            {isDetecting ? 'Detecting…' : 'Auto-detect'}
                          </Button>
                        </div>
                        <FormDescription className="text-xs">
                          The FHIR R4 base URL of the Epic organization.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="authorizationUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Authorization URL</FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              autoComplete="off"
                              className="font-mono text-xs md:text-xs"
                              {...field}
                              disabled={isSaving}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Epic’s OAuth 2.0 authorization endpoint.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tokenUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token URL</FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              autoComplete="off"
                              className="font-mono text-xs md:text-xs"
                              {...field}
                              disabled={isSaving}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Epic’s OAuth 2.0 token endpoint.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="scopes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OAuth scopes</FormLabel>
                        <FormControl>
                          <OAuthScopesField
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
