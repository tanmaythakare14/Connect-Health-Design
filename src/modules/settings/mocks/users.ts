import type { AdminUserApiDto, TwoFactorSettingsApiDto } from '../@types';
import { USER_ROLE } from '../constants';

const MOCK_USER_ROWS: Array<
  [
    name: string | null,
    username: string,
    email: string | null,
    mustResetPassword: boolean,
    twoFactorEnabled: boolean,
  ]
> = [
  ['Administrator', 'administrator', null, false, true],
  ['Mayuraj', 'mayur', null, false, false],
  ['Suraj', 'suraj', 'suraj.thapa@mindbowser.com', false, false],
  ['Manas', 'manas', null, false, true],
  ['QA Test User', 'qa-user-1791180548050', 'qa-user@example.com', true, false],
  [null, 'mind', null, false, true],
  ['Sanket', 'sanket', 'sanket@yopmail.com', false, false],
];

/**
 * MOCK console users. Mutable: adds, password resets and deletes persist
 * while the app is open. Delete once the users API exists.
 */
export const MOCK_ADMIN_USERS: AdminUserApiDto[] = MOCK_USER_ROWS.map(
  ([name, username, email, mustResetPassword, twoFactorEnabled], index) => ({
    id: `user-${index + 1}`,
    name,
    username,
    email,
    role: USER_ROLE.ADMIN,
    mustResetPassword,
    twoFactorEnabled,
    isBuiltIn: index === 0,
  }),
);

/** MOCK two-factor setup for the signed-in user. */
export const MOCK_TWO_FACTOR_SETTINGS: TwoFactorSettingsApiDto = {
  isEnrolled: true,
  requireOnLogin: false,
};

/** MOCK: the signed-in user's current password, so the form can be tried out. */
export const MOCK_CURRENT_PASSWORD = 'Admin@123';
