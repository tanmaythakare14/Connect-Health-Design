import type { SignInFormValues } from '../components/sign-in/schema';

export type { SignInFormValues };

export interface SignInScreenProps {
  onSignedIn: (username: string) => void;
}

export interface SignInFormProps {
  onSubmit: (values: SignInFormValues) => Promise<void>;
}

export interface ConnectedSystemNode {
  label: string;
  x: number;
  y: number;
}
