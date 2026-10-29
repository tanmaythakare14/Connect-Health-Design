import type { JSX } from 'react';
import { Network } from 'lucide-react';
import { logger } from '@/utils/logger';
import { PRODUCT_NAME } from '../../constants';
import type { SignInFormValues, SignInScreenProps } from '../../@types';
import { OnboardingLeftPanel } from '../onboarding-left-panel';
import { SignInForm } from './SignInForm';

export function SignInScreen({ onSignedIn }: SignInScreenProps): JSX.Element {
  const handleSubmit = async (values: SignInFormValues): Promise<void> => {
    // MOCK:API — no auth endpoint exists yet; the delay only makes the loading state visible.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    logger.info('Sign-in submitted', { username: values.username });
    onSignedIn(values.username);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <OnboardingLeftPanel />

      <main className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10 lg:w-3/5 lg:px-20">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Network className="size-5" aria-hidden />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              {PRODUCT_NAME}
            </span>
          </div>

          <div className="mb-8 space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Sign in to your console
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to manage your health system connections.
            </p>
          </div>

          <SignInForm onSubmit={handleSubmit} />
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          © 2026 {PRODUCT_NAME}. All rights reserved.
        </p>
      </main>
    </div>
  );
}
