import type { ComponentProps } from 'react';
import type { SignInFormValues } from '../components/sign-in/schema';

export type { SignInFormValues };

export interface SignInScreenProps {
  onSignedIn: (username: string) => void;
}

export interface SignInFormProps {
  onSubmit: (values: SignInFormValues) => Promise<void>;
}

export type PasswordInputProps = Omit<ComponentProps<'input'>, 'type'>;

export interface ConnectedSystemNode {
  label: string;
  x: number;
  y: number;
}
