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
  SetupSavingMode,
  SetupStep,
  UnitySetupFormProps,
} from '../../../../@types';
import {
  CONNECTION_STATUS,
  CONNECTION_TYPE_SETUP_LABELS,
  UNITY_GUIDE_NOTE,
  UNITY_GUIDE_STEPS,
  VERADIGM_DEVELOPER_PORTAL_URL,
  VERADIGM_UNITY_DOCS_URL,
} from '../../../../constants';
import { saveUnityConfig, unityFormToPayload } from '../../../../service';
import { isHttpsUrl } from '../../../../utils';
import {
  NotLiveYetNote,
  SetupActionBar,
  SetupChoice,
  SetupGuide,
  SetupSection,
} from '../../shared';
import { unitySetupSchema, type UnitySetupFormValues } from './schema';

const SECTION_IDS = {
  details: 'unity-details',
  credentials: 'unity-credentials',
  settings: 'unity-settings',
} as const;

const PUBLISH_LABEL = 'Publish connection';

const scrollToSection = (sectionId: string): void => {
  document
    .getElementById(sectionId)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export function UnitySetupForm({
  config,
  connectionType,
  connectionStatus,
}: UnitySetupFormProps): JSX.Element {
  const form = useForm<UnitySetupFormValues>({
    resolver: zodResolver(unitySetupSchema),
    defaultValues: {
      name: config.name,
      credentialsStatus: config.credentialsStatus,
      endpointUrl: config.endpointUrl,
      appName: config.appName,
      serviceUsername: config.serviceUsername,
      servicePassword: config.servicePassword,
      ehrUsername: config.ehrUsername,
      ehrPassword: config.ehrPassword,
      ubiquityId: config.ubiquityId,
    },
  });
  const values = useWatch({ control: form.control });
  const { isDirty } = form.formState;
  const [savingMode, setSavingMode] = useState<SetupSavingMode>(null);
  // Flips once published, so the "isn't live yet" note goes away.
  const [isLive, setIsLive] = useState(
    connectionStatus !== CONNECTION_STATUS.DRAFT,
  );

  const hasCredentials = values.credentialsStatus === 'yes';
  // Section 3 shows for either answer, so "Not yet" users can prepare.
  const hasAnsweredCredentialsQuestion = values.credentialsStatus != null;
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
      id: SECTION_IDS.credentials,
      step: 2,
      title: 'Unity credentials',
      isComplete: hasCredentials,
      isLocked: false,
    },
    {
      id: SECTION_IDS.settings,
      step: 3,
      title: 'Unity API settings',
      isComplete:
        hasAnsweredCredentialsQuestion &&
        isHttpsUrl(values.endpointUrl ?? '') &&
        [
          values.appName,
          values.serviceUsername,
          values.servicePassword,
          values.ehrUsername,
          values.ehrPassword,
        ].every((value) => Boolean(value?.trim())),
      isLocked: !hasAnsweredCredentialsQuestion,
    },
  ];
  const [detailsStep, credentialsStep, settingsStep] = steps;
  const missingSteps = steps.filter((step) => !step.isComplete);
  const canPublish = missingSteps.length === 0;

  const save = async (
    formValues: UnitySetupFormValues,
    isDraft: boolean,
  ): Promise<void> => {
    setSavingMode(isDraft ? 'draft' : 'continue');
    try {
      await saveUnityConfig(
        config.connectionId,
        unityFormToPayload(formValues, isDraft),
      );
      form.reset(formValues);
      if (isDraft) {
        toast.success('Draft saved', {
          description: 'Pick up where you left off any time.',
        });
      } else {
        setIsLive(true);
        toast.success('Connection published', {
          description: `“${formValues.name.trim()}” is live and can call the Unity API.`,
        });
      }
    } catch (error) {
      logger.error('Saving Unity setup failed', {
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
                <Label htmlFor="unity-ehr-system">EHR system</Label>
                <ReadOnlyInput id="unity-ehr-system" value={config.ehrSystem} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unity-connection-type">Connection type</Label>
                <ReadOnlyInput
                  id="unity-connection-type"
                  value={CONNECTION_TYPE_SETUP_LABELS[connectionType]}
                />
              </div>
            </div>
          </SetupSection>

          {/* 2 — Credentials question */}
          <SetupSection
            id={SECTION_IDS.credentials}
            step={2}
            title="Unity credentials"
            description="Do you already have Unity API credentials from Veradigm?"
            isComplete={credentialsStep.isComplete}
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="credentialsStatus"
                render={({ field }) => (
                  <SetupChoice
                    value={field.value}
                    onChange={field.onChange}
                    ariaLabel="Do you already have Unity API credentials from Veradigm?"
                    yesDescription="Enter the Unity endpoint and credentials below."
                    notYetDescription="We’ll walk you through getting access."
                    disabled={isSaving}
                  />
                )}
              />
              {values.credentialsStatus === 'not_yet' && (
                <SetupGuide
                  title="Get Unity API access from Veradigm"
                  steps={UNITY_GUIDE_STEPS}
                  note={UNITY_GUIDE_NOTE}
                  primaryLink={{
                    label: 'Open Veradigm Developer Portal',
                    href: VERADIGM_DEVELOPER_PORTAL_URL,
                  }}
                  docsHref={VERADIGM_UNITY_DOCS_URL}
                />
              )}
            </div>
          </SetupSection>

          {hasAnsweredCredentialsQuestion && (
            /* 3 — Unity API settings */
            <SetupSection
              id={SECTION_IDS.settings}
              step={3}
              title="Unity API settings"
              isComplete={settingsStep.isComplete}
            >
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="endpointUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unity endpoint URL</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            autoComplete="off"
                            placeholder="https://"
                            className="font-mono text-xs md:text-xs"
                            {...field}
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="appName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>App name</FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="off"
                            placeholder="TestApp"
                            {...field}
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="serviceUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service username</FormLabel>
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
                  <FormField
                    control={form.control}
                    name="servicePassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service password</FormLabel>
                        <FormControl>
                          <PasswordInput
                            autoComplete="new-password"
                            {...field}
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ehrUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>EHR username</FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="off"
                            {...field}
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Every Unity API action runs as this Veradigm EHR user.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ehrPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>EHR password</FormLabel>
                        <FormControl>
                          <PasswordInput
                            autoComplete="new-password"
                            {...field}
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Unity checks it together with the EHR username before
                          running any action.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ubiquityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Ubiquity ID
                          <span className="font-normal text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="off"
                            placeholder="AHMCP00101"
                            className="font-mono text-xs md:text-xs"
                            {...field}
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          When set, ConnectHealth adds it to the start of the
                          service username.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
