import { Toaster as Sonner, type ToasterProps } from 'sonner';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

type ToastClassNames = NonNullable<
  NonNullable<ToasterProps['toastOptions']>['classNames']
>;

/**
 * Theme-token styling for every toast. Sonner's own look is switched off
 * (`unstyled`) so these classes are the single source of truth, and token
 * classes (bg-popover, text-muted-foreground…) follow light/dark mode.
 */
const DEFAULT_CLASS_NAMES: ToastClassNames = {
  toast:
    'flex w-(--width) items-start gap-3 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg',
  icon: 'mt-0.5 flex size-4 shrink-0 items-center justify-center [&>svg]:size-4',
  content: 'flex min-w-0 flex-1 flex-col gap-1',
  title: 'text-sm font-semibold leading-tight',
  description: 'text-sm text-muted-foreground',
  actionButton: cn(buttonVariants({ size: 'sm' }), 'h-7 shrink-0 px-2.5'),
  cancelButton: cn(
    buttonVariants({ variant: 'outline', size: 'sm' }),
    'h-7 shrink-0 px-2.5',
  ),
  closeButton:
    'border-border bg-popover text-muted-foreground hover:text-foreground',
  // Only the icon carries the type colour; the toast itself stays neutral.
  success:
    '[&_[data-icon]]:text-emerald-600 dark:[&_[data-icon]]:text-emerald-400',
  info: '[&_[data-icon]]:text-primary',
  warning: '[&_[data-icon]]:text-amber-600 dark:[&_[data-icon]]:text-amber-400',
  error: '[&_[data-icon]]:text-destructive',
};

/**
 * shadcn/ui Sonner, adapted for this project:
 * - `theme` is passed in (the app's theme lives in Redux, not next-themes).
 * - Toasts are styled with our theme tokens via `toastOptions.classNames`.
 *   Pass your own `toastOptions.classNames` to override individual slots;
 *   they're merged over the defaults with tailwind-merge.
 */
function Toaster({ toastOptions, ...props }: ToasterProps) {
  const overrides = toastOptions?.classNames ?? {};
  const classNames = Object.fromEntries(
    (
      Object.keys({ ...DEFAULT_CLASS_NAMES, ...overrides }) as Array<
        keyof ToastClassNames
      >
    ).map((slot) => [slot, cn(DEFAULT_CLASS_NAMES[slot], overrides[slot])]),
  ) as ToastClassNames;

  return (
    <Sonner
      className="toaster group"
      {...props}
      toastOptions={{ unstyled: true, ...toastOptions, classNames }}
    />
  );
}

export { Toaster };
